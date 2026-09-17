"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRadar } from "@/context/RadarContext";
import { StockData } from "@/types/stock";
import { soundFx } from "@/utils/soundEngine";

interface HoveredStockInfo {
  stock: StockData;
  x: number;
  y: number;
}

export default function MarketGlobe3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stocks, selectedSymbol, setSelectedSymbol } = useRadar();
  const [hoveredInfo, setHoveredInfo] = useState<HoveredStockInfo | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Holographic Base Sphere in Yellow/Black
    const globeRadius = 4.8;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x332605,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(globeRadius * 0.96, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.06,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Equatorial and orbital rings in Electric Yellow
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.45,
    });
    [0, -1.8, 1.8].forEach((yPos) => {
      const r = Math.sqrt(Math.max(0, globeRadius * globeRadius - yPos * yPos));
      const rGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * r, yPos, Math.sin(a) * r));
      }
      rGeo.setFromPoints(points);
      globeGroup.add(new THREE.Line(rGeo, ringMat));
    });

    // 2. Stock Particle Nodes
    const stockMeshes: { mesh: THREE.Mesh; stock: StockData }[] = [];
    const raycastGroup = new THREE.Group();
    globeGroup.add(raycastGroup);

    // Color definitions for yellow-black theme
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    stocks.forEach((stock, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / stocks.length);
      const theta = Math.sqrt(stocks.length * Math.PI) * phi;

      const x = globeRadius * Math.cos(theta) * Math.sin(phi);
      const y = globeRadius * Math.sin(theta) * Math.sin(phi);
      const z = globeRadius * Math.cos(phi);

      const nodeGeo = new THREE.SphereGeometry(0.25, 16, 16);
      let mat = yellowMat;
      if (stock.status === "Neutral") mat = amberMat;
      else if (stock.status === "Risk") mat = redMat;

      const nodeMesh = new THREE.Mesh(nodeGeo, mat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { stockSymbol: stock.symbol, stock };

      const haloGeo = new THREE.RingGeometry(0.32, 0.44, 16);
      const haloMesh = new THREE.Mesh(haloGeo, mat);
      haloMesh.lookAt(x * 2, y * 2, z * 2);
      nodeMesh.add(haloMesh);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: mat.color,
        transparent: true,
        opacity: 0.2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      raycastGroup.add(nodeMesh);
      stockMeshes.push({ mesh: nodeMesh, stock });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.2;
    let rotY = 0.5;

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
        rotY += deltaX * 0.008;
        rotX += deltaY * 0.008;
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
        camera.position.z + e.deltaY * 0.015,
        10,
        25
      );
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastGroup.children, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const stock = hit.userData?.stock as StockData | undefined;
        if (stock) {
          soundFx.playSignalLock();
          setSelectedSymbol(stock.symbol);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    dom.addEventListener("mousemove", onMouseMove);
    dom.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("click", onClick);

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

      globeGroup.rotation.y += 0.002;
      globeGroup.rotation.y += (rotY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (rotX - globeGroup.rotation.x) * 0.08;

      stockMeshes.forEach(({ mesh, stock }) => {
        const isSelected = stock.symbol === selectedSymbol;
        if (isSelected) {
          const scale = 1.35 + Math.sin(elapsed * 6) * 0.25;
          mesh.scale.set(scale, scale, scale);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastGroup.children, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const stock = hit.userData?.stock as StockData | undefined;
        if (stock) {
          const rect = renderer.domElement.getBoundingClientRect();
          const worldPos = new THREE.Vector3();
          hit.getWorldPosition(worldPos);
          worldPos.project(camera);
          const screenX = ((worldPos.x + 1) * rect.width) / 2;
          const screenY = ((-worldPos.y + 1) * rect.height) / 2;

          setHoveredInfo({
            stock,
            x: screenX,
            y: screenY,
          });
        }
      } else {
        setHoveredInfo(null);
      }

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
      window.removeEventListener("resize", handleResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, [stocks, selectedSymbol, setSelectedSymbol]);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center select-none overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Mini Hover HUD Card */}
      {hoveredInfo && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredInfo.x, top: hoveredInfo.y }}
        >
          <div className="bg-black/95 backdrop-blur-md border border-yellow-400/60 rounded-xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(250,204,21,0.5)] text-xs min-w-[150px]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono font-bold text-yellow-400 text-sm">
                {hoveredInfo.stock.symbol}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  hoveredInfo.stock.status === "Strong"
                    ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
                    : hoveredInfo.stock.status === "Neutral"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {hoveredInfo.stock.status}
              </span>
            </div>
            <div className="text-yellow-100 truncate text-[11px]">
              {hoveredInfo.stock.name}
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-yellow-900/50">
              <span className="text-yellow-400/70">Radar Score</span>
              <span className="font-mono font-bold text-white text-xs">
                {hoveredInfo.stock.baseScore}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-yellow-400/70">Sector</span>
              <span className="text-yellow-300 font-medium truncate max-w-[80px]">
                {hoveredInfo.stock.sector}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mini Cluster Legend Overlay in Yellow-Black */}
      <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-1.5 text-[10px] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
          <span className="text-yellow-200">Strong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
          <span className="text-amber-200">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
          <span className="text-rose-200">Risk</span>
        </div>
      </div>
    </div>
  );
}
