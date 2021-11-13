import { rmSync } from 'fs';
import { join } from './join';

const BUILD_DIR = '.smake';

export const SMAKE_LIB_PATH = __dirname;

export interface ICommand {
  label: string;
  cmd?: string;
  fn?: () => Promise<void>;
}

export abstract class Toolchain {
  constructor(public id: string) {}

  get buildDir() {
    return BUILD_DIR;
  }
  get cacheDirname() {
    return '.' + this.id;
  }

  readonly deps: Set<any> = new Set();

  addDeps(...deps: any[]) {
    for (const dep of deps) {
      if (!this.deps.has(dep)) {
        this.deps.add(dep);
        dep(this);
      }
    }
  }

  abstract generateCommands(first: boolean, last: boolean): Promise<ICommand[]>;

  async clean() {
    rmSync(join(this.buildDir, this.cacheDirname), {
      recursive: true,
      force: true,
    });
  }
}
