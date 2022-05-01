import { rm } from 'fs/promises';
import { join } from './join';

const BUILD_DIR = '.smake';

export interface ICommand {
  label: string;
  command: string | [string, string[]] | ((opts: any) => Promise<void>);
}

export abstract class Toolchain {
  private constructor(public id: string) {}

  get buildDir() {
    return BUILD_DIR;
  }
  get cacheDirname() {
    return '.' + this.id;
  }

  abstract generateCommands(first: boolean, last: boolean): Promise<ICommand[]>;

  clean = async () => {
    await rm(join(this.buildDir, this.cacheDirname), {
      recursive: true,
      force: true,
    });
  };
}
