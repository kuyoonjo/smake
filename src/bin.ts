#!/usr/bin/env node

import { cyan, yellow } from 'colors/safe';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { clean } from './clean';
import { Log } from './Log';
import { build } from './build';
import { modulesDir } from '.';
import { readdir } from 'fs/promises';
import { join } from './join';

(async () => {
  const program = new Command();
  program
    .name('smake')
    .usage('[command] [options]')
    .command('build [targets...]', { isDefault: true })
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

  const md = modulesDir();
  const dirs = await readdir(md);
  const pluginsDirname = '@smake-plugins';
  if (dirs.includes(pluginsDirname)) {
    const pdirs = await readdir(join(md, pluginsDirname));
    for (const p of pdirs) {
      const m = require(join(pluginsDirname, p));
      if (m.command) m.command(program);
    }
  }
  const plugins = dirs.filter((d) => d.startsWith('smake-plugin-'));
  for (const p of plugins) {
    const m = require(p);
    if (m.command) m.command(program);
  }

  program.on('command:*', (operands: any) => {
    Log.e('unknown command', cyan(operands[0]));
  });

  if (process.argv.length < 3) process.argv.push('build');
  program.parse(process.argv);
})();
