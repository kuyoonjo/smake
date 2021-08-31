const { LLVM_Win32 } = require('../lib');

class win32_executable extends LLVM_Win32 {
  useLldLink = true;
  files = ['src/main.c'];
}

class win32_static extends LLVM_Win32 {
  type = 'static';
  files = ['src/lib.cpp'];
}
class win32_static_executable extends LLVM_Win32 {
  useLldLink = true;
  files = ['src/libmain.cpp'];
  libs = [
    ...super.libs,
    win32_static,
  ];
}

class win32_shared extends LLVM_Win32 {
  useLldLink = true;
  type = 'shared';
  files = ['src/dll.cpp'];
}
class win32_shared_executable extends LLVM_Win32 {
  useLldLink = true;
  files = ['src/dllmain.cpp'];
  libs = [
    ...super.libs,
    win32_shared,
  ];
}

module.exports = {
  targets: [
    win32_executable,
    win32_static,
    win32_static_executable,
    win32_shared,
    win32_shared_executable,
  ],
};
