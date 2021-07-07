import {
  NODEJS_CACHE_DIR,
  downloadNodejs,
  ATOM_SHELL_CACHE_DIR,
} from '../downloadNodejs';
import { join } from '../join';
import { LLVM_Linux } from '../LLVM/Linux';

export abstract class NODE_ADDON_Linux extends LLVM_Linux {
  get NODE_VERSION() {
    return process.version;
  }
  get NODE_TYPE() {
    return 'nodejs';
  }
  get type() {
    return 'shared' as any;
  }
  get name() {
    return 'Linux Node Addon Builder';
  }
  get cxflags() {
    const flags = [
      `--sysroot ${this.sysroot}`,
      '-Qunused-arguments',
      '-Daddon_EXPORTS',
      '-O3',
      '-fPIC',
      '-DNDEBUG',
    ];
    return flags;
  }

  get sharedOutPrefix() {
    return '';
  }
  get sharedOutSuffix() {
    return '.node';
  }

  get includedirs() {
    let cacheDir: string;
    switch (this.NODE_TYPE) {
      case 'electron':
        cacheDir = join(ATOM_SHELL_CACHE_DIR, this.NODE_VERSION);
        break;
      default:
        cacheDir = join(NODEJS_CACHE_DIR, this.NODE_VERSION);
    }
    return super.includedirs.concat([`${cacheDir}/include/node`]);
  }

  async generateCommands(first: boolean, last: boolean) {
    await downloadNodejs(this.NODE_TYPE, this.NODE_VERSION);
    return super.generateCommands(first, last);
  }
}
