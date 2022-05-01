import { homedir } from './homedir';
import { join } from './join';

export const smakeDataDir =
  process.platform === 'win32'
    ? join(homedir(), 'AppData', 'Local', 'smake')
    : join(homedir(), '.smake');
