export interface JointLimit {
  min: number;
  max: number;
}

export interface Joint {
  name: string;
  parent: string;
  child: string;
  type: "revolute" | "prismatic" | "fixed";
  axis: "X" | "Y" | "Z";
  limit: JointLimit;
}

export interface Motor {
  name: string;
  axis: string;
}

export interface RobotBase {
  link: string;
  type: string;
  motors: Motor[];
}

export interface RobotInfo {
  name: string;
  version: string;
  dof: {
    total: number;
    motors: number;
    servos: number;
  };
}

export interface RobotSpec {
  robot: RobotInfo;
  base: RobotBase;
  joints: Joint[];
}

export type JointAngles = Record<string, number>;
