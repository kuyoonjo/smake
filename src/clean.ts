import { yellow } from 'colors/safe';
import { Log } from './Log';
import { flatTarget, Target } from './Target';

export async function clean(targets: Target[], args: string[]) {
  const targetsMap = targets
    .map((t) => flatTarget(t))
    .flat()
    .reduce((a, b) => ({ ...a, ...b }), {});

  const keys = Object.keys(targetsMap);

  for (const arg of args) {
    if (!keys.find((k) => k === arg || k.startsWith(arg + ':'))) {
      Log.e('Unknown target', yellow(arg));
      process.exit(0);
    }
  }

  const filteredKeys = keys
    .filter((k) => {
      if (!args.length) return true;
      return args.find((a) => a === k || k.startsWith(a + ':'));
    })
    .flat();
  for (const k of filteredKeys) {
    const obj = targetsMap[k];
    if (obj.clean) await obj.clean();
  }
}
