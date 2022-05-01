import { ChildProcess, spawn } from 'child_process';
import * as colors from 'colors/safe';
import { Log } from './Log';
import { flatTarget, Target } from './Target';
import { ICommand } from './Toolchain';

const yellow = colors.yellow;
const brightGreen = (colors as any).brightGreen as (str: string) => string;

export async function build(targets: Array<Target>, args: string[], opts: any) {
  console.log(targets, args, opts);
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
    const obj = targetsMap[k];
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
      if (typeof c.command === 'function') await c.command(opts);
      else {
        Log.i(c.command);
        let cp: ChildProcess;
        if (typeof c.command === 'string')
          cp = spawn(c.command, [], { stdio: 'inherit' });
        else cp = spawn(c.command[0], c.command[1], { stdio: 'inherit' });
        await new Promise<void>((r, rr) => {
          cp.once('exit', (code) => {
            if (code) rr(`exit code: ${code}`);
            else r();
          });
        });
      }
    } catch (e) {
      e && Log.e(e);
      process.exit(1);
    }
    ++i;
  }

  Log.i(brightGreen('[100%]'), colors.magenta('Done'));
}
