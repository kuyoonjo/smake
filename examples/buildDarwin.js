const { run, LLVM_Darwin } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const ARCH = 'arm64';

class darwin_executable extends LLVM_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  files = ['src/main.c'];
}

class darwin_static extends LLVM_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  type = 'static';
  files = ['src/lib.cpp'];
}
class darwin_static_executable extends LLVM_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  files = ['src/libmain.cpp'];
  libs = [darwin_static];
}

class darwin_shared extends LLVM_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  type = 'shared';
  files = ['src/dll.cpp'];
}
class darwin_shared_executable extends LLVM_Darwin {
  prefix = prefix;
  ARCH = ARCH;
  files = ['src/dllmain.cpp'];
  libs = [darwin_shared];
}

run([
  darwin_executable,
  darwin_static,
  darwin_static_executable,
  darwin_shared,
  darwin_shared_executable,
], process.argv.slice(2));