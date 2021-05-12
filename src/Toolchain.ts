import { rmSync } from 'fs';
import { join } from 'path';

const BUILD_DIR = '.smake';

export interface ICommand {
  label: string;
  cmd: string;
}

export abstract class Toolchain {
  get buildDir() {
    return BUILD_DIR;
  }
  get cacheDirname() {
    return '.' + this.constructor.name;
  }

  abstract generateCommands(): ICommand[];

  clean() {
    rmSync(join(this.buildDir, this.cacheDirname), {
      recursive: true,
      force: true,
    });
  }
}
