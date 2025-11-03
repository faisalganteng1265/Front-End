'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Create AI Neural Network - Nodes
    const nodes: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);

    // Create 3 layers of nodes (like neural network layers)
    const layers = [
      { count: 5, x: -4, color: 0x10b981 },  // Input layer - emerald
      { count: 8, x: 0, color: 0x14b8a6 },   // Hidden layer - teal
      { count: 4, x: 4, color: 0x10b981 }    // Output layer - emerald
    ];

    layers.forEach(layer => {
      const ySpacing = 8 / (layer.count + 1);
      for (let i = 0; i < layer.count; i++) {
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.8,
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(
          layer.x,
          -4 + ySpacing * (i + 1),
          (Math.random() - 0.5) * 2
        );
        nodes.push(node);
        scene.add(node);

        // Add glow effect to each node
        const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.2,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(node.position);
        scene.add(glow);
      }
    });

    // Create connections between nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
    });

    // Connect layer 1 to layer 2
    for (let i = 0; i < 5; i++) {
      for (let j = 5; j < 13; j++) {
        const points = [];
        points.push(nodes[i].position);
        points.push(nodes[j].position);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
      }
    }

    // Connect layer 2 to layer 3
    for (let i = 5; i < 13; i++) {
      for (let j = 13; j < 17; j++) {
        const points = [];
        points.push(nodes[i].position);
        points.push(nodes[j].position);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
      }
    }

    // Add floating particles for ambiance
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Gentle floating animation for nodes
      nodes.forEach((node, index) => {
        node.position.y += Math.sin(time + index * 0.5) * 0.001;
        node.position.z += Math.cos(time + index * 0.3) * 0.001;
      });

      // Slow rotation of particles
      particlesMesh.rotation.y += 0.0005;

      // Camera follows mouse smoothly
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      nodeGeometry.dispose();
      nodes.forEach(node => {
        (node.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Three.js Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a, #111827)' }}
      />

      {/* Main Content - AICAMPUS Text */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="text-[15vw] md:text-[12vw] lg:text-[10vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 leading-none tracking-tighter animate-pulse"
          style={{ fontFamily: 'Agency FB, sans-serif' }}
        >
          AICAMPUS
        </h1>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-emerald-500 to-teal-500 -z-10 animate-pulse"></div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6 text-emerald-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
