import { K_BUCKET_SIZE } from '../consts.js';
import { Utils } from '../Utils.js';
import { Contact } from '../Contact.js';

const SERVICE_NAME = 'k-bucket';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

/**
 * Represents a single Kademlia k-bucket.
 * A k-bucket is a list that stores up to K (K_BUCKET_SIZE) contacts
 * that are "close" to each other in the XOR metric space, relative to the local node's ID.
 * Contacts within a k-bucket are typically ordered by their last-seen timestamp,
 * with the most recently seen contacts at the end of the list.
 */
export class KBucket {
  /**
   * An array storing the Contact objects within this k-bucket.
   * Contacts are typically ordered by recency of interaction.
   * @private
   */
  private contacts: Contact[] = [];

  /**
   * The maximum number of contacts this k-bucket can hold.
   * This value is determined by `K_BUCKET_SIZE` from the constants.
   * @private
   * @readonly
   */
  private readonly bucketSize: number = K_BUCKET_SIZE;

  /**
   * Adds a new contact to the k-bucket, or updates its position if it already exists.
   * If the contact already exists, it's moved to the end of the list (most recently seen).
   * If the bucket has space, the new contact is simply added to the end.
   * If the bucket is full, the new contact is currently ignored, but in a full Kademlia
   * implementation, the least-recently seen contact (at the head) would be
   * pinged to check its liveness before potentially evicting it.
   * @param contact The `Contact` object to add or update.
   */
  add(contact: Contact): void {
    // Check if the contact already exists in the bucket
    const existingIndex = this.contacts.findIndex(
      (c) => c.nodeId === contact.nodeId,
    );

    if (existingIndex !== -1) {
      // If the contact exists, remove it from its current position
      const existing = this.contacts.splice(existingIndex, 1)[0];
      // And add it back to the end, marking it as most recently seen
      this.contacts.push(existing);
      return; // Operation complete
    }

    // If the contact does not exist and there is space in the bucket
    if (this.contacts.length < this.bucketSize) {
      // Add the new contact to the end of the bucket
      this.contacts.push(contact);
      return; // Operation complete
    }

    // If the bucket is full and the contact is new
    // In a real Kademlia implementation, a "ping" mechanism would be used here.
    // The least-recently seen contact (this.contacts[0]) would be pinged.
    // If it responds, the new contact is ignored. If it doesn't respond, it's removed,
    // and the new contact is added.
    log.debug('Bucket is full, ignoring new contact.');
  }

  /**
   * Returns a shallow copy of the contacts currently in the k-bucket.
   * This prevents external modification of the internal `contacts` array.
   * @returns {Contact[]} An array of `Contact` objects in the k-bucket.
   */
  getContacts(): Contact[] {
    return [...this.contacts]; // Return a new array containing all current contacts
  }

  /**
   * Retrieves a specific contact from the k-bucket by its Node ID.
   * @param nodeId The Node ID of the contact to retrieve.
   * @returns {Contact | undefined} The `Contact` object if found, otherwise `undefined`.
   */
  getContact(nodeId: string): Contact | undefined {
    return this.contacts.find((c) => c.nodeId === nodeId);
  }

  /**
   * Checks if a contact with the given Node ID exists in the k-bucket.
   * @param nodeId The Node ID to check for.
   * @returns {boolean} `true` if the contact exists, `false` otherwise.
   */
  hasContact(nodeId: string): boolean {
    return !!this.getContact(nodeId);
  }
}
