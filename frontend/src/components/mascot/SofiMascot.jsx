import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Parámetros de idle por mood: qué tanto "respira" y gira Sofi cuando no
// está haciendo un gesto especial.
const MOOD_IDLE = {
  neutral: { bobAmp: 0.06, bobSpeed: 1.5, rotAmp: 0.18, rotSpeed: 0.6 },
  curiosa: { bobAmp: 0.05, bobSpeed: 1.1, rotAmp: 0.32, rotSpeed: 0.4 },
  animando: { bobAmp: 0.1, bobSpeed: 2.4, rotAmp: 0.16, rotSpeed: 2.2 },
  celebrando: { bobAmp: 0.16, bobSpeed: 3.2, rotAmp: 0.28, rotSpeed: 1.4 },
};

// "Baile" base: Sofi siempre está bailando un poco, no solo respirando.
// Cadera y torso se mueven en contratiempo para que se note vida incluso
// en mood neutral; celebrando la lleva a un baile grande y notorio.
const MOOD_DANCE = {
  neutral: { armLift: 0.35, armSpeed: 1.6, hipSway: 0.12, hipSpeed: 1.6, spineTwist: 0.08 },
  curiosa: { armLift: 0.3, armSpeed: 1.3, hipSway: 0.1, hipSpeed: 1.3, spineTwist: 0.1 },
  animando: { armLift: 0.85, armSpeed: 3.4, hipSway: 0.22, hipSpeed: 3.4, spineTwist: 0.16 },
  celebrando: { armLift: 1.35, armSpeed: 4.6, hipSway: 0.32, hipSpeed: 4.6, spineTwist: 0.22 },
};

// Nombres de huesos del rig CC_Base (Character Creator / Reallusion) que
// controlamos a mano. El resto del esqueleto se queda en su pose base.
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

// Alto (en unidades de escena, tras escalar) que debe ocupar Sofi de cuerpo
// completo. El modelo de Character Creator viene en una escala muy pequeña
// (unidad interna del exportador), así que se recalcula dinámicamente a
// partir del bounding box real en vez de un valor fijo.
const TARGET_HEIGHT = 2.0;

// Color plano temporal mientras no haya texturas reales exportadas desde
// Character Creator (el FBX no trae ningún mapa de color, solo gris PBR
// por defecto). Se aplica una sola vez al cargar.
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

  // Localizar huesos + capturar su pose base, aplicar color temporal, y
  // calcular el encuadre (escala/posición) de cuerpo completo una sola vez
  // cuando el modelo termina de montarse.
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

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    const center = box.getCenter(new THREE.Vector3());

    if (rigRef.current) {
      rigRef.current.scale.setScalar(scale);
      // Centrado de cuerpo completo: X/Z al centro, Y centrado verticalmente
      // (pies y cabeza quedan ambos dentro del encuadre).
      rigRef.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
  }, [scene]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const bones = bonesRef.current;
    const base = baseQuatRef.current;

    // --- Cuerpo: respiración/rotación idle ---
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

    // --- Baile: brazos, cadera y torso en movimiento continuo, siempre
    // activo (no solo cuando hay un mood especial), para que Sofi se vea
    // viva de cuerpo completo en todo momento. ---
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

    // --- Boca: abre y cierra rápido mientras Sofi "habla" (burbuja de
    // mensaje activa). En reposo, chispazos ocasionales sutiles para que
    // no se vea totalmente inerte, y vuelve suave a su pose base. ---
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
      <group ref={rigRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function SofiFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
      <meshBasicMaterial color="#f5a623" />
    </mesh>
  );
}

export default function SofiMascot({ width = 160, height = 300, reducedMotion = false, mood = 'neutral', talking = false }) {
  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [0, 0, 3.6], fov: 35 }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[2, 3, 2]} intensity={1.3} />
        <directionalLight position={[-2, 1, -2]} intensity={0.4} />
        <Suspense fallback={<SofiFallback />}>
          <SofiModel reducedMotion={reducedMotion} mood={mood} talking={talking} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/sofi.glb');
