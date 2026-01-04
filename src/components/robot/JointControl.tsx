import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Joint } from "@/types/robot";

interface JointControlProps {
  joint: Joint;
  value: number;
  onChange: (value: number) => void;
}

export function JointControl({ joint, value, onChange }: JointControlProps) {
  const formatName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground/80">
          {formatName(joint.name)}
        </Label>
        <span className="text-xs text-muted-foreground font-mono">
          {value.toFixed(1)}°
        </span>
      </div>
      <Slider
        value={[value]}
        min={joint.limit.min}
        max={joint.limit.max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}
