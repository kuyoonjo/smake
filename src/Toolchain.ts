import { rmSync } from 'fs';
import { join } from './join';

const BUILD_DIR = '.smake';

export const SMAKE_LIB_PATH = __dirname;

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

  abstract generateCommands(first: boolean, last: boolean): Promise<ICommand[]>;

  async clean() {
    rmSync(join(this.buildDir, this.cacheDirname), {
      recursive: true,
      force: true,
    });
  }
}
