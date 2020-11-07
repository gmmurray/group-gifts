import firebase from 'firebase';
import { db } from '../context/firebase';

export const fireDb = db;

export const addObjElement = (element: object) =>
    firebase.firestore.FieldValue.arrayUnion(element);
export const removeObjElement = (element: object) =>
    firebase.firestore.FieldValue.arrayRemove(element);

export const addStrElement = (element: string) =>
    firebase.firestore.FieldValue.arrayUnion(element);
export const removeStrElement = (element: string) =>
    firebase.firestore.FieldValue.arrayRemove(element);
