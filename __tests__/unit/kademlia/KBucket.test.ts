import { describe, test, expect, beforeEach } from 'vitest';
import { KBucket } from '../../../src/kademlia/KBucket.js';
import { Contact } from '../../../src/Contact.js';
import { K_BUCKET_SIZE } from '../../../src/consts.js';

describe('KBucket', () => {
  let kBucket: KBucket, contact: Contact, nodeId: string;

  beforeEach(() => {
    nodeId = 'nodeId0';
    kBucket = new KBucket(K_BUCKET_SIZE);
    contact = new Contact({
      nodeId,
      address: 'address',
      port: 0,
    });
    kBucket.add(contact);
  });

  test('getContact()', () => {
    expect(kBucket.getContact(nodeId)).toEqual(contact);
  });

  test('hasContacts()', () => {
    expect(kBucket.hasContact(nodeId)).toBe(true);
  });

  test('getContacts()', () => {
    expect(kBucket.getContacts()).toEqual([contact]);
  });

  describe('full bucket', () => {
    let newContacts: Contact[];

    beforeEach(() => {
      newContacts = [];
      for (let i = 1; i < K_BUCKET_SIZE; i++) {
        const newContact = new Contact({
          nodeId: `nodeId${i}`,
          address: 'address',
          port: 0,
        });
        kBucket.add(newContact);
        newContacts.push(newContact);
      }
    });

    test('getContacts()', () => {
      expect(kBucket.getContacts()).toEqual([contact, ...newContacts]);
    });

    test('add()', () => {
      const newContact = new Contact({
        nodeId: `nodeId${K_BUCKET_SIZE}`,
        address: 'address',
        port: 0,
      });
      kBucket.add(newContact);

      expect(kBucket.getContacts()).toEqual([contact, ...newContacts]);
    });
  });
});
