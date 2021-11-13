const targets = require('./buildDarwin');

for (const t of targets)
  t.target = 'aarch64-linux-gnu';

module.exports = targets;