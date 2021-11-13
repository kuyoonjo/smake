const build = require('./build');

module.exports = [
  ...build('aarch64-linux-gnu'),
  ...build('x86_64-linux-gnu'),
  ...build('arm-linux-gnueabihf'),
];