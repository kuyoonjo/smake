import * as d from 'download';
import { yellow } from 'colors/safe';
import { createWriteStream } from 'fs';

export async function download(name: string, url: string, dist: string) {
  const data = d(url);

  const writer = createWriteStream(dist);
  data.on('response', (res) => {
    const totalLength = res.headers['content-length'];
    let downloadedLength = 0;
    data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      process.stdout.write(
        [
          'Downloading ',
          yellow(name),
          ' ',
          url,
          ' ',
          (((downloadedLength / totalLength) * 100).toFixed(1) + '%').padEnd(
            6,
            ' '
          ),
          '\r',
        ].join('')
      );
    });
  });
  data.pipe(writer);
  await data;
  console.log();
}
