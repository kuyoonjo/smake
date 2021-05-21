import { CACHE_DIR, downloadNodejs } from '../downloadNodejs';
import { LLVM_Darwin } from '../LLVM/Darwin';

export abstract class NODE_ADDON_Darwin extends LLVM_Darwin {
  get NODE_VERSION() {
    return process.version;
  }
  get type() {
    return 'shared' as any;
  }
  get name() {
    return 'Darwin Node Addon Builder';
  }
  get cxflags() {
    const flags = [
      `-arch ${this.ARCH}`,
      '-Qunused-arguments',
      '-Daddon_EXPORTS',
      '-D_DARWIN_USE_64_BIT_INODE=1',
      '-D_LARGEFILE_SOURCE',
      '-D_FILE_OFFSET_BITS=64',
      '-DBUILDING_NODE_EXTENSION',
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
  get shflags() {
    const flags = [
      '-fPIC',
      `-arch ${this.ARCH}`,
      `-install_name @rpath/${this.outputFilename}`,
      '-D_DARWIN_USE_64_BIT_INODE=1',
      '-D_LARGEFILE_SOURCE',
      '-D_FILE_OFFSET_BITS=64',
      '-DBUILDING_NODE_EXTENSION',
      '-O3',
      '-DNDEBUG',
      '-dynamiclib',
      '-Wl,-headerpad_max_install_names',
      '-undefined',
      'dynamic_lookup',
    ];
    return flags;
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
