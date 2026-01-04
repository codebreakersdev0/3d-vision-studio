import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JointControl } from "./JointControl";
import { RobotSpec, JointAngles } from "@/types/robot";
import { RotateCcw } from "lucide-react";

interface JointPanelProps {
  robotSpec: RobotSpec;
  jointAngles: JointAngles;
  onJointChange: (name: string, value: number) => void;
  onReset: () => void;
}

export function JointPanel({
  robotSpec,
  jointAngles,
  onJointChange,
  onReset,
}: JointPanelProps) {
  // Group joints by body part
  const groupedJoints = {
    torso: robotSpec.joints.filter((j) => j.name.startsWith("torso")),
    head: robotSpec.joints.filter((j) => j.name.startsWith("head")),
    leftArm: robotSpec.joints.filter(
      (j) => j.name.startsWith("left_shoulder") || 
             j.name.startsWith("left_elbow") || 
             j.name.startsWith("left_wrist")
    ),
    leftHand: robotSpec.joints.filter(
      (j) => j.name.startsWith("left_thumb") || j.name.startsWith("left_fingers")
    ),
    rightArm: robotSpec.joints.filter(
      (j) => j.name.startsWith("right_shoulder") || 
             j.name.startsWith("right_elbow") || 
             j.name.startsWith("right_wrist")
    ),
    rightHand: robotSpec.joints.filter(
      (j) => j.name.startsWith("right_thumb") || j.name.startsWith("right_fingers")
    ),
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">Joint Controls</h2>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {robotSpec.robot.name} • {robotSpec.robot.dof.total} DOF
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Accordion type="multiple" defaultValue={["torso", "head"]} className="space-y-2">
          <AccordionItem value="torso" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Torso</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.torso.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="head" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Head</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.head.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="leftArm" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Left Arm</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.leftArm.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="leftHand" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Left Hand</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.leftHand.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rightArm" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Right Arm</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.rightArm.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rightHand" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium">Right Hand</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {groupedJoints.rightHand.map((joint) => (
                <JointControl
                  key={joint.name}
                  joint={joint}
                  value={jointAngles[joint.name] || 0}
                  onChange={(v) => onJointChange(joint.name, v)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}
