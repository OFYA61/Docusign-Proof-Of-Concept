export class User {
  email: string;
  name: string;

  constructor(email: string, name: string) {
    this.email = email;
    this.name = name;
  }

  get anchor(): string {
    return `**${this.email}**`;
  }
}

export type SignatureStatus = 'PENDING' | 'COMPLETE';

export class Signature {
  user: User;
  status: SignatureStatus;

  constructor(user: User) {
    this.user = user;
    this.status = 'PENDING';
  }
}

export type EnvelopeStatus = 'SENT' | 'COMPLETE';

export class Envelope {
  envelopeId: string;
  signatures: Signature[];
  status: EnvelopeStatus;

  constructor(envelopeId: string, signatures: Signature[]) {
    this.envelopeId = envelopeId;
    this.signatures = signatures;
    this.status = 'SENT';
  }
}

export interface DBSchema {
  envelopes: { [envelopeId: string]: Envelope };
  users: { [uuid: string]: string };
}
