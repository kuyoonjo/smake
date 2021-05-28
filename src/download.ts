import * as d from 'download';
import { yellow } from 'colors/safe';
import { createWriteStream } from 'fs';

export async function download(name: string, url: string, dist: string) {
  const data = d(url);

  const writer = createWriteStream(dist);
  let responsed = false;
  data.on('response', (res) => {
    const clk = Object.keys(res.headers).find(
      (k) => k.toLowerCase() === 'content-length'
    );
    if (clk) {
      if (responsed) return;
      responsed = true;
      const totalLength = res.headers[clk];
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
    }
  });
  data.pipe(writer);
  await data;
  console.log();
}
