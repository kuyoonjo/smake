import { homedir as hd } from 'os';

export function homedir() {
  let dir = hd();
  if (process.platform === 'win32') {
    dir = dir.replace(/\\/g, '/');
  }
  return dir;
}
