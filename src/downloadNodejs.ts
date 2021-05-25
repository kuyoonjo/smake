import axios from 'axios';
import { createHash } from 'crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from './join';
import { extract } from 'tar';
import { download } from './download';
import { homedir } from './homedir';

const NODEJS_ORG_MIRROR = 'https://nodejs.org/dist';
export const CACHE_DIR = join(homedir(), '.cache', 'smake', 'nodejs');

export async function downloadNodejs(ver: string = process.version) {
  const cacheDir = join(CACHE_DIR, ver);
  const includeDir = join(cacheDir, 'include');
  const libDir = join(cacheDir, 'lib');

  const headersName = `node-${ver}-headers.tar.gz`;
  const headersDist = join(cacheDir, headersName);

  const libName = 'node.lib';

  const x64libDirname = 'win-x64';
  const x64libName = `${x64libDirname}/${libName}`;
  const x64libDir = join(libDir, x64libDirname);
  mkdirSync(x64libDir, { recursive: true });
  const x64libDist = join(libDir, x64libDirname, libName);

  const x86libDirname = 'win-x86';
  const x86libName = `${x86libDirname}/${libName}`;
  const x86libDir = join(libDir, x86libDirname);
  mkdirSync(x86libDir, { recursive: true });
  const x86libDist = join(libDir, x86libDirname, libName);

  const includeDirCached = existsSync(includeDir);
  const x64libCached = existsSync(x64libDist);
  const x86libCached = existsSync(x86libDist);

  if (includeDirCached && x64libCached && x86libCached) return;

  const mirror = process.env.NVM_NODEJS_ORG_MIRROR || NODEJS_ORG_MIRROR;
  const checksumUrl = `${mirror}/${ver}/SHASUMS256.txt`;
  const res = await axios.get(checksumUrl);
  const str = res.data as string;
  const data = str
    .trim()
    .split('\n')
    .map((l) => {
      const [checksum, name] = l.split(/\s+/);
      return { checksum, name };
    });

  if (!includeDirCached) {
    const headersUrl = `${mirror}/${ver}/${headersName}`;
    const headersChecksum = data.find((x) => x.name === headersName)?.checksum;
    await download(headersName, headersUrl, headersDist);
    const headersBuffer = readFileSync(headersDist);
    const headersChecksumComputed = createHash('sha256')
      .update(headersBuffer)
      .digest('hex');
    if (headersChecksumComputed !== headersChecksum) {
      throw `Checksum error: ${headersName} ${headersChecksum} ${headersChecksumComputed}`;
    }
    await extract({
      file: headersDist,
      cwd: cacheDir,
      strip: 1,
    });
  }

  if (!x64libCached) {
    const x64libUrl = `${mirror}/${ver}/${x64libName}`;
    const x64libChecksum = data.find((x) => x.name === x64libName)?.checksum;
    const x64libSaved = join(cacheDir, libName + '.x64');
    await download(x64libName, x64libUrl, x64libSaved);
    const x64libBuffer = readFileSync(x64libSaved);
    const x64libChecksumComputed = createHash('sha256')
      .update(x64libBuffer)
      .digest('hex');
    if (x64libChecksumComputed !== x64libChecksum) {
      throw `Checksum error: ${x64libName} ${x64libChecksum} ${x64libChecksumComputed}`;
    }
    copyFileSync(x64libSaved, x64libDist);
  }

  if (!x86libCached) {
    const x86libUrl = `${mirror}/${ver}/${x86libName}`;
    const x86libChecksum = data.find((x) => x.name === x86libName)?.checksum;
    const x86libSaved = join(cacheDir, libName + '.x86');
    await download(x86libName, x86libUrl, x86libSaved);
    const x86libBuffer = readFileSync(x86libSaved);
    const x86libChecksumComputed = createHash('sha256')
      .update(x86libBuffer)
      .digest('hex');
    if (x86libChecksumComputed !== x86libChecksum) {
      throw `Checksum error: ${x86libName} ${x86libChecksum} ${x86libChecksumComputed}`;
    }
    copyFileSync(x86libSaved, x86libDist);
  }
}

downloadNodejs();
