import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';

// Parámetros de idle por mood: qué tanto "respira" y gira Sofi cuando no
// está haciendo un gesto especial.
const MOOD_IDLE = {
  neutral: { bobAmp: 0.05, bobSpeed: 1.5, rotAmp: 0.15, rotSpeed: 0.6 },
  curiosa: { bobAmp: 0.04, bobSpeed: 1.1, rotAmp: 0.3, rotSpeed: 0.4 },
  animando: { bobAmp: 0.08, bobSpeed: 2.4, rotAmp: 0.12, rotSpeed: 2.2 },
  celebrando: { bobAmp: 0.14, bobSpeed: 3.2, rotAmp: 0.25, rotSpeed: 1.4 },
};

function SofiModel({ reducedMotion, mood = 'neutral' }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/sofi.glb');
  // Próximo "salto" espontáneo (en segundos de reloj), para que Sofi se sienta
  // viva aunque no haya mensaje activo. Intervalo aleatorio, no un timer fijo.
  const nextHopRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    const { bobAmp, bobSpeed, rotAmp, rotSpeed } = MOOD_IDLE[mood] || MOOD_IDLE.neutral;

    if (nextHopRef.current === null) {
      nextHopRef.current = t + 20 + Math.random() * 20;
    }

    let hopBoost = 0;
    if (mood === 'neutral' && t >= nextHopRef.current) {
      const sinceHop = t - nextHopRef.current;
      if (sinceHop < 0.6) {
        hopBoost = Math.sin((sinceHop / 0.6) * Math.PI) * 0.18;
      } else {
        nextHopRef.current = t + 20 + Math.random() * 20;
      }
    }

    groupRef.current.position.y = Math.sin(t * bobSpeed) * bobAmp + hopBoost;
    groupRef.current.rotation.y = Math.sin(t * rotSpeed) * rotAmp;
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
      <meshBasicMaterial color="#f5a623" />
    </mesh>
  );
}

export default function SofiMascot({ size = 72, reducedMotion = false, mood = 'neutral' }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 2.2], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <Suspense fallback={<SofiFallback />}>
          <SofiModel reducedMotion={reducedMotion} mood={mood} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/sofi.glb');
