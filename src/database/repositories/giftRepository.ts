import { firestore } from 'firebase';
import { fireDb } from '../db';
import { IGift, Gift } from '../../models/gift';

export const giftContext = (groupId: string) =>
    fireDb.collection(`groups/${groupId}/gifts`);

export const getGifts = async (groupId: string) => {
    const snapshot = await giftContext(groupId)
        .withConverter(giftConverter)
        .get();
    const retrievedGifts = new Array<Gift>();
    snapshot.forEach(p => retrievedGifts.push(p.data()));

    return retrievedGifts;
};

export const giftConverter = {
    toFirestore: (gift: IGift): firestore.DocumentData => ({
        name: gift.name,
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
        });
    },
};
