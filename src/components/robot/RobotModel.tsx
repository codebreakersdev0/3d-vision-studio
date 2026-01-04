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
    <Joint rotation={[pipAngle, 0, 0]} position={[xOffset, -0.06, 0.01]}>
      <Cylinder radius={0.008} height={0.045} color="#606060" position={[0, -0.0225, 0]} />
      <Joint rotation={[dipAngle, 0, 0]} position={[0, -0.045, 0]}>
        <Cylinder radius={0.006} height={0.035} color="#707070" position={[0, -0.0175, 0]} />
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
  const fingerOffsets = [-0.024, -0.008, 0.008, 0.024];

  return (
    <group>
      {/* Palm */}
      <Link size={[0.065, 0.06, 0.025]} color="#404040" position={[0, -0.03, 0]} />
      
      {/* Thumb */}
      <Joint rotation={[0, thumbAbd, 0]} position={[side === "left" ? 0.04 : -0.04, -0.02, 0.01]}>
        <Joint rotation={[thumbFlex, 0, 0]}>
          <Cylinder radius={0.01} height={0.035} color="#606060" position={[0, -0.0175, 0]} />
          <Sphere radius={0.008} color="#707070" position={[0, -0.04, 0]} />
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
  const mirror = side === "left" ? -1 : 1;
  
  const shoulderYaw = deg2rad(jointAngles[`${side}_shoulder_yaw`] || 0);
  const shoulderPitch = deg2rad(jointAngles[`${side}_shoulder_pitch`] || 0);
  const elbowFlex = deg2rad(jointAngles[`${side}_elbow_flex`] || 0);
  const elbowRoll = deg2rad(jointAngles[`${side}_elbow_roll`] || 0);
  const wristPitch = deg2rad(jointAngles[`${side}_wrist_pitch`] || 0);
  const wristYaw = deg2rad(jointAngles[`${side}_wrist_yaw`] || 0);

  return (
    <group position={[mirror * 0.2, 0.12, 0]}>
      {/* Shoulder joint */}
      <Sphere radius={0.045} color="#0099dd" />
      
      <Joint rotation={[0, 0, shoulderYaw]}>
        <Joint rotation={[shoulderPitch, 0, 0]}>
          {/* Upper arm */}
          <Cylinder radius={0.032} height={0.24} color="#2a2a2a" position={[0, -0.12, 0]} />
          
          {/* Elbow joint */}
          <group position={[0, -0.25, 0]}>
            <Sphere radius={0.035} color="#0099dd" />
            
            <Joint rotation={[elbowFlex, 0, 0]}>
              <Joint rotation={[0, elbowRoll, 0]}>
                {/* Forearm */}
                <Cylinder radius={0.026} height={0.22} color="#353535" position={[0, -0.11, 0]} />
                
                {/* Wrist */}
                <group position={[0, -0.23, 0]}>
                  <Sphere radius={0.022} color="#0099dd" />
                  
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
      <group position={[0, 0.06, 0]}>
        <Cylinder radius={0.18} height={0.06} color="#1a1a1a" />
        {/* Wheels */}
        <Cylinder 
          radius={0.055} 
          height={0.035} 
          color="#333" 
          position={[-0.14, -0.015, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
        />
        <Cylinder 
          radius={0.055} 
          height={0.035} 
          color="#333" 
          position={[0.14, -0.015, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
        />
        {/* Caster */}
        <Sphere radius={0.03} color="#444" position={[0, -0.02, 0.12]} />
      </group>

      {/* Torso section */}
      <group position={[0, 0.09, 0]}>
        <Joint rotation={[0, 0, torsoYaw]}>
          {/* Lower torso / waist */}
          <Cylinder radius={0.1} height={0.12} color="#252525" position={[0, 0.06, 0]} />
          
          <Joint rotation={[torsoPitch, 0, 0]} position={[0, 0.12, 0]}>
            {/* Upper torso / chest */}
            <group>
              {/* Main chest */}
              <Link size={[0.32, 0.28, 0.14]} color="#1e1e1e" position={[0, 0.14, 0]} />
              
              {/* Shoulder caps */}
              <Sphere radius={0.05} color="#2a2a2a" position={[-0.2, 0.24, 0]} />
              <Sphere radius={0.05} color="#2a2a2a" position={[0.2, 0.24, 0]} />
              
              {/* Chest accent */}
              <Link size={[0.18, 0.1, 0.02]} color="#0088cc" position={[0, 0.18, 0.08]} />
              
              {/* Side vents */}
              <Link size={[0.02, 0.12, 0.08]} color="#333" position={[-0.16, 0.12, 0]} />
              <Link size={[0.02, 0.12, 0.08]} color="#333" position={[0.16, 0.12, 0]} />
            </group>
            
            {/* Arms */}
            <group position={[0, 0.12, 0]}>
              <Arm side="left" jointAngles={jointAngles} />
              <Arm side="right" jointAngles={jointAngles} />
            </group>

            {/* Neck and Head */}
            <group position={[0, 0.3, 0]}>
              {/* Neck */}
              <Cylinder radius={0.035} height={0.08} color="#333" position={[0, 0.04, 0]} />
              
              <Joint rotation={[0, 0, headYaw]} position={[0, 0.1, 0]}>
                <Joint rotation={[headPitch, 0, 0]}>
                  <Joint rotation={[0, headRoll, 0]}>
                    {/* Head - more angular */}
                    <Link size={[0.14, 0.16, 0.14]} color="#1a1a1a" position={[0, 0.08, 0]} />
                    
                    {/* Face plate */}
                    <Link size={[0.1, 0.08, 0.02]} color="#0a0a0a" position={[0, 0.06, 0.08]} />
                    
                    {/* Eyes */}
                    <Sphere radius={0.018} color="#00ff88" position={[-0.028, 0.08, 0.08]} />
                    <Sphere radius={0.018} color="#00ff88" position={[0.028, 0.08, 0.08]} />
                    
                    {/* Brow */}
                    <Link size={[0.1, 0.015, 0.02]} color="#0088cc" position={[0, 0.12, 0.07]} />
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