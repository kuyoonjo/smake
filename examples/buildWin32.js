const build = require('./build');

module.exports = [
  ...build('x86_64-pc-windows-msvc'),
  ...build('i386-pc-windows-msvc'),
];