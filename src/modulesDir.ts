import { resolve } from 'path';

export function modulesDir() {
  let dir = resolve(__dirname, '..', '..');
  if (process.platform === 'win32') {
    dir = dir.replace(/\\/g, '/');
  }
  return dir;
}
