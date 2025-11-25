import express from 'express';
import { makeEnvelope, sendEnvelope } from './send_envelope.js';
import { Envelope, Signature, User } from './types.js';
import { addEnvelope, DB, initDB } from './db.js';

const port = 3000;
const app = express().use(express.json());

app.get('/', async (_req, res) => {
  res.send('Poggers');
});

app.get('/callback', async (_req, _res) => {});

interface SendEnvelopeRequest {
  signers?: Array<{ email: string; name: string }>;
  cc_users?: Array<{ email: string; name: string }>;
}

app.post('/send-envelope', async (req, res) => {
  const body = req.body as SendEnvelopeRequest;
  let signers = body.signers ?? [];

  if (signers.length === 0) {
    res
      .status(400)
      .send('What the heck are you doing? There are no destination emails provided here');
    return;
  }

  const cc_users = body.cc_users ?? [];
  const signerUsers = signers.map((user) => new User(user.email, user.name));
  const ccUsers = cc_users.map((user) => new User(user.email, user.name));

  let envelopeResponse;
  try {
    envelopeResponse = await sendEnvelope('Sign the bloody PDF m8', signerUsers, ccUsers);
  } catch (err) {
    console.error(
      'DocuSign error response:',
      (err as any).response && ((err as any).response.body || (err as any).response.data || (err as any).body)
    );
    res.status(400).send(await makeEnvelope('some title', signerUsers, ccUsers));
    return;
  }

  const signatures = signerUsers.map((user) => new Signature(user));
  const envelope = new Envelope(envelopeResponse.envelopeId as string, signatures);
  res.send(envelope);
  addEnvelope(envelope);
});

app.get('/sent-envelopes', async (_req, res) => {
  res.send(DB);
});

app.get('/sent-envelopes/:envelopeId', async (req, res) => {
  const envelopeId = req.params.envelopeId;
  res.send(DB[envelopeId]);
});

app.post('/webhook/docusign', async (req, res) => {
  console.log('Received Webhook from DocuSign:');
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(port, '0.0.0.0', async () => {
  initDB();
  console.log(`Server started and listening on port ${port}`);
});
