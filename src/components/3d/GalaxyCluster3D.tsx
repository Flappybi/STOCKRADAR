"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRadar } from "@/context/RadarContext";
import { StockData, SectorCluster } from "@/types/stock";
import { soundFx } from "@/utils/soundEngine";

const SECTOR_COLORS: Record<SectorCluster, number> = {
  Banking: 0xfacc15,       // Electric Yellow
  "Energy & Mining": 0xf59e0b, // Amber Gold
  "Consumer Goods": 0xd97706,  // Deep Gold
  Technology: 0xfef08a,        // Bright Sunlight Gold
  Healthcare: 0xf97316,        // Warm Orange-Gold
};

export default function GalaxyCluster3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stocks, selectedSymbol, setSelectedSymbol, setCurrentView } = useRadar();
  const [activeStock, setActiveStock] = useState<StockData | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 35, 60);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const galaxyRoot = new THREE.Group();
    scene.add(galaxyRoot);

    // 1. Ambient Galactic Background Stars in Yellow/Gold/White
    const dustCount = 2400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const r = Math.random() * 55 + 4;
      const arms = 3;
      const spinAngle = r * 0.18;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const angle = armAngle + spinAngle + (Math.random() - 0.5) * 0.8;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * (14 - r * 0.18);

      dustPos[i * 3] = x;
      dustPos[i * 3 + 1] = y;
      dustPos[i * 3 + 2] = z;

      // Warm yellow/gold hue spectrum (hue around 0.12 - 0.16)
      const mixed = new THREE.Color().setHSL(0.12 + Math.random() * 0.05, 0.95, 0.55 + Math.random() * 0.35);
      dustColors[i * 3] = mixed.r;
      dustColors[i * 3 + 1] = mixed.g;
      dustColors[i * 3 + 2] = mixed.b;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    galaxyRoot.add(dustPoints);

    // 2. Central Supermassive AI Core in Yellow
    const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    galaxyRoot.add(coreMesh);

    // 3. Stock Nodes
    const stockNodesGroup = new THREE.Group();
    galaxyRoot.add(stockNodesGroup);
    const raycastMeshes: THREE.Mesh[] = [];

    stocks.forEach((stock) => {
      const [gx, gy, gz] = stock.galaxyCoords;
      const sectorColor = SECTOR_COLORS[stock.sector] || 0xfacc15;

      const nodeGeo = new THREE.SphereGeometry(1.2, 20, 20);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: sectorColor,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(gx, gy, gz);
      nodeMesh.userData = { stock };

      const haloGeo = new THREE.RingGeometry(1.6, 2.0, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: sectorColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      nodeMesh.add(halo);

      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(gx, gy, gz),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: sectorColor,
        transparent: true,
        opacity: 0.22,
      });
      galaxyRoot.add(new THREE.Line(beamGeo, beamMat));

      stockNodesGroup.add(nodeMesh);
      raycastMeshes.push(nodeMesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.25;
    let rotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rotY += deltaX * 0.005;
        rotX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * 0.05,
        25,
        120
      );
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const stock = hit.userData?.stock as StockData | undefined;
        if (stock) {
          soundFx.playSignalLock();
          setSelectedSymbol(stock.symbol);
          setActiveStock(stock);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    dom.addEventListener("mousemove", onMouseMove);
    dom.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("click", onClick);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        rotY += deltaX * 0.007;
        rotX += deltaY * 0.007;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    dom.addEventListener("touchmove", onTouchMove, { passive: true });
    dom.addEventListener("touchend", onTouchEnd, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      galaxyRoot.rotation.y += 0.0012;
      galaxyRoot.rotation.y += (rotY - galaxyRoot.rotation.y) * 0.05;
      galaxyRoot.rotation.x += (rotX - galaxyRoot.rotation.x) * 0.05;

      coreMesh.rotation.y = elapsed * 0.5;
      coreMesh.rotation.x = elapsed * 0.3;

      raycastMeshes.forEach((mesh) => {
        const s = mesh.userData?.stock as StockData;
        if (s.symbol === selectedSymbol) {
          const sc = 1.35 + Math.sin(elapsed * 5) * 0.25;
          mesh.scale.set(sc, sc, sc);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", onMouseDown);
      dom.removeEventListener("mousemove", onMouseMove);
      dom.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("click", onClick);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, [stocks, selectedSymbol, setSelectedSymbol]);

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center select-none overflow-hidden rounded-2xl bg-black border border-yellow-500/30">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header HUD overlay */}
      <div className="absolute top-4 left-6 pointer-events-none">
        <div className="text-xs font-mono text-yellow-400 tracking-widest uppercase font-bold">
          RADAR MAP // 3D CELESTIAL UNIVERSE
        </div>
        <h2 className="text-xl font-bold font-mono text-white tracking-wide">
          INDONESIAN EQUITY GALAXY
        </h2>
        <div className="text-xs text-yellow-200/70 mt-0.5">
          Rotate / Zoom to explore sector nebulae. Click star nodes to inspect.
        </div>
      </div>

      {/* Sector Galaxy Clusters Legend */}
      <div className="absolute top-4 right-6 bg-black/85 backdrop-blur-md border border-yellow-500/30 rounded-xl p-3 text-xs space-y-1.5 shadow-xl">
        <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1 font-bold">
          Galactic Sectors
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] shadow-[0_0_8px_#facc15]" />
          <span className="text-yellow-100">Banking Nebula</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
          <span className="text-yellow-100">Energy & Mining</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shadow-[0_0_8px_#d97706]" />
          <span className="text-yellow-100">Consumer Goods</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fef08a] shadow-[0_0_8px_#fef08a]" />
          <span className="text-yellow-100">Technology & Telco</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
          <span className="text-yellow-100">Healthcare</span>
        </div>
      </div>

      {/* Hologram Stock Card Overlay when clicked */}
      {activeStock && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 z-30 bg-black/95 backdrop-blur-xl border border-yellow-400/50 rounded-2xl p-5 shadow-[0_0_35px_rgba(250,204,21,0.35)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-mono text-yellow-400">
                  {activeStock.symbol}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  {activeStock.sector}
                </span>
              </div>
              <p className="text-xs text-yellow-100/90 font-medium mt-0.5">
                {activeStock.name}
              </p>
            </div>
            <button
              onClick={() => setActiveStock(null)}
              className="text-yellow-400/70 hover:text-white text-xs px-2 py-1 rounded bg-black border border-yellow-500/30"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-yellow-950">
            <div>
              <div className="text-[10px] font-mono text-yellow-400/70 uppercase">Radar Score</div>
              <div className="text-2xl font-black font-mono text-yellow-300">
                {activeStock.baseScore}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-yellow-400/70 uppercase">Current Price</div>
              <div className="text-xl font-bold font-mono text-white">
                IDR {activeStock.price.toLocaleString()}
              </div>
              <div
                className={`text-[11px] font-mono font-medium ${
                  activeStock.changePercent >= 0 ? "text-yellow-400" : "text-rose-400"
                }`}
              >
                {activeStock.changePercent >= 0 ? "+" : ""}
                {activeStock.changePercent}%
              </div>
            </div>
          </div>

          <div className="text-xs text-yellow-100/90 line-clamp-2 italic mb-4">
            &ldquo;{activeStock.aiAnalyst.verdict}&rdquo;
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedSymbol(activeStock.symbol);
                setCurrentView("detail");
              }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            >
              Deep Intelligence
            </button>
            <button
              onClick={() => {
                setSelectedSymbol(activeStock.symbol);
                setCurrentView("dashboard");
              }}
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-900 border border-yellow-500/40 text-xs font-semibold text-yellow-300 transition-all"
            >
              Command HUD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
