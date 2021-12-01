import { get } from 'https';
import * as Url from 'url';
import { Starter } from './starters';
import * as HttpsProxyAgentModule from 'https-proxy-agent';

export function downloadStarter(starter: Starter) {
  return downloadFromURL(`https://github.com/${starter.repo}/archive/main.zip`);
}

function downloadFromURL(url: string): Promise<Buffer> {
  const options = Url.parse(url);
  if (process.env.https_proxy) {
    // @ts-ignore
    const agent = new HttpsProxyAgentModule.default(process.env.https_proxy);
    // @ts-ignore
    options.agent = agent;
  }
  return new Promise((resolve, reject) => {
    get(options, res => {
      if (res.statusCode === 302) {
        downloadFromURL(res.headers.location!).then(resolve, reject);
      } else {
        const data: any[] = [];

        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          resolve(Buffer.concat(data));
        });
        res.on('error', reject);
      }
    });
  });
}
