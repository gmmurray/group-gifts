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
                identifier: user?.email ?? '',
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
