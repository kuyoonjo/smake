import { Toolchain } from './Toolchain';

export interface TargetGroup {
  name: string;
  targets: Target[];
}

export type Target =
  | {
      new (): Toolchain;
    }
  | Toolchain
  | TargetGroup;

export function flatTarget(
  t: Target,
  prefix = ''
): Array<{
  [k: string]: Toolchain;
}> {
  let x = t as any;
  if (x.prototype) {
    x = new x(x.name);
  }
  if (x instanceof Toolchain) {
    const obj: any = {};
    obj[prefix + x.id] = x;
    return [obj];
  }
  return x.targets
    .map((tt: any) => flatTarget(tt, prefix + x.name + ':'))
    .flat(100);
}
