import { useState, useCallback } from "react";
import { JointAngles, RobotSpec } from "@/types/robot";

export function useRobotState(robotSpec: RobotSpec) {
  // Initialize all joints to 0
  const initialAngles: JointAngles = {};
  robotSpec.joints.forEach((joint) => {
    initialAngles[joint.name] = 0;
  });

  const [jointAngles, setJointAngles] = useState<JointAngles>(initialAngles);

  const setJointAngle = useCallback(
    (jointName: string, angle: number) => {
      const joint = robotSpec.joints.find((j) => j.name === jointName);
      if (!joint) return;

      // Clamp to joint limits
      const clampedAngle = Math.max(
        joint.limit.min,
        Math.min(joint.limit.max, angle)
      );

      setJointAngles((prev) => ({
        ...prev,
        [jointName]: clampedAngle,
      }));
    },
    [robotSpec.joints]
  );

  const resetPose = useCallback(() => {
    const reset: JointAngles = {};
    robotSpec.joints.forEach((joint) => {
      reset[joint.name] = 0;
    });
    setJointAngles(reset);
  }, [robotSpec.joints]);

  return { jointAngles, setJointAngle, resetPose };
}
