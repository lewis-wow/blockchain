import { KBucket } from './KBucket.js';
import { ID_BITS, K_BUCKET_SIZE } from '../consts.js';
import { Utils } from './Utils.js';
import { Contact } from '../Contact.js';
import { TypedEventEmitter } from '../event_emitter/TypedEventEmitter.js';

export type RoutingTableEventMap = {
  contactAdded: (contact: Contact) => void;
};

/**
 * Manages all the k-buckets for a node.
 */
export class RoutingTable extends TypedEventEmitter<RoutingTableEventMap> {
  public readonly nodeId: string;
  private readonly buckets: KBucket[] = [];

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;

    for (let i = 0; i < ID_BITS; i++) {
      this.buckets.push(new KBucket(K_BUCKET_SIZE));
    }
  }

  /**
   * Adds a new contact to the appropriate k-bucket.
   * @param contact The contact to add.
   */
  addContact(contact: Contact): void {
    if (contact.nodeId === this.nodeId) {
      return; // Do not add self
    }

    const index = Utils.getBucketIndex(this.nodeId, contact.nodeId);

    if (index < 0 || index > ID_BITS) {
      return;
    }

    // do not add contact if already exists
    if (this.buckets[index].hasContact(contact.nodeId)) {
      return;
    }

    this.buckets[index].add(contact);
    this.emit('contactAdded', contact);
  }

  /**
   * Finds the 'k' closest contacts to a given target ID.
   * @param targetId The ID to find contacts close to.
   * @param count The number of contacts to return (defaults to K_BUCKET_SIZE).
   * @returns A sorted list of the closest contacts.
   */
  findClosest(targetId: string, count: number = K_BUCKET_SIZE): Contact[] {
    const allContacts: Contact[] = [];
    this.buckets.forEach((bucket) => {
      allContacts.push(...bucket.getContacts());
    });

    // Sort all contacts by their distance to the target ID
    allContacts.sort((a, b) => {
      const distA = Utils.distance(a.nodeId, targetId);
      const distB = Utils.distance(b.nodeId, targetId);
      return Utils.compareDistance(distA, distB);
    });

    return allContacts.slice(0, count);
  }

  /**
   * Returns all contacts in the routing table.
   */
  getAllContacts(): Contact[] {
    const allContacts: Contact[] = [];
    this.buckets.forEach((bucket) => {
      allContacts.push(...bucket.getContacts());
    });
    return allContacts;
  }
}
