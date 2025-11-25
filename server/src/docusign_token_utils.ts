import { DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID } from './constants';
import fs from 'fs';
import { docusignClient } from './docusign_client';

const ACCESS_TOKEN_LIFE = 60 * 60;
const SCOPES = ['signature', 'impersonation'];

let tokenLiveTill = 0;
let accessToken: string | undefined = undefined;

const isAccessTokenValid = (): boolean => {
  return !!accessToken && Date.now() < tokenLiveTill;
};

export const ensureAccessToken = async (): Promise<string> => {
  if (!isAccessTokenValid()) {
    console.log('Requesting access token from Docusign');

    console.log(DOCUSIGN_INTEGRATION_KEY);
    console.log(DOCUSIGN_USER_ID);
    const result = await docusignClient.requestJWTUserToken(
      DOCUSIGN_INTEGRATION_KEY,
      DOCUSIGN_USER_ID,
      SCOPES,
      fs.readFileSync('./id_rsa'),
      ACCESS_TOKEN_LIFE
    );

    accessToken = result.body.access_token;
    tokenLiveTill = Date.now() + (ACCESS_TOKEN_LIFE - 1 * 60) * 1000;

    console.log('Got access token from Docusign');
  }

  return accessToken!;
};

interface Account {
  accountId: string;
  basePath: string;
}

let account: Account | undefined = undefined;

export const ensureAccount = async (): Promise<Account> => {
  if (account) {
    return account;
  }

  console.log('Requesting account info from Docusign');
  const response = await docusignClient.getUserInfo(await ensureAccessToken());
  console.log('Got account info from Docusign');
  account = {
    accountId: response.accounts[0].accountId,
    basePath: response.accounts[0].baseUri + '/restapi',
  };

  return account;
};
