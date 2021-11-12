import {
  NODEJS_CACHE_DIR,
  downloadNodejs,
  ATOM_SHELL_CACHE_DIR,
} from '../downloadNodejs';
import { join } from '../join';
import { LLVM_Darwin } from '../LLVM/Darwin';
import { property } from '../property';

export abstract class NODE_ADDON_Darwin extends LLVM_Darwin {
  NODE_VERSION = process.version;
  NODE_TYPE = 'nodejs';
  type: 'shared' = 'shared';

  @property({
    get: self => {
      if (self._cxflags) return self._cxflags;
      const flags = [
        `-arch ${self.arch}`,
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
  })
  cxflags!: string[];

  sharedOutPrefix = '';
  sharedOutSuffix = '.node';

  @property({
    get: self => {
      if (self._shflags) return self._shflags;
      const flags = [
        '-fPIC',
        `-arch ${self.arch}`,
        `-install_name @rpath/${self.outputFilename}`,
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
  })
  shflags!: string[];

  @property({
    get: self => {
      if (self._includedirs) return self._includedirs;
      let cacheDir: string;
      switch (self.NODE_TYPE) {
        case 'electron':
          cacheDir = join(ATOM_SHELL_CACHE_DIR, self.NODE_VERSION);
          break;
        default:
          cacheDir = join(NODEJS_CACHE_DIR, self.NODE_VERSION);
      }
      return self.superIncludedirs.concat([`${cacheDir}/include/node`]);
    }
  }) includedirs!: string[];
  get superIncludedirs() {
    return super.includedirs;
  }

  async generateCommands(first: boolean, last: boolean) {
    await downloadNodejs(this.NODE_TYPE, this.NODE_VERSION);
    return super.generateCommands(first, last);
  }
}
