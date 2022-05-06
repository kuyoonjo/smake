import { Target } from './Target';

export function ls(targets: Target[]) {
  printTargets(targets);
}

function printTargets(targets: Target[], prefix = '', pad = '') {
  for (const t of targets) {
    const ta = t as any;
    if (ta.generateCommands) {
      console.log(pad + '-', prefix + ta.id);
    } else {
      console.log(pad + '-', prefix + ta.name);
      printTargets(ta.targets, prefix + ta.name + ':', pad + '  ');
    }
  }
}
