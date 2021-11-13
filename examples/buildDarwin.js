const { LLVM } = require('../lib');

const executable = new LLVM('executable', 'arm64-apple-darwin');
executable.files = ['examples/src/main.c'];

const static = new LLVM('static', 'arm64-apple-darwin');
static.type = 'static';
static.files = ['examples/src/lib.cpp'];

const static_executable = new LLVM('static_executable', 'arm64-apple-darwin');
static_executable.files = ['examples/src/libmain.cpp'];
static_executable.libs = [static];

const shared = new LLVM('shared', 'arm64-apple-darwin');
shared.type = 'shared';
shared.files = ['examples/src/dll.cpp'];

const shared_executable = new LLVM('shared_executable', 'arm64-apple-darwin');
shared_executable.files = ['examples/src/dllmain.cpp'];
shared_executable.libs = [shared];

module.exports = [
  executable,
  static,
  static_executable,
  shared,
  shared_executable,
];