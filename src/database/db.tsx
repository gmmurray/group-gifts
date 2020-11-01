import { db } from '../context/firebase';

export const fireDb = db;

export const groupRepository = db.collection('groups');
