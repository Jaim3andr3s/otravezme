import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Parámetros de idle por mood
const MOOD_IDLE = {
  neutral: { bobAmp: 0.06, bobSpeed: 1.5, rotAmp: 0.18, rotSpeed: 0.6 },
  curiosa: { bobAmp: 0.05, bobSpeed: 1.1, rotAmp: 0.32, rotSpeed: 0.4 },
  animando: { bobAmp: 0.1, bobSpeed: 2.4, rotAmp: 0.16, rotSpeed: 2.2 },
  celebrando: { bobAmp: 0.16, bobSpeed: 3.2, rotAmp: 0.28, rotSpeed: 1.4 },
};

const MOOD_DANCE = {
  neutral: { armLift: 0.35, armSpeed: 1.6, hipSway: 0.12, hipSpeed: 1.6, spineTwist: 0.08 },
  curiosa: { armLift: 0.3, armSpeed: 1.3, hipSway: 0.1, hipSpeed: 1.3, spineTwist: 0.1 },
  animando: { armLift: 0.85, armSpeed: 3.4, hipSway: 0.22, hipSpeed: 3.4, spineTwist: 0.16 },
  celebrando: { armLift: 1.35, armSpeed: 4.6, hipSway: 0.32, hipSpeed: 4.6, spineTwist: 0.22 },
};

const BONE_NAMES = {
  jaw: 'CC_Base_JawRoot',
  lUpper: 'CC_Base_L_Upperarm',
  rUpper: 'CC_Base_R_Upperarm',
  lFore: 'CC_Base_L_Forearm',
  rFore: 'CC_Base_R_Forearm',
  hip: 'CC_Base_Hip',
  spine01: 'CC_Base_Spine01',
  spine02: 'CC_Base_Spine02',
  head: 'CC_Base_Head',
};

const TARGET_HEIGHT = 2.0;
const FALLBACK_COLOR = '#e8a15c';

