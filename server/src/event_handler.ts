import { getUUIDEmail, changeSignatureStatus, markEnvelopeComplete } from "./db";
import { DocusignEvent, DocusignEventType } from "./types";

export const buildDocusignEventFromRequest = (request: any): DocusignEvent => {
  return {
    eventType: request.event as DocusignEventType,
    eventData: {
      userId: request.data.recipientId ?? undefined,
      envelopeId: request.data.envelopeId
    }
  }
}

export const handleDocusignEvent = (docusignEvent: DocusignEvent) => {
  const { userId, envelopeId } = docusignEvent.eventData;
  switch (docusignEvent.eventType) {
    case 'recipient-sent':
      if (userId === undefined) {
        console.error(`User ID is expected for docusign event 'recipient-sent' ${docusignEvent}`);
        break;
      }
      changeSignatureStatus(envelopeId, getUUIDEmail(userId), 'SENT');
      break;
    case 'envelope-sent':
      break;
    case 'recipient-delivered':
      if (userId === undefined) {
        console.error(`User ID is expected for docusign event 'recipient-delivered' ${docusignEvent}`);
        break;
      }
      changeSignatureStatus(envelopeId, getUUIDEmail(userId), 'DELIVERED');
      break;
    case 'recipient-completed':
      if (userId === undefined) {
        console.error(`User ID is expected for docusign event 'recipient-completed' ${docusignEvent}`);
        break;
      }
      changeSignatureStatus(envelopeId, getUUIDEmail(userId), 'COMPLETE');
      break;
    case 'envelope-completed':
      markEnvelopeComplete(envelopeId);
      break;
  }
};
