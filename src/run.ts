import { execSync } from 'child_process';
import * as colors from 'colors/safe';
import { Log } from './Log';
import { ICommand, Toolchain } from './Toolchain';

const yellow = colors.yellow;
const brightGreen = (colors as any).brightGreen as (str: string) => string;

export function run(targets: Array<{ new (): Toolchain }>, args: string[]) {
  const fn: 'build' | 'clean' = (args[0] as any) || 'build';
  switch (fn) {
    case 'build':
      build(targets, args.slice(1));
      break;
    case 'clean':
      clean(targets, args.slice(1));
      break;
    default:
      Log.e('Unknown command', yellow(fn));
      return;
  }
}

function build(targets: Array<{ new (): Toolchain }>, args: string[]) {
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
    const ms = obj.generateCommands();
    cmds.splice(cmds.length, 0, ...ms);
  }

  let i = 0;
  for (const c of cmds) {
    ++i;
    Log.i(
      brightGreen(
        '[' + ((i / cmds.length) * 100).toFixed(0).padStart(3, ' ') + '%]'
      ),
      c.label,
      '\n',
      c.cmd
    );
    execSync(c.cmd, { stdio: 'inherit' });
  }
}

function clean(targets: Array<{ new (): Toolchain }>, args: string[]) {
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
    obj.clean();
  }
}
