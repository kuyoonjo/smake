import { red } from 'colors/safe';

export const Log = {
  i(...args: any[]) {
    console.log(...args);
  },
  e(...args: any[]) {
    console.log(red('Error:'), ...args);
  },
};
