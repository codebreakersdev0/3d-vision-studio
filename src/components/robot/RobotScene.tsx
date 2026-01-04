import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, PerspectiveCamera } from "@react-three/drei";
import { RobotModel } from "./RobotModel";
import { JointAngles } from "@/types/robot";

interface RobotSceneProps {
  jointAngles: JointAngles;
}

export function RobotScene({ jointAngles }: RobotSceneProps) {
  return (
    <Canvas shadows className="w-full h-full">
      <PerspectiveCamera makeDefault position={[1.5, 1.2, 1.5]} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Grid floor */}
      <Grid
        args={[10, 10]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#606060"
        fadeDistance={8}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      
      {/* Robot */}
      <RobotModel jointAngles={jointAngles} />
      
      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={5}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
