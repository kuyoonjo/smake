import { property } from '../property';
import { LLVM } from './LLVM';

export class LLVM_Darwin extends LLVM {
  @property({
    get: (self) => self._target.split('-')[0],
    set: (self, _, value) => {
      self.target = value + '-apple-darwin';
    },
  })
  arch: 'x86_64' | 'arm64' = 'x86_64';
  @property()
  target!: 'x86_64-apple-darwin' | 'arm64-apple-darwin';

  @property({
    get: self => {
      if (self._cxflags) return self._cxflags;
      const flags = [`-arch ${self.arch}`, '-Qunused-arguments'];
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
      const flags = [`-arch ${self.arch}`];
      if (self.libs.length) flags.push('-Xlinker -rpath -Xlinker @loader_path');
      return flags;
    }
  })
  ldflags!: string[];

  sharedOutSuffix = '.dylib';

  @property({
    get: self => {
      if (self._shflags) return self._shflags;
      const flags = [
        '-fPIC',
        `-arch ${self.arch}`,
        `-install_name @rpath/${self.outputFilename}`,
      ];
      if (self.libs.length) flags.push('-Xlinker -rpath -Xlinker @loader_path');
      return flags;
    }
  })
  shflags!: string[];
}
