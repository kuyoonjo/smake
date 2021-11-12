import { property } from '../property';
import { LLVM } from './LLVM';

export class LLVM_Linux extends LLVM {
  @property({
    get: self => {
      if (self._sysroot) return self._sysroot;
      return process.env[
        'SMAKE_LLVM_SYSROOT_' + self.target.toUpperCase().replace(/-/g, '_')
      ];
    }
  })
  sysroot!: string;

  @property({
    get: (self) => {
      switch (self._target) {
        case 'x86_64-linux-gnu':
          return 'x86_64';
        case 'aarch64-linux-gnu':
          return 'arm64';
        case 'arm-linux-gnueabihf':
          return 'arm';
      }
      return '';
    },
    set: (self, _, value) => {
      switch (value) {
        case 'x86_64':
          self.target = 'x86_64-linux-gnu';
          break;
        case 'arm64':
          self.target = 'aarch64-linux-gnu';
          break;
        case 'arm':
          self.target = 'arm-linux-gnueabihf';
          break;
      }
    },
  })
  arch: 'x86_64' | 'arm64' | 'arm' = 'x86_64';
  @property()
  target!: 'x86_64-linux-gnu' | 'aarch64-linux-gnu' | 'arm-linux-gnueabihf';

  @property({
    get: self => {
      if (self._cxflags) return self._cxflags;
      const flags = [`--sysroot ${self.sysroot}`, '-Qunused-arguments'];
      if (self.type === 'shared') flags.push('-fPIC');
      else if (self.type === 'executable')
        flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
      return flags;
    }
  })
  cxflags!: string[];

  @property({
    get: self => {
      if (self._ldflags) return self._ldflags;
      return [
        `--sysroot ${self.sysroot}`,
        '-fuse-ld=lld',
        `-target ${self.target}`,
      ];
    }
  })
  ldflags!: string[];

  @property({
    get: self => {
      if (self._shflags) return self._shflags;
      return [
        `--sysroot ${self.sysroot}`,
        '-fuse-ld=lld',
        `-target ${self.target}`,
        '-fPIC',
        '-shared',
      ];
    }
  })
  shflags!: string[];
}
