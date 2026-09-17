"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface RadarSphere3DProps {
  particleCount?: number;
  className?: string;
  isCompact?: boolean;
}

export default function RadarSphere3D({
  particleCount = 1200,
  className = "",
  isCompact = false,
}: RadarSphere3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = isCompact ? 18 : 22;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // 1. Outer Hologram Wireframe Shells in Yellow
    const outerRadius = isCompact ? 5.5 : 7.2;
    const wireframeGeo = new THREE.IcosahedronGeometry(outerRadius, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    sphereGroup.add(wireframeMesh);

    // Latitudinal rings in Golden Amber
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.4,
    });
    [-3, -1.5, 0, 1.5, 3].forEach((yOffset) => {
      const ringRadius = Math.sqrt(Math.max(0, outerRadius * outerRadius - yOffset * yOffset));
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(theta) * ringRadius,
            yOffset,
            Math.sin(theta) * ringRadius
          )
        );
      }
      ringGeo.setFromPoints(points);
      const ring = new THREE.Line(ringGeo, ringMat);
      sphereGroup.add(ring);
    });

    // 2. Interior Stock Particles in Yellow/Gold Spectrum
    const count = isCompact ? Math.floor(particleCount * 0.5) : particleCount;
    const particlePositions = new Float32Array(count * 3);
    const particleColors = new Float32Array(count * 3);
    const particleOriginalBrightness = new Float32Array(count);

    const brightYellow = new THREE.Color(0xfef08a);
    const electricYellow = new THREE.Color(0xfacc15);
    const goldenAmber = new THREE.Color(0xeab308);
    const darkGold = new THREE.Color(0xd97706);

    for (let i = 0; i < count; i++) {
      const r = outerRadius * Math.cbrt(Math.random() * 0.95 + 0.05);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const randType = Math.random();
      let chosenColor = electricYellow;
      if (randType > 0.8) chosenColor = brightYellow;
      else if (randType > 0.45) chosenColor = goldenAmber;
      else if (randType > 0.2) chosenColor = darkGold;

      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
      particleOriginalBrightness[i] = chosenColor.r;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    // Particle sprite using canvas with yellow/gold radial gradient
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(250, 204, 21, 0.9)");
      gradient.addColorStop(0.8, "rgba(234, 179, 8, 0.3)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: isCompact ? 0.38 : 0.48,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    sphereGroup.add(particleSystem);

    // 3. Radar Sweep Fan in Electric Yellow
    const sweepSegments = 32;
    const sweepGeo = new THREE.BufferGeometry();
    const sweepPoints = [new THREE.Vector3(0, 0, 0)];
    for (let i = 0; i <= sweepSegments; i++) {
      const angle = (i / sweepSegments) * (Math.PI / 4);
      sweepPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * (outerRadius + 0.5),
          0,
          Math.sin(angle) * (outerRadius + 0.5)
        )
      );
    }
    sweepGeo.setFromPoints(sweepPoints);

    const indices = [];
    for (let i = 1; i <= sweepSegments; i++) {
      indices.push(0, i, i + 1);
    }
    sweepGeo.setIndex(indices);

    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
    sphereGroup.add(sweepMesh);

    // Controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotationY = normX * 0.4;
        targetRotationX = normY * 0.3;
        return;
      }
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
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
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMouseX;
        const deltaY = e.touches[0].clientY - previousMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
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
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      sphereGroup.rotation.y += 0.003;
      wireframeMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;

      sphereGroup.rotation.y += (targetRotationY - sphereGroup.rotation.y) * 0.05;
      sphereGroup.rotation.x += (targetRotationX - sphereGroup.rotation.x) * 0.05;

      sweepMesh.rotation.y = elapsedTime * 1.8;

      const currentSweepAngle = sweepMesh.rotation.y % (Math.PI * 2);
      const posAttr = particleGeometry.attributes.position;
      const colorAttr = particleGeometry.attributes.color;

      for (let i = 0; i < count; i += 8) {
        const px = posAttr.getX(i);
        const pz = posAttr.getZ(i);
        let pAngle = Math.atan2(pz, px);
        if (pAngle < 0) pAngle += Math.PI * 2;

        const diff = Math.abs(pAngle - currentSweepAngle);
        if (diff < 0.25 || diff > Math.PI * 2 - 0.25) {
          colorAttr.setXYZ(i, 1.0, 1.0, 0.4); // Brilliant gold flash
        } else {
          colorAttr.setXYZ(
            i,
            particleOriginalBrightness[i] * 0.9,
            particleOriginalBrightness[i] * 0.8,
            0.1
          );
        }
      }
      colorAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      sweepGeo.dispose();
      sweepMat.dispose();
    };
  }, [particleCount, isCompact]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    />
  );
}
