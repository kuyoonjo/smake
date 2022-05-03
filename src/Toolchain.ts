export interface ICommand {
  label: string;
  command: string | [string, string[]] | ((opts: any) => Promise<void>);
}

export interface IToolchain {
  id: string;
  generateCommands(first: boolean, last: boolean): Promise<ICommand[]>;
  clean?(): Promise<void>;
}
