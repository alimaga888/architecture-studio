import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
} from "@react-three/drei";
import { useRef, Suspense } from "react";
import HouseModel from "./HouseModel";
import "./HomeHero.css";

function MovingLight() {
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.position.x = Math.sin(t * 0.5) * 5;
    lightRef.current.position.z = Math.cos(t * 0.5) * 5;
  });
  return (
    <directionalLight
      ref={lightRef}
      intensity={0.8}
      position={[5, 10, 5]}
      castShadow
    />
  );
}

function RotatingModel({ modelUrl }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
  });
  return (
    <group ref={ref} position={[0, 0, 0]} scale={5}>
      <HouseModel modelUrl={modelUrl} />
    </group>
  );
}

function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          padding: "20px",
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: "10px",
          color: "white",
          fontSize: "14px",
          letterSpacing: "2px",
        }}
      >
        ЗАГРУЗКА {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function HomeHero() {
  const scrollToOrder = () => {
    const OrderSection = document.getElementById("order");
    if (OrderSection) {
      OrderSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="hero-canvas-wrapper">
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <color attach="background" args={["#0a0a0f"]} />
          <ambientLight intensity={0.8} />

          <MovingLight />

          <Environment preset="night" />
          <Suspense fallback={<ModelLoader />}>
            <RotatingModel modelUrl="/models/homework.glb" />
          </Suspense>

          {/* <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        /> */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#0d0d12" />
          </mesh>
        </Canvas>
      </div>
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>Alyazhe</h1>
        <p className="hero-subtitle-main">
          архитектурное бюро с проектами в России, США и ОАЭ.
        </p>
        <p className="hero-subtitle-secondary">
          Мы проектируем жилые дома, коммерческие и общественные здания,
          благоустройство — более 200 реализованных объектов с 2020 года.
        </p>
        <button className="hero-button" onClick={scrollToOrder}>
          Заказать индивидуальный проект
        </button>
      </div>
    </section>
  );
}

export default HomeHero;
