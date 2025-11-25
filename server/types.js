export class User {
  constructor(email, name) {
    this.email = email;
    this.name = name;
  }

  // Getter for the derived field 'anchor'
  get anchor() {
    return `**${this.email}**`;
  }
}

export class Signature {
  /**
   * @param user {User} the user who will own the signature
   */
  constructor(user) {
    this.user = user;
    this.status = 'PENDING';
  }
}

export class Envelope {
  constructor(envelopeId, signatures) {
    this.envelopeId = envelopeId
    this.signatures = signatures;
    this.status = 'SENT';
  }
}
