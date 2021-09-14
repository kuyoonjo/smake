import { Toolchain } from './Toolchain';

export interface TargetGroup {
  name: string;
  targets: Array<Target>;
}

export type Target =
  | {
      new (): Toolchain;
    }
  | TargetGroup;

export function flatTarget(t: Target): Array<{ new (): Toolchain }> {
  const x = t as any;
  if (x.prototype) return [x];
  return x.targets.map((tt: any) => flatTarget(tt)).flat(100);
}
