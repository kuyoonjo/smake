const { magenta } = require('colors/safe');
const { Toolchain } = require('./lib');

// const builds = [
//   ...require('./examples/buildDarwin'),
//   ...require('./examples/buildLinux'),
//   ...require('./examples/buildWin32'),
//   ...require('./examples/buildNodeAddonDarwin'),
//   ...require('./examples/buildNodeAddonLinux'),
//   ...require('./examples/buildNodeAddonWin32'),
// ];

// class Test extends Toolchain {
//   async generateCommands(_first, _last) {
//     return builds.filter(x => x.type === 'executable')
//       .map(x => {
//         switch (x.target) {
//           case 'arm64-apple-darwin':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `arch -arm64 ${x.outputPath}`,
//             };
//           case 'x86_64-apple-darwin':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `arch -x86_64 ${x.outputPath}`,
//             };
//           case 'aarch64-linux-gnu':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `exec docker run --rm -it -v $PWD:/work docker.io/library/centos:7@sha256:43964203bf5d7fe38c6fca6166ac89e4c095e2b0c0a28f6c7c678a1348ddc7fa bash -c "cd /work && ${x.outputPath}"`,
//             };
//           case 'x86_64-linux-gnu':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `exec docker run --rm -it -v $PWD:/work docker.io/library/centos:7@sha256:e4ca2ed0202e76be184e75fb26d14bf974193579039d5573fb2348664deef76e bash -c "cd /work && ${x.outputPath}"`,
//             };
//           case 'arm-linux-gnueabihf':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `exec docker run --rm -it -v $PWD:/work docker.io/library/centos:7@sha256:9fd67116449f225c6ef60d769b5219cf3daa831c5a0a6389bbdd7c952b7b352d bash -c "cd /work && ${x.outputPath}"`,
//             };
//           case 'x86_64-pc-windows-msvc':
//           case 'i386-pc-windows-msvc':
//             return {
//               label: magenta(`Test ${x.name} ${x.target}`),
//               cmd: `wine ${x.outputPath}`,
//             };
//         }
//       });
//   }
// }

// module.exports = [
//   ...builds,
//   new Test('my-test'),
// ];

class Test {
  constructor(id) {
    this.id = id;
  }
  async generateCommands(_first, _last) {
    return [1,2,3].map(x => ({
      label: `build test ${x}`,
      command: async opt => {
        await new Promise(r => setTimeout(r, 1000));
      }
    }));
  }
}

module.exports = [
new Test('test'),
]