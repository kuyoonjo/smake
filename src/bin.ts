#!/usr/bin/env node

import { cyan, yellow } from 'colors/safe';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { clean } from './clean';
import { Log } from './Log';
import { build } from './build';
import { ls } from './ls';
import { execSync } from 'child_process';

(async () => {
  const program = new Command();
  program
    .name('smake')
    .usage('[command] [options]')
    .command('build [targets...]', { isDefault: true })
    .description('build targets')
    .option('-v, --verbose', 'verbose output')
    .option('-d, --debug', 'build debug information')
    .option('-f, --file <path>', 'specify the smake build file')
    .action((targets, opts) => {
      const file = resolve(opts.file || 'smake.js');
      if (!existsSync(file)) {
        Log.e('Cannot find', yellow(file));
        process.exit(1);
      }
      const m = require(file);
      build(m, targets, opts);
    });

  program
    .command('clean [targets...]')
    .description('clean targets')
    .option('-f, --file <path>', 'specify the smake build file')
    .action((targets, opts) => {
      const file = resolve(opts.file || 'smake.js');
      if (!existsSync(file)) {
        Log.e('Cannot find', yellow(file));
        process.exit(1);
      }
      const m = require(file);
      clean(m, targets);
    });

  program
    .command('ls')
    .description('list targets')
    .option('-f, --file <path>', 'specify the smake build file')
    .action((_, opts) => {
      const file = resolve(opts.file || 'smake.js');
      if (!existsSync(file)) {
        Log.e('Cannot find', yellow(file));
        process.exit(1);
      }
      const m = require(file);
      ls(m);
    });

  const npm = process.env.SMAKE_NPM || 'npm';
  const json = JSON.parse(
    execSync(`${npm} ls -g --json`, { env: process.env }).toString()
  );
  const deps: Array<{
    [k: string]: {
      version: string;
    };
  }> = (Array.isArray(json) ? json : [json]).map((x) => x.dependencies);
  const plugins: Array<{
    name: string;
    version: string;
  }> = [];

  for (const dep of deps) {
    for (const [name, v] of Object.entries(dep))
      if (
        name.startsWith('@smake-plugins/') ||
        name.startsWith('smake-plugin-')
      )
        plugins.push({
          name,
          version: v.version,
        });
  }
  plugins.sort();

  for (const p of plugins) {
    const m = require(p.name);
    if (m.command) m.command(program);
  }

  if (plugins.length) {
    program
      .command('plugins')
      .description('list installed plugins')
      .action(() => {
        for (const p of plugins) {
          console.log(p.name, p.version);
        }
      });
  }

  program.on('command:*', (operands: any) => {
    Log.e('unknown command', cyan(operands[0]));
  });

  if (process.argv.length < 3) process.argv.push('build');
  program.parse(process.argv);
})();
