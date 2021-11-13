#!/usr/bin/env node

import { cyan, yellow } from 'colors/safe';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { Log } from './Log';
import { run } from './run';

const program = new Command();
program
  .name('smake')
  .usage('[command] [options]')
  .command('build [targets...]', undefined, { isDefault: true })
  .option('-v, --verbose', 'verbose output')
  .option('-c, --compdb', 'JSON Compilation Database')
  .option('-d, --debug', 'build debug information')
  .option('-f, --file <path>', 'specify the smake build file')
  .action((targets, command) => {
    const opts = command.opts();
    const file = resolve(opts.file || 'smake.js');
    if (!existsSync(file)) {
      Log.e('Cannot find', yellow(file));
      process.exit(1);
    }
    const m = require(file);
    const args = ['build', ...targets];
    if (opts.verbose) process.argv.push('--verbose');
    if (opts.compdb) process.argv.push('--compdb');
    if (opts.debug) process.argv.push('--debug');
    run(m, args);
  });

program
  .command('clean [targets...]')
  .option('-f, --file <path>', 'specify the smake build file')
  .action((targets, command) => {
    const opts = command.opts();
    const file = resolve(opts.file || 'smake.js');
    if (!existsSync(file)) {
      Log.e('Cannot find', yellow(file));
      process.exit(1);
    }
    const m = require(file);
    const args = ['clean', ...targets];
    run(m, args);
  });

program
  .command('ide')
  .option('-f, --file <path>', 'specify the smake build file')
  .action((command) => {
    const opts = command.opts();
    const file = resolve(opts.file || 'smake.js');
    if (!existsSync(file)) {
      Log.e('Cannot find', yellow(file));
      process.exit(1);
    }
    const m = require(file);
    const args = ['ide'];
    run(m, args);
  });

program.on('command:*', (operands: any) => {
  Log.e('unknown command', cyan(operands[0]));
});

if (process.argv.length < 3) process.argv.push('build');
program.parse(process.argv);
