const targets = require('./buildDarwin');

for (const t of targets)
  t.target = 'x86_64-pc-windows-msvc';

module.exports = targets;