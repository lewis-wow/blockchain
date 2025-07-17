// src/RoutingTable.ts

import { K_BUCKET_SIZE } from '../consts.js';
import { Utils } from '../Utils.js';
import { Contact } from '../server/Server.js';

const SERVICE_NAME = 'k-bucket';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

/**
 * Represents a single k-bucket, which stores up to K contacts.
 */
export class KBucket {
  private contacts: Contact[] = [];
  private readonly bucketSize: number = K_BUCKET_SIZE;

  add(contact: Contact): void {
    const existingIndex = this.contacts.findIndex((c) =>
      c.nodeId.equals(contact.nodeId),
    );

    if (existingIndex !== -1) {
      // If contact already exists, move it to the end (most recently seen)
      const existing = this.contacts.splice(existingIndex, 1)[0];
      this.contacts.push(existing);
      return;
    }

    if (this.contacts.length < this.bucketSize) {
      // If there's space, add the new contact
      this.contacts.push(contact);
      return;
    }

    // Bucket is full. In a full implementation, we would ping the
    // least-recently seen contact (at the head) to see if it's still alive.
    // For simplicity, we'll just ignore the new contact for now.
    log.debug('Bucket is full, ignoring new contact.');
  }

  getContacts(): Contact[] {
    return [...this.contacts];
  }

  getContact(nodeId: Buffer): Contact | undefined {
    return this.contacts.find((c) => c.nodeId.equals(nodeId));
  }

  hasContact(nodeId: Buffer): boolean {
    return !!this.getContact(nodeId);
  }
}
