const { LLVM } = require('./lib');

const darwin_arm64 = new LLVM('main', 'arm64-apple-darwin');
darwin_arm64.files = ['examples/src/main.cpp'];

const darwin_x86_64 = new LLVM('main', 'x86_64-apple-darwin');
darwin_x86_64.files = ['examples/src/main.cpp'];

module.exports = {
  targets: [
    {
      name: 'main',
      targets: [darwin_arm64, darwin_x86_64],
    },
  ],
};