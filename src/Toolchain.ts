import { rmSync } from 'fs';
import { join } from './join';

const BUILD_DIR = '.smake';

export interface ICommand {
  label: string;
  cmd: string;
  fn?: () => Promise<void>;
}

export abstract class Toolchain {
  get buildDir() {
    return BUILD_DIR;
  }
  get cacheDirname() {
    return '.' + this.constructor.name;
  }

  abstract generateCommands(): Promise<ICommand[]>;

  async clean() {
    rmSync(join(this.buildDir, this.cacheDirname), {
      recursive: true,
      force: true,
    });
  }
}
