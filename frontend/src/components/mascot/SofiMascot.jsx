import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';

function SofiModel({ reducedMotion }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/sofi.glb');

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function SofiFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#b4502e" />
    </mesh>
  );
}

export default function SofiMascot({ size = 72, reducedMotion = false }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 2.2], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <Suspense fallback={<SofiFallback />}>
          <SofiModel reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/sofi.glb');