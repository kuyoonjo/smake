import { IToolchain } from './Toolchain';

export interface ITargetGroup {
  name: string;
  targets: Target[];
}

export type Target = IToolchain | ITargetGroup;

export function flatTarget(
  t: any,
  prefix = ''
): Array<{
  [k: string]: IToolchain;
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
