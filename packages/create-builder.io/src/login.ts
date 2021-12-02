import { join } from 'path';
import { userInfo } from 'os';
import { readJSON, existsSync, outputJSON } from 'fs-extra';
import http from 'http';
import { bold, yellowBright } from 'colorette';
import { Spinner } from 'cli-spinner';
import { HOST, openBuilderAuth } from './open';
import { askQuestion } from './utils';

interface Credentials {
  version: '1';
  privateKey?: string;
  apiKey?: string;
}

let credential: Credentials | undefined;

export const getCredentialsFilePath = () => {
  const info = userInfo();
  return join(info.homedir, '.config', 'builder', 'credentials.json');
};

export const getLogin = async () => {
  if (credential) {
    return credential;
  }
  const credentialsPath = getCredentialsFilePath();
  try {
    if (existsSync(credentialsPath)) {
      const file = await readJSON(credentialsPath);
      if (typeof file === 'object' && file != null && file.version === '1') {
        credential = file;
        return credential;
      }
    }
  } catch (err) {
    console.error(err);
    return undefined;
  }
  return await login();
};

export const mustLogin = async () => {
  const login = await getLogin();
  if (!login) {
    throw new Error('Login with builder.io failed');
  }
  return login;
};

export const mustGetApiKey = async () => {
  const l = await mustLogin();
  if (!l.apiKey) {
    return (await login()).apiKey;
  }
  return l.apiKey;
};

export const mustGetPrivateKey = async () => {
  const l = await mustLogin();
  if (!l.privateKey) {
    return (await login()).privateKey;
  }
  return l.privateKey;
};

export const login = async () => {
  const token = await getNewToken();
  credential = await saveLogin(token);
  return credential as Required<Credentials>;
};

interface LoginData {
  privateKey: string;
  apiKey: string;
}

export const saveLogin = async (input: Partial<LoginData>): Promise<Credentials> => {
  const credentialsPath = getCredentialsFilePath();
  const data: Credentials = {
    ...(credential || {}),
    version: '1',
  };
  if (input.privateKey) {
    data.privateKey = input.privateKey;
  }
  if (input.apiKey) {
    data.apiKey = input.apiKey;
  }
  credential = data;
  await outputJSON(credentialsPath, data);
  return data;
};

const CLIENT_ID = 'create-builder';
const PORT = 10110;

const getNewToken = () => {
  console.log(`\n🔑 ${yellowBright(bold('Login required'))}`);

  return askQuestion(
    ` Your browser will open to complete authentication. ${bold('Confirm?')}`
  ).then(next => {
    if (!next) {
      throw new Error('aborted');
    }
    const loading = new Spinner(bold(' Waiting for authorization...'));
    return new Promise<LoginData>((resolve, reject) => {
      const server = http
        .createServer((req, res) => {
          const parsedUrl = new URL(req.url!, 'http://localhost:10110/');
          if (parsedUrl.pathname !== '/auth') {
            reject(new Error('Bad path'));
            return;
          }
          const queryAsObject = parsedUrl.searchParams;
          const privateKey = queryAsObject.get('p-key');
          if (!privateKey) {
            reject(new Error('Missing p-key'));
            return;
          }

          const apiKey = queryAsObject.get('api-key');
          if (!apiKey) {
            reject(new Error('Missing api-key'));
            return;
          }

          res.writeHead(302, {
            Location: `${HOST}/cli-auth?success=true`,
          });
          res.end();
          req.socket.end();
          req.socket.destroy();
          server.close();
          loading.stop(true);
          resolve({
            privateKey,
            apiKey,
          });
        })
        .listen(PORT);

      loading.setSpinnerString(8);
      loading.start();

      openBuilderAuth(PORT, CLIENT_ID);
    });
  });
};
