import docusign_esign from 'docusign-esign';

export const docusignClient = new docusign_esign.ApiClient();
docusignClient.setOAuthBasePath('account-d.docusign.com');
