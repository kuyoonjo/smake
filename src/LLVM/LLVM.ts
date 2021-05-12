import { cyan, grey, magenta, yellow } from 'colors/safe';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { Log } from '../Log';
import { ICommand, Toolchain } from '../Toolchain';

export abstract class LLVM extends Toolchain {
  abstract get files(): string[];
  get name() {
    return 'LLVM Builder';
  }
  get type(): 'executable' | 'shared' | 'static' {
    return 'executable';
  }
  get prefix() {
    return '';
  }
  get cxx() {
    return 'clang++';
  }
  get cc() {
    return 'clang';
  }
  get ld() {
    return 'clang++';
  }
  get sh() {
    return 'clang++';
  }
  get ar() {
    return 'llvm-ar';
  }

  get includedirs(): string[] {
    return [];
  }
  get sysIncludedirs(): string[] {
    return [];
  }
  get linkdirs(): string[] {
    return [this.buildDir];
  }
  get libs(): Array<string | LLVM> {
    return [];
  }
  get cxflags(): string[] {
    return [];
  }
  get ldflags(): string[] {
    return [];
  }
  get shflags(): string[] {
    return [];
  }
  get arflags(): string[] {
    return [];
  }

  get target() {
    return '';
  }

  get objOutDirname() {
    return 'objs';
  }
  get objOutSuffix() {
    return '.o';
  }
  get executableOutPrefix() {
    return '';
  }
  get executableOutSuffix() {
    return '';
  }
  get sharedOutPrefix() {
    return 'lib';
  }
  get sharedOutSuffix() {
    return '.so';
  }
  get staticOutPrefix() {
    return 'lib';
  }
  get staticOutSuffix() {
    return '.a';
  }

  get outputFileBasename() {
    return this.constructor.name;
  }

  get outputFilename() {
    switch (this.type) {
      case 'executable':
        return (
          this.executableOutPrefix +
          this.outputFileBasename +
          this.executableOutSuffix
        );
      case 'shared':
        return (
          this.sharedOutPrefix + this.outputFileBasename + this.sharedOutSuffix
        );
      case 'static':
        return (
          this.staticOutPrefix + this.outputFileBasename + this.staticOutSuffix
        );
    }
  }

  get outputPath() {
    return join(this.buildDir, this.outputFilename);
  }

  isCFile(f: string) {
    return f.endsWith('.c');
  }

  isCXXFile(f: string) {
    return (
      f.endsWith('.cc') ||
      f.endsWith('.cpp') ||
      f.endsWith('.cxx') ||
      f.endsWith('.C')
    );
  }

  buildUnknownFile(f: string) {
    Log.e('Unknown file type', yellow(f));
    process.exit(0);
  }

  generateCommands(): ICommand[] {
    Log.i(cyan('Prepare'), this.name);
    const { cmds, outs } = this.buildObjs();
    switch (this.type) {
      case 'executable':
        cmds.push({
          label: magenta('Linking executable'),
          cmd: this.buildExecutable(outs, this.outputPath),
        });
        break;
      case 'shared':
        cmds.push({
          label: magenta('Linking shared library'),
          cmd: this.buildShared(outs, this.outputPath),
        });
        break;
      case 'static':
        cmds.push({
          label: magenta('Linking static library'),
          cmd: this.buildStatic(outs, this.outputPath),
        });
        break;
    }
    return cmds;
  }

  buildObjCmd(compiler: string, srcFile: string, distFile: string) {
    return [
      compiler,
      '-c',
      ...this.sysIncludedirs.map((x) => `-isystem ${x}`),
      ...this.includedirs.map((x) => `-I${x}`),
      ...this.cxflags,
      '-o ' + distFile,
      srcFile,
    ].join(' ');
  }

  buildObjs() {
    const cmds: ICommand[] = [];
    const outs: string[] = [];
    for (const f of this.files) {
      let compiler = '';
      if (this.isCFile(f)) compiler = this.prefix + this.cc;
      else if (this.isCXXFile(f)) compiler = this.prefix + this.cxx;
      else this.buildUnknownFile(f);

      if (this.target) compiler += ` -target ${this.target}`;

      const out = join(
        this.buildDir,
        this.cacheDirname,
        this.objOutDirname,
        f + this.objOutSuffix
      );
      outs.push(out);
      const outDir = dirname(out);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      const cmd = this.buildObjCmd(compiler, f, out);
      cmds.push({
        label: grey(`Compiling ${f}`),
        cmd,
      });
    }
    return { cmds, outs };
  }

  buildExecutable(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ld;
    return [
      linker,
      ...this.linkdirs.map((x) => `-L${x}`),
      ...this.libs.map(
        (x: any) =>
          `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
      ),
      ...this.ldflags,
      '-o ' + distFile,
      ...objFiles,
    ].join(' ');
  }

  buildShared(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.sh;
    return [
      linker,
      ...this.linkdirs.map((x) => `-L${x}`),
      ...this.libs.map(
        (x: any) =>
          `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
      ),
      ...this.shflags,
      '-o ' + distFile,
      ...objFiles,
      '-shared',
    ].join(' ');
  }

  buildStatic(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ar;
    return [linker, ...this.arflags, 'cr ' + distFile, ...objFiles].join(' ');
  }

  clean() {
    super.clean();
    rmSync(join(this.outputPath), {
      force: true,
    });
  }
}
