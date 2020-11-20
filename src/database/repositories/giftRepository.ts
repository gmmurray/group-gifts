import { firestore } from 'firebase';
import { fireDb } from '../db';
import {
    Gift,
    GiftStatus,
    GiftUpateOrCreate,
    mapGiftToUserGift,
    mapToGiftForCreation,
    UserGift,
} from '../../models/gift';

export const giftContext = (groupId: string) =>
    fireDb.collection(`groups/${groupId}/gifts`);

export const getGifts = async (groupId: string) => {
    const snapshot = await giftContext(groupId)
        .withConverter(giftConverter)
        .get();

    return snapshotToGiftArray(snapshot);
};

export const getUserGifts = async (
    groupId: string,
    userId: string,
): Promise<Array<UserGift>> => {
    const snapshot = await giftContext(groupId)
        .where('userId', '==', userId)
        .withConverter(giftConverter)
        .get();

    return snapshotToGiftArray(snapshot).map((g: Gift) => mapGiftToUserGift(g));
};

export const getUserGift = async (
    groupId: string,
    giftId: string,
): Promise<UserGift | null> => {
    const snapshot = await giftContext(groupId)
        .doc(giftId)
        .withConverter(giftConverter)
        .get();
    const result = snapshot.data();
    return result ? new UserGift(result) : null;
};

export const addGiftToGroup = async (
    groupId: string,
    user: firebase.User,
    gift: GiftUpateOrCreate,
) => {
    const newGift = mapToGiftForCreation(gift, user.uid);

    const ref = giftContext(groupId).doc();

    await ref.withConverter(giftConverter).set({ ...newGift });
    const addedGift = await giftContext(groupId).doc(ref.id).get();
    if (addedGift.exists) {
        return addedGift.data();
    }
    return null;
};

export const deleteGiftFromGroup = async (groupId: string, giftId: string) => {
    await giftContext(groupId).doc(giftId).delete();
};

export const updateGiftStatus = async (
    groupId: string,
    giftId: string,
    status: GiftStatus,
    statusText: string,
) => {
    await giftContext(groupId).doc(giftId).update({
        status,
        statusText,
    });
};

export const updateFullGift = async (
    groupId: string,
    giftId: string,
    updates: GiftUpateOrCreate,
): Promise<void> => {
    await giftContext(groupId)
        .doc(giftId)
        .update({
            ...updates,
        });
};

const snapshotToGiftArray = (snapshot: firestore.QuerySnapshot<Gift>) => {
    const retrievedGifts = new Array<Gift>();
    snapshot.forEach(p => retrievedGifts.push(p.data()));
    return retrievedGifts;
};

export const giftConverter = {
    toFirestore: (gift: Gift): firestore.DocumentData => ({
        status: gift.status,
        price: gift.price,
        webUrl: gift.webUrl,
        userId: gift.userId,
        userIdentifier: gift.userIdentifier,
        name: gift.name,
        note: gift.note,
    }),
    fromFirestore: (
        gSnapshot: firestore.QueryDocumentSnapshot,
        options: firestore.SnapshotOptions,
    ): Gift => {
        const data = gSnapshot.data(options)!;
        return new Gift({
            id: gSnapshot.id,
            name: data.name,
            userId: data.userId,
            userIdentifier: data.userIdentifier,
            price: data.price,
            webUrl: data.webUrl,
            status: data.status,
            note: data.note,
            statusText: data.statusText,
        });
    },
};
