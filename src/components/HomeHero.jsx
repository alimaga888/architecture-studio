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
      intensity={2}
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
      <Canvas camera={{ position: [0, 2, 4], fov: 45 }}>
        <color attach="background" args={["#f3f3f3"]} />
        <ambientLight intensity={1.2} />

        <MovingLight />

        <Environment preset="sunset" />
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
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
      </Canvas>
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>Архитектура создающая пространство</h1>
        <p>Современные жилые проекты и частные дома</p>
        <button className="hero-button" onClick={scrollToOrder}>
          Заказать индивидуальный проект
        </button>
      </div>
    </section>
  );
}

export default HomeHero;
