import { CACHE_DIR, downloadNodejs } from '../downloadNodejs';
import { LLVM_Linux } from '../LLVM/Linux';

export abstract class NODE_ADDON_Linux extends LLVM_Linux {
  get NODE_VERSION() {
    return process.version;
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
    return super.includedirs.concat([
      `${CACHE_DIR}/${this.NODE_VERSION}/include/node`,
    ]);
  }

  async generateCommands() {
    await downloadNodejs(this.NODE_VERSION);
    return super.generateCommands();
  }
}
