import { RobotScene } from "@/components/robot/RobotScene";
import { JointPanel } from "@/components/robot/JointPanel";
import { useRobotState } from "@/hooks/useRobotState";
import robotSpec from "@/data/robot.json";
import { RobotSpec } from "@/types/robot";

const Index = () => {
  const typedSpec = robotSpec as RobotSpec;
  const { jointAngles, setJointAngle, resetPose } = useRobotState(typedSpec);

  return (
    <div className="flex h-screen w-full bg-background">
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <RobotScene jointAngles={jointAngles} />
        
        {/* Info overlay */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
          <h1 className="text-xl font-bold text-foreground">Robot Digital Twin</h1>
          <p className="text-sm text-muted-foreground">
            Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 shrink-0">
        <JointPanel
          robotSpec={typedSpec}
          jointAngles={jointAngles}
          onJointChange={setJointAngle}
          onReset={resetPose}
        />
      </div>
    </div>
  );
};

export default Index;