function SofiModel({ reducedMotion, mood = 'neutral', talking = false }) {
  const groupRef = useRef();
  const rigRef = useRef();
  const { scene } = useGLTF('/models/sofi.glb');

  const bonesRef = useRef({});
  const baseQuatRef = useRef({});
  const nextHopRef = useRef(null);
  const talkPhaseRef = useRef(0);
  const idleMouthRef = useRef(0);

  useEffect(() => {
    const bones = {};
    scene.traverse((obj) => {
      const key = Object.keys(BONE_NAMES).find((k) => BONE_NAMES[k] === obj.name);
      if (key) bones[key] = obj;
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          if (mat && mat.color) mat.color.set(FALLBACK_COLOR);
        });
      }
    });
    bonesRef.current = bones;

    const base = {};
    Object.entries(bones).forEach(([key, bone]) => {
      base[key] = bone.quaternion.clone();
    });
    baseQuatRef.current = base;

    if (import.meta.env.DEV && Object.keys(bones).length === 0) {
      console.warn('[SofiMascot] No se encontró ningún hueso conocido en sofi.glb. Revisa los nombres del rig.');
    }
  }, [scene]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const bones = bonesRef.current;
    const base = baseQuatRef.current;

    if (groupRef.current && !reducedMotion) {
      const { bobAmp, bobSpeed, rotAmp, rotSpeed } = MOOD_IDLE[mood] || MOOD_IDLE.neutral;
      if (nextHopRef.current === null) nextHopRef.current = t + 20 + Math.random() * 20;
      let hopBoost = 0;
      if (mood === 'neutral' && t >= nextHopRef.current) {
        const sinceHop = t - nextHopRef.current;
        if (sinceHop < 0.6) hopBoost = Math.sin((sinceHop / 0.6) * Math.PI) * 0.18;
        else nextHopRef.current = t + 20 + Math.random() * 20;
      }
      groupRef.current.position.y = Math.sin(t * bobSpeed) * bobAmp + hopBoost;
      groupRef.current.rotation.y = Math.sin(t * rotSpeed) * rotAmp;
    }

    if (reducedMotion) return;

    const { armLift, armSpeed, hipSway, hipSpeed, spineTwist } = MOOD_DANCE[mood] || MOOD_DANCE.neutral;

    if (bones.lUpper && base.lUpper) {
      const lift = Math.sin(t * armSpeed) * armLift;
      const forward = Math.cos(t * armSpeed * 0.7) * armLift * 0.25;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(forward, 0, -Math.max(0, lift)));
      bones.lUpper.quaternion.copy(base.lUpper).multiply(q);
    }
    if (bones.rUpper && base.rUpper) {
      const lift = Math.sin(t * armSpeed + Math.PI) * armLift;
      const forward = Math.cos(t * armSpeed * 0.7 + Math.PI) * armLift * 0.25;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(forward, 0, Math.max(0, lift)));
      bones.rUpper.quaternion.copy(base.rUpper).multiply(q);
    }
    if (bones.lFore && base.lFore) {
      const bend = 0.2 + Math.max(0, Math.sin(t * armSpeed)) * armLift * 0.5;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -bend));
      bones.lFore.quaternion.copy(base.lFore).multiply(q);
    }
    if (bones.rFore && base.rFore) {
      const bend = 0.2 + Math.max(0, Math.sin(t * armSpeed + Math.PI)) * armLift * 0.5;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, bend));
      bones.rFore.quaternion.copy(base.rFore).multiply(q);
    }
    if (bones.hip && base.hip) {
      const sway = Math.sin(t * hipSpeed) * hipSway;
      const twist = Math.cos(t * hipSpeed * 0.5) * hipSway * 0.4;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, twist, sway));
      bones.hip.quaternion.copy(base.hip).multiply(q);
    }
    if (bones.spine01 && base.spine01) {
      const twist = Math.sin(t * hipSpeed * 0.6 + 1) * spineTwist;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, twist, 0));
      bones.spine01.quaternion.copy(base.spine01).multiply(q);
    }
    if (bones.spine02 && base.spine02) {
      const twist = Math.sin(t * hipSpeed * 0.6) * spineTwist * 0.8;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -twist, 0));
      bones.spine02.quaternion.copy(base.spine02).multiply(q);
    }
    if (bones.head && base.head) {
      const nod = Math.sin(t * hipSpeed * 0.8 + 2) * 0.06;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, nod, -nod * 0.5));
      bones.head.quaternion.copy(base.head).multiply(q);
    }

    if (bones.jaw && base.jaw) {
      if (talking) {
        talkPhaseRef.current += delta * 9;
        const open = (Math.sin(talkPhaseRef.current) * 0.5 + 0.5) * 0.35;
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(open, 0, 0));
        bones.jaw.quaternion.copy(base.jaw).multiply(q);
      } else {
        talkPhaseRef.current = 0;
        idleMouthRef.current += delta;
        const flutter = Math.max(0, Math.sin(idleMouthRef.current * 0.5)) ** 6 * 0.08;
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(flutter, 0, 0));
        bones.jaw.quaternion.slerp(base.jaw.clone().multiply(q), Math.min(1, delta * 6));
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <group ref={rigRef} scale={TARGET_HEIGHT}>
          <primitive object={scene} />
        </group>
      </Center>
    </group>
  );
}

function SofiFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
      <meshBasicMaterial color="#e8a15c" />
    </mesh>
  );
}

export default function SofiMascot({ 
  reducedMotion = false, 
  mood = 'neutral', 
  talking = false,
  onLoad,
  onError
}) {
  const [hasError, setHasError] = useState(false);

  // Notificar errores al padre para usar el fallback SVG
  useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  // Si el modelo falla, mostramos el fallback de Three (cápsula naranja)
  // pero el padre también puede reemplazar con SVG.
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-[#e8a15c] border-2 border-[#f3eadc]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 3.6], fov: 35 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} />
        <directionalLight position={[-2, 1, -2]} intensity={0.5} />
        <Suspense fallback={<SofiFallback />}>
          <SofiModel reducedMotion={reducedMotion} mood={mood} talking={talking} />
          <ContactShadows position={[0, -1, 0]} opacity={0.35} scale={3} blur={2} far={2} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/sofi.glb');