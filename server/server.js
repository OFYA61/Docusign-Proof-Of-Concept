import express from 'express';
import bodyParser from 'body-parser';
import { makeEnvelope, sendEnvelope } from './send_envolope.js';
import { Envelope, Signature, User } from './types.js';
import { addEnvelope, DB, initDB } from './db.js';

const port = 3000;
const app = express().use(bodyParser.json());

app.get('/', async (_req, res) => {
  res.send('Poggers');
});

app.get('/callback', async (_req, _res) => { });

app.post('/send-envelope', async (req, res) => {
  let { signers, cc_users } = req.body;
  signers = signers ?? [];
  if (signers.length == 0) {
    res.send("What the heck are you doing? There are not destination emails provided here").status(400);
    return;
  }
  cc_users = cc_users ?? [];

  signers = signers.map(user => new User(user.email, user.name));

  let envelopeResponse;
  try {
    envelopeResponse = await sendEnvelope('Sign the bloody PDF m8', signers, cc_users);
  } catch (err) {
    console.error('DocuSign error response:', err.response && (err.response.body || err.response.data || err.body));
    res.send(await makeEnvelope('some title', signers, cc_users)).status(400);
    return err;
  }
  let signatures = signers.map(user => new Signature(user));
  let envelope = new Envelope(envelopeResponse.envelopeId, signatures);
  res.send(envelope);
  addEnvelope(envelope);
});

app.get('/sent-envelopes', async (_req, res) => {
  res.send(DB);
});

app.get('/sent-envelopes/:envelopeId', async (req, res) => {
  let envelopeId = req.params.envelopeId;
  res.send(DB[envelopeId]);
});

app.post('/webhook/docusign', async (req, res) => {
  console.log('Received Webhook from DocuSign:');
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);

  // Process the event here
});

app.listen(port, '0.0.0.0', async () => {
  initDB();
  console.log(`Server started and listening on port ${port}`);
});
