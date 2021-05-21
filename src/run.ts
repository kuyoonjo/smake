import { execSync } from 'child_process';
import * as colors from 'colors/safe';
import { Log } from './Log';
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

async function build(targets: Array<{ new (): Toolchain }>, args: string[]) {
  const cmds: ICommand[] = [];
  const names = targets.map((t) => t.constructor.name);
  for (const arg of args) {
    if (!names.includes(arg)) {
      Log.e('Unknown target', yellow(arg));
      process.exit(0);
    }
  }
  const classes = targets.filter((t) => {
    if (!args.length) return true;
    return args.includes(t.constructor.name);
  });
  for (const Class of classes) {
    const obj = new Class();
    const ms = await obj.generateCommands();
    cmds.splice(cmds.length, 0, ...ms);
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
  const names = targets.map((t) => t.constructor.name);
  for (const arg of args) {
    if (!names.includes(arg)) {
      Log.e('Unknown target', yellow(arg));
      process.exit(0);
    }
  }
  const classes = targets.filter((t) => {
    if (!args.length) return true;
    return args.includes(t.constructor.name);
  });
  for (const Class of classes) {
    const obj = new Class();
    await obj.clean();
  }
}
