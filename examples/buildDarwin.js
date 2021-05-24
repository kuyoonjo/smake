const { LLVM_Darwin } = require('../lib');

// process.env.SMAKE_LLVM_PREFIX = '/opt/homebrew/opt/llvm/bin/';
const ARCH = 'arm64';

class darwin_executable extends LLVM_Darwin {
  ARCH = ARCH;
  files = ['src/main.c'];
}

class darwin_static extends LLVM_Darwin {
  ARCH = ARCH;
  type = 'static';
  files = ['src/lib.cpp'];
}
class darwin_static_executable extends LLVM_Darwin {
  ARCH = ARCH;
  files = ['src/libmain.cpp'];
  libs = [darwin_static];
}

class darwin_shared extends LLVM_Darwin {
  ARCH = ARCH;
  type = 'shared';
  files = ['src/dll.cpp'];
}
class darwin_shared_executable extends LLVM_Darwin {
  ARCH = ARCH;
  files = ['src/dllmain.cpp'];
  libs = [darwin_shared];
}

module.exports = {
  targets: [
    darwin_executable,
    darwin_static,
    darwin_static_executable,
    darwin_shared,
    darwin_shared_executable,
  ]
};