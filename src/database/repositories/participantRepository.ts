import { firestore } from 'firebase';
import { fireDb } from '../db';
import { IParticipant, Participant } from '../../models/participant';

export const participantContext = (groupId: string) =>
    fireDb.collection(`groups/${groupId}/participants`);

export const addParticipantToGroup = async (
    groupId: string,
    user: firebase.User,
) => {
    await participantContext(groupId)
        .doc(user.uid)
        .withConverter(participantConverter)
        .set(
            new Participant({
                userId: user.uid,
                identifier: user.displayName ?? user.email ?? '',
            }),
        );
};

export const getParticipants = async (groupId: string) => {
    const snapshot = await participantContext(groupId)
        .withConverter(participantConverter)
        .get();
    const retrievedParticipants = new Array<Participant>();
    snapshot.forEach(p => retrievedParticipants.push(p.data()));

    return retrievedParticipants;
};

export const checkGroupMembership = async (
    groupId: string,
    userId: string,
): Promise<boolean> => {
    const snapshot = await participantContext(groupId)
        .where('userId', '==', userId)
        .withConverter(participantConverter)
        .get();
    const retrievedParticipants = new Array<Participant>();
    snapshot.forEach(p => retrievedParticipants.push(p.data()));

    return retrievedParticipants.length > 0;
};

export const deleteParticipantFromGroup = async (
    groupId: string,
    userId: string,
) => {
    await participantContext(groupId).doc(userId).delete();
};

export const participantConverter = {
    toFirestore: (participant: IParticipant): firestore.DocumentData => {
        return {
            identifier: participant.identifier,
        };
    },
    fromFirestore: (
        pSnapshot: firestore.QueryDocumentSnapshot,
        options: firestore.SnapshotOptions,
    ): Participant => {
        const data = pSnapshot.data(options)!;
        return new Participant({
            userId: pSnapshot.id,
            identifier: data.identifier,
        });
    },
};
