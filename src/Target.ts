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

export function flatTarget(
  t: Target,
  prefix = ''
): Array<{
  [k: string]: { new (): Toolchain };
}> {
  const x = t as any;
  if (x.prototype) {
    const obj: any = {};
    obj[prefix + x.name] = x;
    return [obj];
  }
  return x.targets
    .map((tt: any) => flatTarget(tt, prefix + x.name + ':'))
    .flat(100);
}
