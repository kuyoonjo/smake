import { execSync } from 'child_process';
import { magenta } from 'colors/safe';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { homedir } from '../homedir';
import { join } from '../join';
import { quote } from '../quote';
import { ICommand, Toolchain } from '../Toolchain';

const PREBUILT_DIR = homedir() + '/.smake-prebuilt';

export abstract class LLVM extends Toolchain {
  abstract get files(): string[];
  private static __compdb = [];
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

  get useClangHeaders() {
    return false;
  }

  get includedirs(): string[] {
    return [];
  }
  get sysIncludedirs(): string[] {
    if (this.useClangHeaders && process.env.SMAKE_LLVM_CLANG_PATH)
      return [process.env.SMAKE_LLVM_CLANG_PATH + '/include'];
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
  get asmflags(): string[] {
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
  get arobjs(): string[] {
    return [];
  }

  get debugFlags(): string {
    if (process.argv.includes('--debug')) return ' -g';
    return '';
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

  get compdbFilePath() {
    return 'compile_commands.json';
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

  isASMFile(f: string) {
    return f.endsWith('.s') || f.endsWith('.S') || f.endsWith('.asm');
  }

  async generateCommands(first: boolean, last: boolean): Promise<ICommand[]> {
    const { cmd, outs } = await this.buildObjs();
    const content = [
      await this.buildCCRules(),
      await this.buildCXXRules(),
      await this.buildASMRules(),
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
      process.argv.includes('--compdb')
        ? {
          label: magenta(`Compdb ${this.name}`),
          cmd: '',
          fn: async () => {
            try {
              let cmd = `ninja -f ${this.ninjaFilePath} -t compdb`;
              const json = execSync(cmd).toString();
              const arr = JSON.parse(json);
              if (first) LLVM.__compdb = [];
              LLVM.__compdb = LLVM.__compdb.concat(arr);
              if (last)
                writeFileSync(
                  this.compdbFilePath,
                  JSON.stringify(LLVM.__compdb, null, 2)
                );
            } catch {
              throw '';
            }
          },
        }
        : {
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
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cflags,
        ...this.cxflags,
      ].join(' ') + this.debugFlags;
    return [
      `rule ${this.constructor.name}_CC`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildCXXRules() {
    let compiler = this.prefix + this.cxx;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cxxflags,
        ...this.cxflags,
      ].join(' ') + this.debugFlags;

    return [
      `rule ${this.constructor.name}_CXX`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildASMRules() {
    let compiler = this.prefix + this.cc;
    if (this.target) compiler += ` -target ${this.target}`;
    const flags =
      [
        ...this.sysIncludedirs.map((x) => `-isystem ${quote(x)}`),
        ...this.includedirs.map((x) => `-I${quote(x)}`),
        ...this.cflags,
        ...this.asmflags,
      ].join(' ') + this.debugFlags;
    return [
      `rule ${this.constructor.name}_ASM`,
      '  depfile = $out.d',
      `  command = ${compiler} -MD -MF $out.d ${flags} -c $in -o $out`,
    ].join('\n');
  }

  async buildObjs() {
    const outDir = join(this.buildDir, this.cacheDirname, this.objOutDirname);

    const res = this.files.map((f) => {
      const out = join(outDir, f.replace(/\.\./g, '_') + this.objOutSuffix);
      return {
        cmd: `build ${out}: ${this.constructor.name}_${this.isCXXFile(f) ? 'CXX' : this.isASMFile(f) ? 'ASM' : 'CC'
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
        ...this.linkdirs.map((x) => `-L${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.ldflags,
      ].join(' ') + this.debugFlags
      } $in -o $out`,
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
        ...this.linkdirs.map((x) => `-L${quote(x)}`),
        ...this.libs.map(
          (x: any) =>
            `-l${typeof x === 'string' ? x : new x().outputFileBasename}`
        ),
        ...this.shflags,
        '-shared',
      ].join(' ') + this.debugFlags
      } $in -o $out`,
      '',
      `build ${distFile}: ${this.constructor.name}_SH ${objFiles.join(' ')}`,
    ].join('\n');
  }

  async buildStatic(objFiles: string[], distFile: string) {
    const linker = this.prefix + this.ar;
    return [
      `rule ${this.constructor.name}_AR`,
      `  command = ${[linker, ...this.arflags].join(
        ' '
      )} crs $out $in ${this.arobjs.join(' ')}`,
      '',
      `build ${distFile}: ${this.constructor.name}_AR ${objFiles.join(' ')}`,
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

  addPrebuiltDeps(lib: string, version: string) {
    const dir = join(PREBUILT_DIR, lib, version, this.target);
    const incDir = join(dir, 'include');
    const libDir = join(dir, 'lib');
    if (existsSync(incDir))
      Object.defineProperty(this, 'includedirs', {
        value: [
          ...this.includedirs,
          incDir,
        ],
      });
    if (existsSync(libDir))
      Object.defineProperty(this, 'linkdirs', {
        value: [
          ...this.linkdirs,
          incDir,
        ],
      });
  }
}
