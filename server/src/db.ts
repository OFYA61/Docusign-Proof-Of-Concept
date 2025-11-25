import fs from 'fs';
import { Envelope, DBSchema, SignatureStatus } from './types';

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

export const changeSignatureStatus = (envelopeId: string, email: string, signatureStatus: SignatureStatus): void => {
  DB.envelopes[envelopeId].signatures = DB.envelopes[envelopeId].signatures.map(signature => {
    if (signature.user.email === email) {
      let s = signature;
      s.status = signatureStatus;
      return s;
    }
    return signature;
  });
  saveDB();
};

export const saveUserUUID = (UUID: string, email: string): void => {
  DB.users[UUID] = email;
  saveDB();
};

export const getUUIDEmail = (UUID: string): string => {
  return DB.users[UUID];
}
