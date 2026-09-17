"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { StockData } from "@/types/stock";

interface HolographicCube3DProps {
  stock: StockData;
}

export default function HolographicCube3D({ stock }: HolographicCube3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 9.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const cubeRoot = new THREE.Group();
    scene.add(cubeRoot);

    // Create custom canvas texture for each cube face in Yellow & Black
    const createFaceTexture = (
      title: string,
      score: number,
      colorHex: string,
      metric1: string,
      metric2: string
    ) => {
      const cvs = document.createElement("canvas");
      cvs.width = 512;
      cvs.height = 512;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        // Deep obsidian black background with subtle gold grid
        ctx.fillStyle = "rgba(10, 10, 4, 0.92)";
        ctx.fillRect(0, 0, 512, 512);

        // Glowing yellow border
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 14;
        ctx.strokeRect(16, 16, 480, 480);

        // Inner tactical corners
        ctx.fillStyle = colorHex;
        ctx.fillRect(24, 24, 30, 30);
        ctx.fillRect(458, 24, 30, 30);
        ctx.fillRect(24, 458, 30, 30);
        ctx.fillRect(458, 458, 30, 30);

        // Header Title
        ctx.font = "bold 38px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        ctx.fillText(title.toUpperCase(), 256, 120);

        // Score Value in Cyber Yellow
        ctx.font = "bold 110px 'JetBrains Mono', monospace";
        ctx.fillStyle = colorHex;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 26;
        ctx.fillText(score.toString(), 256, 250);
        ctx.shadowBlur = 0;

        // Sub Metrics
        ctx.font = "24px 'Inter', sans-serif";
        ctx.fillStyle = "#fef08a";
        ctx.fillText(metric1, 256, 360);
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText(metric2, 256, 410);
      }
      return new THREE.CanvasTexture(cvs);
    };

    const materials = [
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Quality", stock.metrics.quality, "#facc15", `ROE: ${stock.financials.roe}`, `PBV: ${stock.financials.pbv}`),
        transparent: true,
        opacity: 0.9,
      }),
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Growth", stock.metrics.growth, "#fde047", `EPS: ${stock.financials.epsGrowth}`, `FCF Yield: ${stock.financials.fcfYield}`),
        transparent: true,
        opacity: 0.9,
      }),
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Radar Alpha", stock.baseScore, "#ffd700", stock.symbol, `Confidence: 96.4%`),
        transparent: true,
        opacity: 0.95,
      }),
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Value", stock.metrics.value, "#eab308", `P/E: ${stock.financials.per}`, `Div: ${stock.financials.dividendYield}`),
        transparent: true,
        opacity: 0.9,
      }),
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Momentum", stock.metrics.momentum, "#f59e0b", `Beta: ${stock.financials.volatilityBeta}`, `6M Trend: +18.4%`),
        transparent: true,
        opacity: 0.9,
      }),
      new THREE.MeshBasicMaterial({
        map: createFaceTexture("Risk Safety", stock.metrics.risk, "#fbbf24", `D/E: ${stock.financials.debtToEquity}`, `NPL: Pristine 0.6%`),
        transparent: true,
        opacity: 0.9,
      }),
    ];

    const cubeGeo = new THREE.BoxGeometry(3.6, 3.6, 3.6);
    const cubeMesh = new THREE.Mesh(cubeGeo, materials);
    cubeRoot.add(cubeMesh);

    // Glowing Wireframe Edge Shell in Yellow
    const wireframeGeo = new THREE.BoxGeometry(3.64, 3.64, 3.64);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    cubeRoot.add(wireframeMesh);

    // Inner Glowing Core
    const coreGeo = new THREE.OctahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cubeRoot.add(coreMesh);

    // Orbiting Yellow Rings
    const orbitRingGeo = new THREE.RingGeometry(2.9, 3.0, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    ring1.rotation.x = Math.PI / 3;
    cubeRoot.add(ring1);

    const ring2 = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    ring2.rotation.y = Math.PI / 3;
    cubeRoot.add(ring2);

    // Orbiting Gold Particles
    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const radius = 3.2 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    cubeRoot.add(pSystem);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0.5;
    let targetRotX = 0.3;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

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
        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
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

      cubeRoot.rotation.y += 0.004;
      cubeRoot.rotation.y += (targetRotY - cubeRoot.rotation.y) * 0.06;
      cubeRoot.rotation.x += (targetRotX - cubeRoot.rotation.x) * 0.06;

      coreMesh.rotation.x = elapsed * 1.2;
      coreMesh.rotation.y = elapsed * 1.5;
      const scale = 1 + Math.sin(elapsed * 4) * 0.15;
      coreMesh.scale.set(scale, scale, scale);

      ring1.rotation.z = elapsed * 0.6;
      ring2.rotation.z = -elapsed * 0.8;
      pSystem.rotation.y = elapsed * 0.1;

      cubeRoot.position.y = Math.sin(elapsed * 1.5) * 0.18;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      cubeGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, [stock]);

  return (
    <div className="relative w-full h-[420px] flex items-center justify-center select-none overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3 text-center pointer-events-none text-xs text-yellow-400/80 font-mono tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
        DRAG TO ROTATE FINANCIAL CORE (QUALITY • GROWTH • MOMENTUM • VALUE • RISK)
      </div>
    </div>
  );
}
