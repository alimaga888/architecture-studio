import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

function HouseModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl || "/models/homework.glb");

  useEffect(() => {
    if (!scene) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 1.5;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  }

  return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />;
}

// ✅ Preload модели для быстрой загрузки
useGLTF.preload("/models/homework.glb");

export default HouseModel;
