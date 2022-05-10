import * as THREE from 'three';
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Instances, Instance, OrbitControls, Environment, useGLTF } from '@react-three/drei';

const color = new THREE.Color();

const randomVector = (r: number) => [
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
];
const randomEuler = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI,
];
const randomData = Array.from({ length: 1000 }, (_, r) => ({
  random: Math.random(),
  position: randomVector(r),
  rotation: randomEuler(),
}));

export function ShoesViewer({ nuShoes, ambientLight }: any) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} performance={{ min: 0.1 }}>
      <ambientLight intensity={ambientLight} />
      <directionalLight intensity={0.3} position={[5, 25, 20]} />
      <Suspense fallback={null}>
        <Shoes range={nuShoes} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}

function Shoes({ range }: any) {
  const { nodes, materials } = useGLTF('https://public.sethealth.app/shoe.glb') as any;
  return (
    <Instances range={range} material={materials.phong1SG} geometry={nodes.Shoe.geometry}>
      {randomData.map((props, i) => (
        <Shoe key={i} {...props} />
      ))}
    </Instances>
  );
}

function Shoe({ random, ...props }: any) {
  const ref = useRef<any>()!;
  const [hovered, setHover] = useState(false);
  useFrame(state => {
    const t = state.clock.getElapsedTime() + random * 10000;
    const lerp = THREE.MathUtils.lerp(ref.current!.scale.z, hovered ? 1.4 : 1, 0.1);

    // Change some of the code, live reload with update the editor automatically
    const hoverColor = 'red'; // Change to "yellow"
    const positionPulse = 1 / 1.5; // Change 1.5 to 0.1
    // Play with different value
    const rotationPulse = {
      x: 1 / 4,
      y: 1 / 4,
      z: 1 / 1.5,
    };

    ref.current.rotation.set(
      Math.cos(t * rotationPulse.x) / 2,
      Math.sin(t * rotationPulse.y) / 2,
      Math.cos(t * rotationPulse.z) / 2
    );
    ref.current.position.y = Math.sin(t * positionPulse) / 2;
    ref.current.scale.x = ref.current.scale.y = ref.current.scale.z = lerp;

    ref.current.color.lerp(color.set(hovered ? hoverColor : 'white'), hovered ? 1 : 0.1);
  });
  return (
    <group {...props}>
      <Instance
        ref={ref}
        onPointerOver={e => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      />
    </group>
  );
}
