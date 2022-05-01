import { Toolchain } from './Toolchain';

export interface TargetGroup {
  name: string;
  targets: Target[];
}

export type Target = Toolchain | TargetGroup;

export function flatTarget(
  t: any,
  prefix = ''
): Array<{
  [k: string]: Toolchain;
}> {
  if (t.generateCommands) {
    const obj: any = {};
    obj[prefix + t.id] = t;
    return [obj];
  }
  return t.targets
    .map((tt: any) => flatTarget(tt, prefix + t.name + ':'))
    .flat(100);
}
