import { execSync } from 'child_process';
import * as colors from 'colors/safe';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Log } from './Log';
import { flatTarget, Target } from './Target';
import { ICommand, Toolchain } from './Toolchain';
import * as cj from 'comment-json';
import { LLVM } from '.';

const yellow = colors.yellow;
const brightGreen = (colors as any).brightGreen as (str: string) => string;

export async function run(
  targets: Array<{ new (): Toolchain }>,
  args: string[]
) {
  const fn: 'build' | 'clean' | 'ide' = (args[0] as any) || 'build';
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
    case 'ide':
      await ide(
        targets
        // args.slice(1).filter((x) => !x.startsWith('-'))
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

async function ide(targets: Array<{ new (): Toolchain }>) {
  const targetsMap = targets
    .map((t) => flatTarget(t))
    .flat()
    .reduce((a, b) => ({ ...a, ...b }), {});

  const keys = Object.keys(targetsMap);
  ideVscodeTasks(keys);
  ideVscodeLaunch(keys, targetsMap);
  console.log(colors.green('VSCode OK.'));
}

function ideVscodeTasks(keys: string[]) {
  const dir = '.vscode';
  const fp = dir + '/tasks.json';
  let json: {
    version: string;
    tasks: any[];
  };
  if (!existsSync(fp)) {
    mkdirSync(dir, { recursive: true });
    json = {
      version: '2.0.0',
      tasks: [],
    };
  } else {
    try {
      json = cj.parse(readFileSync(fp).toString());
    } catch {
      json = {
        version: '2.0.0',
        tasks: [],
      };
    }
  }

  for (const k of keys) {
    const label = 'Build release ' + k;
    let i = json.tasks.findIndex((t) => t.label === label);
    if (!~i) i = json.tasks.length;
    json.tasks[i] = {
      label,
      type: 'shell',
      command: 'node',
      args: ['node_modules/smake/lib/bin', 'build', k],
      group: 'build',
      options: {
        cwd: '${workspaceRoot}',
      },
    };
  }
  for (const k of keys) {
    const label = 'Build debug ' + k;
    let i = json.tasks.findIndex((t) => t.label === label);
    if (!~i) i = json.tasks.length;
    json.tasks[i] = {
      label,
      type: 'shell',
      command: 'node',
      args: ['node_modules/smake/lib/bin', 'build', '-d', k],
      group: 'test',
      options: {
        cwd: '${workspaceRoot}',
      },
    };
  }
  for (const k of keys) {
    const label = 'Build compdb ' + k;
    let i = json.tasks.findIndex((t) => t.label === label);
    if (!~i) i = json.tasks.length;
    json.tasks[i] = {
      label,
      type: 'shell',
      command: 'node',
      args: ['node_modules/smake/lib/bin', 'build', '-c', k],
      options: {
        cwd: '${workspaceRoot}',
      },
    };
  }
  for (const k of keys) {
    const label = 'Clean ' + k;
    let i = json.tasks.findIndex((t) => t.label === label);
    if (!~i) i = json.tasks.length;
    json.tasks[i] = {
      label,
      type: 'shell',
      command: 'node',
      args: ['node_modules/smake/lib/bin', 'clean', k],
      options: {
        cwd: '${workspaceRoot}',
      },
    };
  }
  writeFileSync(fp, JSON.stringify(json, null, 2));
}

function ideVscodeLaunch(keys: string[], targetsMap: any) {
  const dir = '.vscode';
  const fp = dir + '/launch.json';
  let json: {
    version: string;
    configurations: any[];
  };
  if (!existsSync(fp)) {
    mkdirSync(dir, { recursive: true });
    json = {
      version: '0.2.0',
      configurations: [],
    };
  } else {
    try {
      json = cj.parse(readFileSync(fp).toString());
    } catch {
      json = {
        version: '0.2.0',
        configurations: [],
      };
    }
  }

  for (const k of keys) {
    const obj = new targetsMap[k]();
    if (obj.type !== 'executable') continue;
    if (!(obj instanceof LLVM)) continue;
    const debugLabel = 'Build debug ' + k;
    const name = '(lldb) ' + k;
    let i = json.configurations.findIndex((t) => t.name === name);
    if (!~i) i = json.configurations.length;
    json.configurations[i] = {
      name,
      type: 'lldb',
      request: 'launch',
      program: obj.outputPath,
      args: [],
      stopAtEntry: false,
      cwd: '${workspaceRoot}',
      environment: [],
      console: 'integratedTerminal',
      preLaunchTask: debugLabel,
    };
  }

  writeFileSync(fp, JSON.stringify(json, null, 2));
}
