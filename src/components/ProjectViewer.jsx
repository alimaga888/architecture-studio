import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import HouseModel from "./HouseModel";
import { act, Suspense } from "react";
import { Html, useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import "./Loader.css";

function PremiumLoader() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active) {
      setTimeout(() => setVisible(false), 500);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <Html center>
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="spinner" />
          <div className="loader-text">LOADING {progress.toFixed(0)}%</div>
        </div>
      </div>
    </Html>
  );
}

function ProjectViewer({ modelUrl, coverImage, projectTitle }) {
  if (!modelUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={coverImage}
          alt={projectTitle || "Проект"}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow: "0 0 30px rgba(0, 240, 255, 0.2)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            background: "rgba(0, 240, 255, 0.1)",
            border: "1px solid var(--neon-cyan)",
            borderRadius: "6px",
            color: "var(--neon-cyan)",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "1px",
            backdropFilter: "blur(10px)",
          }}
        >
          3D модель недоступна
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [3, 2, 3], fov: 10 }}>
        {/*Свет*/}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/*крутеть вертеть осматривать все дела*/}
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={1}
          maxDistance={15}
        />

        {/*Окружение(небо/и свет) */}
        <Environment preset="city" />
        <Suspense fallback={<PremiumLoader />}>
          <HouseModel modelUrl={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default ProjectViewer;
