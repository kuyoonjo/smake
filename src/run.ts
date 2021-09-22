import { execSync } from 'child_process';
import * as colors from 'colors/safe';
import { Log } from './Log';
import { flatTarget, Target } from './Target';
import { ICommand, Toolchain } from './Toolchain';

const yellow = colors.yellow;
const brightGreen = (colors as any).brightGreen as (str: string) => string;

export async function run(
  targets: Array<{ new (): Toolchain }>,
  args: string[]
) {
  const fn: 'build' | 'clean' = (args[0] as any) || 'build';
  switch (fn) {
    case 'build':
      await build(
        targets,
        args.slice(1).filter((x) => !x.startsWith('-'))
      );
      break;
    case 'clean':
      await clean(
        targets,
        args.slice(1).filter((x) => !x.startsWith('-'))
      );
      break;
    default:
      Log.e('Unknown command', yellow(fn));
      return;
  }
}

async function build(targets: Array<Target>, args: string[]) {
  const cmds: ICommand[] = [];

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

  let ci = 0;
  for (const k of filteredKeys) {
    const obj = new targetsMap[k]();
    const ms = await obj.generateCommands(!ci, ci === filteredKeys.length - 1);
    cmds.splice(cmds.length, 0, ...ms);
    ++ci;
  }

  let i = 0;
  for (const c of cmds) {
    Log.i(
      brightGreen(
        '[' + ((i / cmds.length) * 100).toFixed(0).padStart(3, ' ') + '%]'
      ),
      c.label
    );
    try {
      if (c.fn) await c.fn();
      else {
        console.log(c.cmd);
        execSync(c.cmd, { stdio: 'inherit' });
      }
    } catch (e) {
      e && Log.e(e);
      process.exit(1);
    }
    ++i;
  }

  Log.i(brightGreen('[100%]'), colors.magenta('Done'));
}

async function clean(targets: Array<{ new (): Toolchain }>, args: string[]) {
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
    const obj = new targetsMap[k]();
    await obj.clean();
  }
}
