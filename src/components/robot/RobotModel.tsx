import { useRef } from "react";
import { Group } from "three";
import { JointAngles } from "@/types/robot";

interface RobotModelProps {
  jointAngles: JointAngles;
}

// Convert degrees to radians
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

// Individual joint component
function Joint({
  rotation,
  children,
  position = [0, 0, 0],
}: {
  rotation: [number, number, number];
  children?: React.ReactNode;
  position?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );
}

// Link geometry component
function Link({
  size,
  color,
  position = [0, 0, 0],
}: {
  size: [number, number, number];
  color: string;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function Cylinder({
  radius,
  height,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  radius: number;
  height: number;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation as any}>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function Sphere({
  radius,
  color,
  position = [0, 0, 0],
}: {
  radius: number;
  color: string;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
    </mesh>
  );
}

// Single finger component
function Finger({ 
  pipAngle, 
  dipAngle, 
  xOffset 
}: { 
  pipAngle: number; 
  dipAngle: number; 
  xOffset: number;
}) {
  return (
    <Joint rotation={[pipAngle, 0, 0]} position={[xOffset, -0.1, 0]}>
      <Cylinder radius={0.01} height={0.035} color="#505050" position={[0, -0.0175, 0]} />
      <Joint rotation={[dipAngle, 0, 0]} position={[0, -0.035, 0]}>
        <Cylinder radius={0.008} height={0.025} color="#505050" position={[0, -0.0125, 0]} />
      </Joint>
    </Joint>
  );
}

// Hand/Gripper component
function Hand({ side, jointAngles }: { side: "left" | "right"; jointAngles: JointAngles }) {
  const thumbAbd = deg2rad(jointAngles[`${side}_thumb_abduction`] || 0);
  const thumbFlex = deg2rad(jointAngles[`${side}_thumb_flexion`] || 0);
  const fingersPip = deg2rad(jointAngles[`${side}_fingers_pip`] || 0);
  const fingersDip = deg2rad(jointAngles[`${side}_fingers_dip`] || 0);

  // Finger positions spread across the palm
  const fingerOffsets = [-0.027, -0.009, 0.009, 0.027];

  return (
    <group>
      {/* Palm */}
      <Link size={[0.08, 0.1, 0.03]} color="#404040" position={[0, -0.05, 0]} />
      
      {/* Thumb */}
      <Joint rotation={[0, thumbAbd, 0]} position={[side === "left" ? 0.05 : -0.05, -0.05, 0]}>
        <Joint rotation={[thumbFlex, 0, 0]}>
          <Cylinder radius={0.012} height={0.04} color="#505050" position={[0, -0.02, 0]} />
        </Joint>
      </Joint>

      {/* Four Fingers */}
      {fingerOffsets.map((offset, i) => (
        <Finger 
          key={i} 
          pipAngle={fingersPip} 
          dipAngle={fingersDip} 
          xOffset={offset} 
        />
      ))}
    </group>
  );
}

// Arm component
function Arm({ side, jointAngles }: { side: "left" | "right"; jointAngles: JointAngles }) {
  const mirror = side === "left" ? 1 : -1;
  
  const shoulderYaw = deg2rad(jointAngles[`${side}_shoulder_yaw`] || 0);
  const shoulderPitch = deg2rad(jointAngles[`${side}_shoulder_pitch`] || 0);
  const elbowFlex = deg2rad(jointAngles[`${side}_elbow_flex`] || 0);
  const elbowRoll = deg2rad(jointAngles[`${side}_elbow_roll`] || 0);
  const wristPitch = deg2rad(jointAngles[`${side}_wrist_pitch`] || 0);
  const wristYaw = deg2rad(jointAngles[`${side}_wrist_yaw`] || 0);

  return (
    <group position={[mirror * 0.18, 0.15, 0]}>
      {/* Shoulder joint */}
      <Sphere radius={0.04} color="#00aaff" />
      
      <Joint rotation={[0, 0, shoulderYaw]}>
        <Joint rotation={[shoulderPitch, 0, 0]}>
          {/* Upper arm */}
          <Link size={[0.06, 0.2, 0.06]} color="#2a2a2a" position={[0, -0.1, 0]} />
          
          {/* Elbow joint */}
          <group position={[0, -0.2, 0]}>
            <Sphere radius={0.035} color="#00aaff" />
            
            <Joint rotation={[elbowFlex, 0, 0]}>
              <Joint rotation={[0, elbowRoll, 0]}>
                {/* Forearm */}
                <Link size={[0.05, 0.18, 0.05]} color="#2a2a2a" position={[0, -0.09, 0]} />
                
                {/* Wrist */}
                <group position={[0, -0.18, 0]}>
                  <Sphere radius={0.025} color="#00aaff" />
                  
                  <Joint rotation={[wristPitch, 0, 0]}>
                    <Joint rotation={[0, 0, wristYaw]}>
                      <Hand side={side} jointAngles={jointAngles} />
                    </Joint>
                  </Joint>
                </group>
              </Joint>
            </Joint>
          </group>
        </Joint>
      </Joint>
    </group>
  );
}

export function RobotModel({ jointAngles }: RobotModelProps) {
  const groupRef = useRef<Group>(null);

  const torsoYaw = deg2rad(jointAngles.torso_yaw || 0);
  const torsoPitch = deg2rad(jointAngles.torso_pitch || 0);
  const headYaw = deg2rad(jointAngles.head_yaw || 0);
  const headPitch = deg2rad(jointAngles.head_pitch || 0);
  const headRoll = deg2rad(jointAngles.head_roll || 0);

  return (
    <group ref={groupRef}>
      {/* Base with wheels */}
      <group position={[0, 0.08, 0]}>
        <Cylinder radius={0.15} height={0.08} color="#1a1a1a" />
        {/* Wheels */}
        <Cylinder 
          radius={0.06} 
          height={0.03} 
          color="#333" 
          position={[-0.12, -0.02, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
        />
        <Cylinder 
          radius={0.06} 
          height={0.03} 
          color="#333" 
          position={[0.12, -0.02, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
        />
      </group>

      {/* Torso section */}
      <group position={[0, 0.12, 0]}>
        <Joint rotation={[0, 0, torsoYaw]}>
          {/* Lower torso */}
          <Link size={[0.2, 0.15, 0.12]} color="#2a2a2a" position={[0, 0.075, 0]} />
          
          <Joint rotation={[torsoPitch, 0, 0]} position={[0, 0.15, 0]}>
            {/* Upper torso */}
            <Link size={[0.3, 0.2, 0.15]} color="#1a1a1a" position={[0, 0.1, 0]} />
            
            {/* Chest detail */}
            <Link size={[0.15, 0.08, 0.02]} color="#00aaff" position={[0, 0.12, 0.09]} />
            
            {/* Arms */}
            <group position={[0, 0.15, 0]}>
              <Arm side="left" jointAngles={jointAngles} />
              <Arm side="right" jointAngles={jointAngles} />
            </group>

            {/* Neck and Head */}
            <group position={[0, 0.22, 0]}>
              <Cylinder radius={0.04} height={0.06} color="#333" position={[0, 0.03, 0]} />
              
              <Joint rotation={[0, 0, headYaw]} position={[0, 0.08, 0]}>
                <Joint rotation={[headPitch, 0, 0]}>
                  <Joint rotation={[0, headRoll, 0]}>
                    {/* Head */}
                    <Sphere radius={0.1} color="#1a1a1a" position={[0, 0.05, 0]} />
                    
                    {/* Face plate */}
                    <Link size={[0.12, 0.08, 0.02]} color="#222" position={[0, 0.05, 0.09]} />
                    
                    {/* Eyes */}
                    <Sphere radius={0.02} color="#00ff88" position={[-0.03, 0.06, 0.1]} />
                    <Sphere radius={0.02} color="#00ff88" position={[0.03, 0.06, 0.1]} />
                  </Joint>
                </Joint>
              </Joint>
            </group>
          </Joint>
        </Joint>
      </group>
    </group>
  );
}
