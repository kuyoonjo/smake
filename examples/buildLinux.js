const { LLVM_Linux } = require('../lib');

const target = 'aarch-linux-gnu';

class linux_executable extends LLVM_Linux {
  target = target;
  files = ['src/main.c'];
}

class linux_static extends LLVM_Linux {
  target = target;
  type = 'static';
  files = ['src/lib.cpp'];
}
class linux_static_executable extends LLVM_Linux {
  target = target;
  files = ['src/libmain.cpp'];
  libs = [linux_static];
}

class linux_shared extends LLVM_Linux {
  target = target;
  type = 'shared';
  files = ['src/dll.cpp'];
}
class linux_shared_executable extends LLVM_Linux {
  target = target;
  files = ['src/dllmain.cpp'];
  libs = [linux_shared];
}

module.exports = {
  targets: [
    linux_executable,
    linux_static,
    linux_static_executable,
    linux_shared,
    linux_shared_executable,
  ],
};
