import fs from 'fs';
import { Envelope, DBSchema } from './types.js';

export let DB: DBSchema = {};

export const initDB = async (): Promise<void> => {
  DB = JSON.parse(fs.readFileSync('DB.json', 'utf8')) as DBSchema;
};

const saveDB = async (): Promise<void> => {
  fs.writeFileSync('DB.json', JSON.stringify(DB, null, 2), 'utf8');
};

export const addEnvelope = (envelope: Envelope): void => {
  DB[envelope.envelopeId] = envelope;
  saveDB();
};

export const markEnvelopeComplete = (envelopeId: string): void => {
  DB[envelopeId].status = 'COMPLETE';
  saveDB();
};

export const markSignatureComplete = (envelopeId: string, email: string): void => {
  const changedSignature = DB[envelopeId].signatures.find(
    (signature) => signature.user.email === email
  );
  if (changedSignature) {
    changedSignature.status = 'COMPLETE';
    saveDB();
    return;
  }
  console.error(`User ${email} doesn't have a signature on ${envelopeId}`);
};
