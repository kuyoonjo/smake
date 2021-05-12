import { LLVM } from './LLVM';

export abstract class LLVM_Darwin extends LLVM {
  get ARCH() {
    return 'x86_64';
  }
  get target() {
    switch (this.ARCH) {
      case 'x86_64':
        return 'x86_64-apple-darwin13';
      case 'arm64':
        return 'arm64-apple-darwin20.3.0';
      default:
        return '';
    }
  }
  get name() {
    return 'Darwin LLVM Builder';
  }
  get cxflags() {
    const flags = [`-arch ${this.ARCH}`, '-Qunused-arguments'];
    if (this.type === 'shared') flags.push('-fPIC');
    else if (this.type === 'executable')
      flags.push('-fvisibility=hidden  -fvisibility-inlines-hidden');
    return flags;
  }
  get ldflags() {
    const flags = [`-arch ${this.ARCH}`];
    if (this.libs.length) flags.push('-Xlinker -rpath -Xlinker @loader_path');
    return flags;
  }
  get sharedOutSuffix() {
    return '.dylib';
  }
  get shflags() {
    const flags = [
      '-fPIC',
      `-arch ${this.ARCH}`,
      `-install_name @rpath/${this.outputFilename}`,
    ];
    if (this.libs.length) flags.push('-Xlinker -rpath -Xlinker @loader_path');
    return flags;
  }
}
