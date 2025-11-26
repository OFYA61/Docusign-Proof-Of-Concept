import express from 'express';
import crypto from 'crypto';
import docusign from 'docusign-esign';
import cors from 'cors';
import { makeEnvelope, sendEnvelope } from './send_envelope';
import { Envelope, Signature, User } from './types';
import { addEnvelope, DB, initDB } from './db';
import { buildDocusignEventFromRequest, handleDocusignEvent } from './event_handler';
import { DOCUSIGN_CONNECT_HMAC_KEY } from './constants';
import { docusignClient } from './docusign_client';
import { ensureAccessToken, ensureAccount } from './docusign_token_utils';

const port = 3000;
const app = express();
app.use(cors());


app.get('/', async (_req, res) => {
  res.send('Poggers');
});

app.get('/callback', async (_req, _res) => { });

interface SendEnvelopeRequest {
  products?: Array<string>;
  signers?: Array<{ email: string; name: string }>;
  cc_users?: Array<{ email: string; name: string }>;
}

app.post('/send-envelope', express.json(), async (req, res) => {
  const body = req.body as SendEnvelopeRequest;
  let signers = body.signers ?? [];

  if (signers.length === 0) {
    res
      .status(400)
      .send('What the heck are you doing? There are no destination emails provided here');
    return;
  }

  let products = body.products ?? [];
  if (products.length === 0) {
    res
      .status(400)
      .send('What the heck are you doing? There are no products provided here');
    return;
  }

  const cc_users = body.cc_users ?? [];
  const signerUsers = signers.map((user) => new User(user.email, user.name));
  const ccUsers = cc_users.map((user) => new User(user.email, user.name));

  let envelopeResponse;
  try {
    envelopeResponse = await sendEnvelope('Sign the bloody PDF m8', signerUsers, products, ccUsers);
  } catch (err) {
    console.error(
      'DocuSign error response:',
      (err as any).response && ((err as any).response.body || (err as any).response.data || (err as any).body)
    );
    res.send(makeEnvelope('lkdjf', signerUsers, products, ccUsers)).status(400);//.send(await makeEnvelope('some title', signerUsers, products, ccUsers));
    return;
  }

  const signatures = signerUsers.map((user) => new Signature(user));
  const envelope = new Envelope(envelopeResponse.envelopeId as string, signatures);
  res.send(envelope);
  addEnvelope(envelope);
});

app.get('/sent-envelopes', async (_req, res) => {
  res.send(DB.envelopes);
});

app.get('/sent-envelopes/:envelopeId', async (req, res) => {
  const envelopeId = req.params.envelopeId;
  res.send(DB.envelopes[envelopeId]);
});

app.get('/sent-envelopes/:envelopeId/download-document', async (req, res) => {
  const envelopeId = req.params.envelopeId;
  const { accountId, basePath } = await ensureAccount();
  const dsApiClient = docusignClient;
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + (await ensureAccessToken()));
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  const results = await envelopesApi.getDocument(
    accountId,
    envelopeId,
    '1',
    {}
  );
  res.send(results);
});

app.post('/webhook/docusign',
  (
    req,
    res,
    next,
  ) => {
    const data: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      data.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(data);

      const hmac = crypto.createHmac('sha256', DOCUSIGN_CONNECT_HMAC_KEY);
      hmac.update(rawBody);
      const bodyHash = hmac.digest('base64');

      const docuSignSignature = req.header('x-docusign-signature-1');
      if (!docuSignSignature) {
        console.log('Missing signature');
        res.status(400).send('Missing DocuSign signature header');
        return;
      }

      const isValid = crypto.timingSafeEqual(
        Buffer.from(bodyHash),
        Buffer.from(docuSignSignature)
      );

      if (!isValid) {
        console.log('Invalid signature');
        res.status(403).send('Invalid signature');
        return;
      }

      try {
        req.body = JSON.parse(rawBody.toString('utf8'));
      } catch (e) {
        res.status(400).send('Invalid JSON');
        return;
      }
      next();
    });

    req.on('error', (err: Error) => {
      console.log(err);
      res.status(400).send('Error reading body');
    });
  }
  , async (req, res) => {
    console.log('Got docusign webhook event');

    res.sendStatus(200);
    const docusignEvent = buildDocusignEventFromRequest(req.body);
    handleDocusignEvent(docusignEvent);
  });

app.listen(port, '0.0.0.0', async () => {
  initDB();
  console.log(`Server started and listening on port ${port}`);
});
