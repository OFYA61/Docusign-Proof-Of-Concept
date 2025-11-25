import fs from 'fs';
import { Envelope } from './types.js';

export let DB = {};

export const initDB = async () => {
  DB = JSON.parse(fs.readFileSync('DB.json', 'utf8'));
};

const saveDB = async () => {
  fs.writeFileSync('DB.json', JSON.stringify(DB, null, 2), 'utf8');
}

/**
 * @param envolope {Envelope} envolope to add to DB
 */
export const addEnvelope = envelope => {
  DB[envelope.envelopeId] = envelope;
  saveDB();
};

/**
 * @param envolopeId {string} envelope ID to mark as complete
 */
export const markEnvelopeComplete = envelopeId => {
  DB[envelopeId].status = 'COMPLETE';
  saveDB();
};

/**
 * @param envelopeId {string} signed envelope ID
 * @param email {string} email of the user who signed
 */
export const markSignatureComplete = (envelopeId, email) => {
  let changedSignature = DB[envelopeId].signatures.find(signature => signature.user.email == email);
  if (changedSignature) {
    DB[envelopeId].signatures = [...DB[envelopeId].signatures, changedSignature];
    return;
  }
  console.error(`User ${email} doesn't have a signature on ${envelopeId}`);
}
