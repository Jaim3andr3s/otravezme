import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export function SofiMascot({ size = 100, reducedMotion = false }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Suspense fallback={<SofiFallback size={size} />}>
        <SofiModel size={size} reducedMotion={reducedMotion} />
      </Suspense>
    </div>
  );
}

function SofiFallback({ size }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-surface-alt text-accent font-serif font-semibold"
      style={{ width: size, height: size }}
    >
      S
    </div>
  );
}

function SofiModel({ size, reducedMotion }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/sofi.glb');

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    // Flotar suave (seno)
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.04;
    // Balanceo (seno)
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.02;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.01;
  });

  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={scene} scale={size / 200} ref={groupRef} />;
}