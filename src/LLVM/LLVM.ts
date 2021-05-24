import { execSync } from 'child_process';
import { magenta } from 'colors/safe';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
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
    return process.env.SMAKE_LLVM_PREFIX || '';
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
  get cflags(): string[] {
    return [];
  }
  get cxxflags(): string[] {
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

  get ninjaFilePath() {
    return join(this.buildDir, this.constructor.name + '.ninja');
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

  async generateCommands(): Promise<ICommand[]> {
    const { cmd, outs } = await this.buildObjs();
    const content = [
      await this.buildCCRules(),
      await this.buildCXXRules(),
      cmd,
    ];
    switch (this.type) {
      case 'executable':
        content.push(await this.buildExecutable(outs, this.outputPath));
        break;
      case 'shared':
        content.push(await this.buildShared(outs, this.outputPath));
        break;
      case 'static':
        content.push(await this.buildStatic(outs, this.outputPath));
        break;
    }

    content.push('');
    return [
      {
        label: magenta(`Generating build.ninja for ${this.name}`),
        cmd: '',
        fn: async () => {
          mkdirSync(this.buildDir, { recursive: true });
          writeFileSync(this.ninjaFilePath, content.join('\n'));
        },
      },
      {
        label: magenta(`Building ${this.name}`),
        cmd: '',
        fn: async () => {
          try {
            let cmd = `ninja -f ${this.ninjaFilePath}`;
            if (process.argv.includes('--verbose')) cmd += ' --verbose';
            execSync(cmd, {
              stdio: 'inherit',
            });
          } catch {
            throw '';
          }
        },
      },
    ];
  }

  async buildCCRules() {
    let compiler = this.prefix + this.cc;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags = [
      ...this.sysIncludedirs.map((x) => `-isystem ${x}`),
      ...this.includedirs.map((x) => `-I${x}`),
      ...this.cflags,
      ...this.cxflags,
    ].join(' ');
    return [
      `rule ${this.constructor.name}_CC`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildCXXRules() {
    let compiler = this.prefix + this.cxx;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags = [
      ...this.sysIncludedirs.map((x) => `-isystem ${x}`),
      ...this.includedirs.map((x) => `-I${x}`),
      ...this.cxxflags,
      ...this.cxflags,
    ].join(' ');

    return [
      `rule ${this.constructor.name}_CXX`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildObjs() {
    const outDir = join(this.buildDir, this.cacheDirname, this.objOutDirname);

    const res = this.files.map((f) => {
      const out = join(outDir, f + this.objOutSuffix);
      return {
        cmd: `build ${out}: ${this.constructor.name}_${
          this.isCFile(f) ? 'CC' : 'CXX'
        } ${f}`,
        out,
      };
    });
    const cmd = res.map((x) => x.cmd).join('\n');
    const outs = res.map((x) => x.out);
    return { cmd, outs };
  }

  async buildExecutable(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ld;
    return [
      `rule ${this.constructor.name}_LD`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `-L${x}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.ldflags,
      ].join(' ')} $in -o $out`,
      '',
      `build ${distFile}: ${this.constructor.name}_LD ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildShared(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.sh;
    return [
      `rule ${this.constructor.name}_SH`,
      `  command = ${[
        linker,
        ...this.linkdirs.map((x) => `-L${x}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.shflags,
        '-shared',
      ].join(' ')} $in -o $out`,
      '',
      `build ${distFile}: ${this.constructor.name}_SH ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildStatic(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ar;
    return [
      `rule ${this.constructor.name}_SH`,
      `  command = ${[linker, ...this.arflags].join(' ')} cr $out $in`,
      '',
      `build ${distFile}: ${this.constructor.name}_SH ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async clean() {
    await super.clean();
    rmSync(this.outputPath, {
      force: true,
    });
    rmSync(this.ninjaFilePath, {
      force: true,
    });
  }
}
