const { LLVM_Darwin } = require('./lib');

class darwin_arm64 extends LLVM_Darwin {
  // target = 'arm64-apple-darwin';
  constructor() {
    super();
    this.ARCH = 'arm64';
    this.files = ['examples/src/main.cpp'];
  }
}

class darwin_x86_64 extends LLVM_Darwin {
  // ARCH = 'x86_64';
  files = ['examples/src/main.cpp'];
}

const a = new darwin_arm64('a');
// a.ARCH = 'arm64';
// a.target = 'arm64-apple-darwin';
console.log(a.target);
console.log(a._target);

// const darwin_arm64_2 = new LLVM_Darwin();
// darwin_arm64_2.ARCH = 'arm64'
// darwin_arm64_2.files = ['examples/src/main.cpp'];

module.exports = {
  targets: [
    {
      name: 'main',
      targets: [darwin_arm64, darwin_x86_64],
    },
  ],
};