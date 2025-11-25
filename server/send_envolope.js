import docusign_esign from 'docusign-esign';
import { ensureAccessToken, ensureAccount } from './docusign_token_utils.js';
import { docusignClient } from './docusign_client.js';
import { User } from './types.js';
const docusign = docusign_esign;

/**
 * @param title {string} Title of the email
 * @param usersToSign {User[]} Users who will sign the document
 * @param usersToCC {User[]} Users who will get CC'ed
 * @returns Envolope definition
 */
export const makeEnvelope = (title, usersToSign, usersToCC = []) => {
  // create the envelope definition
  let envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.emailSubject = title;

  // add the documents
  let doc1 = new docusign.Document();
  let doc1b64 = Buffer.from(htmlDocument(usersToSign, usersToCC)).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'Order acknowledgement'; // can be different from actual file name
  doc1.fileExtension = 'html'; // Source data format. Signed docs are always pdf.
  doc1.documentId = '1'; // a label used to reference the doc

  // The order in the docs array determines the order in the envelope
  envelopeDefinition.documents = [doc1];

  // create a cc recipient to receive a copy of the documents, identified by name and email
  // We're setting the parameters via setters
  let CCs = [];
  for (const [index, user] of usersToCC.entries()) {
    let cc = new docusign.CarbonCopy();
    cc.email = user.email;
    cc.name = user.name;
    cc.routingOrder = (usersToSign.length + 1).toString();
    cc.recipientId = user.email;

    CCs.push(cc);
  }

  let signers = [];
  for (const [index, user] of usersToSign.entries()) {
    // routingOrder (lower means earlier) determines the order of deliveries
    // to the recipients. Parallel routing order is supported by using the
    // same integer as the order for two or more recipients.
    let signer = docusign.Signer.constructFromObject({
      email: user.email,
      name: user.name,
      recipientId: user.email,
      routingOrder: index + 1,
    });

    let signHere = docusign.SignHere.constructFromObject({
      anchorString: user.anchor,
      anchorYOffset: '10',
      anchorUnits: 'pixels',
      anchorXOffset: '20'
    });

    let signerTabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere]
    });
    signer.tabs = signerTabs;

    signers.push(signer);
  }

  // Add the recipients to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: signers,
    carbonCopies: CCs,
  });
  envelopeDefinition.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  envelopeDefinition.status = 'sent';

  return envelopeDefinition;
}

/**
 * @param title {string} Title of the email
 * @param usersToSign {User[]} Users who will sign the document
 * @returns Envolope definition
 */
export const sendEnvelope = async (title, usersToSign, usersToCC = []) => {
  // Data for this method
  const { accountId, basePath } = await ensureAccount();
  let dsApiClient = docusignClient;
  dsApiClient.setBasePath(basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + await ensureAccessToken());
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
  let results = null;

  // Make the envelope request body
  let envelope = makeEnvelope(title, usersToSign, usersToCC);

  // Call the Envelopes::create API method
  // Exceptions will be caught by the calling function
  results = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition: envelope,
  });
  return results;
};

/**
 * Creates HTML document to sign
 * @function
 * @private
 * @param usersToSign {User[]} Users who will sign the document
 * @param usersToCC {User[]} Users who will sign the document
 * @returns {string} A document in HTML format
 */
function htmlDocument(usersToSign, usersToCC) {
  let docStart = `
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
        <h4>Ordered by ${usersToSign.map(user => user.name).join(', ')}</h4>
        <p style="margin-top:0em; margin-bottom:0em;">Email: ${usersToSign.map(user => user.email).join(', ')}</p>
        <p style="margin-top:0em; margin-bottom:0em;">Copy to: ${usersToCC.map(user => user.email).join(', ')}</p>
        <p style="margin-top:3em;">
  Candy bonbon pastry jujubes lollipop wafer biscuit biscuit. Topping brownie sesame snaps sweet roll pie. Croissant danish biscuit soufflé caramels jujubes jelly.
  Dragée danish caramels lemon drops dragée. Gummi bears cupcake biscuit tiramisu sugar plum pastry. Dragée gummies applicake pudding liquorice. Donut jujubes oat cake jelly-o.
  Dessert bear claw chocolate cake gummies lollipop sugar plum ice cream gummies cheesecake.
        </p>
        <!-- Note the anchor tag for the signature field is in white. -->`;
  let docMid = usersToSign.map(user => `
        <h3 style="margin-top:3em;">Agreed: <span style="color:white;">${user.anchor}/</span></h3>
  `).join('\n');
  let docEnd = `
        </body>
    </html>
  `;
  return docStart + docMid + docEnd;
}
