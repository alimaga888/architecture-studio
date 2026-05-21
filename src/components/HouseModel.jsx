import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

function HouseModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl || "/models/homework.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!cloned) return;

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 1.5;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [cloned]);

  if (!cloned) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  }

  return <primitive object={cloned} scale={1.5} position={[0, -0.5, 0]} />;
}

// ✅ Preload модели для быстрой загрузки
useGLTF.preload("/models/homework.glb");

export default HouseModel;
