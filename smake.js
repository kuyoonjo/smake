const { LLVM_Darwin } = require('./lib');

class darwin_arm64 extends LLVM_Darwin {
  ARCH = 'arm64';
  files = ['examples/src/main.cpp'];
}

class darwin_x86_64 extends LLVM_Darwin {
  ARCH = 'x86_64';
  files = ['examples/src/main.cpp'];
}

module.exports = {
  targets: [
    {
      name: 'main',
      targets: [darwin_arm64, darwin_x86_64],
    },
  ],
};