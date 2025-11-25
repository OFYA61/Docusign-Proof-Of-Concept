import fs from 'fs';
import { Envelope, DBSchema } from './types';

export let DB: DBSchema = { envelopes: {}, users: {} };

export const initDB = async (): Promise<void> => {
  const data = JSON.parse(fs.readFileSync('DB.json', 'utf8'));
  DB = {
    envelopes: data.envelopes ?? {},
    users: data.users ?? {}
  };
};

const saveDB = async (): Promise<void> => {
  fs.writeFileSync('DB.json', JSON.stringify(DB, null, 2), 'utf8');
};

export const addEnvelope = (envelope: Envelope): void => {
  DB.envelopes[envelope.envelopeId] = envelope;
  saveDB();
};

export const markEnvelopeComplete = (envelopeId: string): void => {
  DB.envelopes[envelopeId].status = 'COMPLETE';
  saveDB();
};

export const markSignatureComplete = (envelopeId: string, email: string): void => {
  const changedSignature = DB.envelopes[envelopeId].signatures.find(
    (signature) => signature.user.email === email
  );
  if (changedSignature) {
    changedSignature.status = 'COMPLETE';
    saveDB();
    return;
  }
  console.error(`User ${email} doesn't have a signature on ${envelopeId}`);
};

export const saveUserUUID = (UUID: string, email: string): void => {
  DB.users[UUID] = email;
  saveDB();
};

export const getUUIDEmail = (UUID: string): string => {
  return DB.users[UUID];
}
