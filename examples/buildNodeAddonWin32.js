const build = require('./buildNodeAddon');

module.exports = [
  build('x86_64-pc-windows-msvc'),
  build('i386-pc-windows-msvc'),
];