import docusign_esign from 'docusign-esign';
import { ensureAccessToken, ensureAccount } from './docusign_token_utils.js';
import { docusignClient } from './docusign_client.js';
import { User } from './types.js';

const docusign = docusign_esign as any;

export const makeEnvelope = (
  title: string,
  usersToSign: User[],
  usersToCC: User[] = []
): docusign_esign.EnvelopeDefinition => {
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = title;

  const doc1 = new docusign.Document();
  const doc1b64 = Buffer.from(htmlDocument(usersToSign, usersToCC)).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'Order acknowledgement';
  doc1.fileExtension = 'html';
  doc1.documentId = '1';

  envelopeDefinition.documents = [doc1];

  const CCs: any[] = [];
  for (const user of usersToCC) {
    const cc = new docusign.CarbonCopy();
    cc.email = user.email;
    cc.name = user.name;
    cc.routingOrder = (usersToSign.length + 1).toString();
    cc.recipientId = user.email;

    CCs.push(cc);
  }

  const signers: any[] = [];
  for (const [index, user] of usersToSign.entries()) {
    const signer = docusign.Signer.constructFromObject({
      email: user.email,
      name: user.name,
      recipientId: user.email,
      routingOrder: index + 1,
    });

    const signHere = docusign.SignHere.constructFromObject({
      anchorString: user.anchor,
      anchorYOffset: '10',
      anchorUnits: 'pixels',
      anchorXOffset: '20',
    });

    const signerTabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere],
    });
    signer.tabs = signerTabs;

    signers.push(signer);
  }

  const recipients = docusign.Recipients.constructFromObject({
    signers: signers,
    carbonCopies: CCs,
  });
  envelopeDefinition.recipients = recipients;

  envelopeDefinition.status = 'sent';

  return envelopeDefinition;
};

export const sendEnvelope = async (
  title: string,
  usersToSign: User[],
  usersToCC: User[] = []
): Promise<docusign_esign.EnvelopeSummary> => {
  const { accountId, basePath } = await ensureAccount();
  const dsApiClient = docusignClient;
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + (await ensureAccessToken()));
  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  const envelope = makeEnvelope(title, usersToSign, usersToCC);

  const results = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition: envelope,
  });
  return results;
};

function htmlDocument(usersToSign: User[], usersToCC: User[]): string {
  const docStart = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family:sans-serif;margin-left:2em;">
        <h1 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
            color: darkblue;margin-bottom: 0;">World Wide Corp</h1>
        <h2 style="font-family: 'Trebuchet MS', Helvetica, sans-serif;
          margin-top: 0px;margin-bottom: 3.5em;font-size: 1em;
          color: darkblue;">Order Processing Division</h2>
        <h4>Ordered by ${usersToSign.map((user) => user.name).join(', ')}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${usersToSign.map((user) => user.email).join(', ')}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${usersToCC.map((user) => user.email).join(', ')}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly.
  Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o.
  Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->`;
  const docMid = usersToSign
    .map(
      (user) => `
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">${user.anchor}/</span></h3>
  `
    )
    .join('\n');
  const docEnd = `
        </body>
    </html>
  `;
  return docStart + docMid + docEnd;
}
