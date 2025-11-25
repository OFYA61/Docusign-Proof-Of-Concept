import dotenv from 'dotenv';

dotenv.config();

export const DOCUSIGN_INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY as string;
export const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID as string;
export const DOCUSIGN_CONNECT_HMAC_KEY = process.env.DUCUSIGN_CONNECT_HMAC_KEY as string;
