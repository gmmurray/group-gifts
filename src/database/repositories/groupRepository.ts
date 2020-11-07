import { firestore } from 'firebase';
import { Gift } from '../../models/gift';
import { Group, IGroup } from '../../models/group';
import { Participant } from '../../models/participant';
import { fireDb } from '../db';
import { getGifts } from './giftRepository';
import { getParticipants } from './participantRepository';

export const groupContext = fireDb.collection('groups');

export const subsribeGroups = (callback: Function) =>
    groupContext.withConverter(groupConverter).onSnapshot(snapshot => {
        const retrievedGroups = new Array<Group>();
        snapshot.forEach(g => {
            const result = new Group(g.data());

            getParticipants(g.id).then(
                retrievedParticipants =>
                    (result.participants = [...retrievedParticipants]),
            );

            getGifts(g.id).then(
                retrievedGifts => (result.gifts = [...retrievedGifts]),
            );

            retrievedGroups.push(result);
        });
        callback(retrievedGroups);
    });

export const getGroups = async (
    includeParticipants: boolean = false,
    includeGifts: boolean = false,
) => {
    const retrievedGroups = new Array<Group>();
    const snapshot = await groupContext.withConverter(groupConverter).get();
    snapshot.forEach(g => {
        const result = new Group(g.data());

        if (includeParticipants) {
            getParticipants(g.id).then(
                retrievedParticipants =>
                    (result.participants = [...retrievedParticipants]),
            );
        }

        if (includeGifts) {
            getGifts(g.id).then(
                retrievedGifts => (result.gifts = [...retrievedGifts]),
            );
        }

        retrievedGroups.push(result);
    });
    return retrievedGroups;
};

export const getShallowGroup = async (groupId: string) => {
    const snapshot = await groupContext
        .doc(groupId)
        .withConverter(groupConverter)
        .get();
    if (snapshot.exists) {
        const result = snapshot.data();
        return result;
    } else {
        return null;
    }
};

export const getFullGroup = async (groupId: string) => {
    const retrievedGroup = await getShallowGroup(groupId);
    if (retrievedGroup === null || retrievedGroup === undefined) return null;

    const retrievedParticipants = await getParticipants(groupId);
    const retrievedGifts = await getGifts(groupId);

    return new Group({
        ...retrievedGroup,
        participants: [...retrievedParticipants],
        gifts: [...retrievedGifts],
    });
};

export const createEmptyGroup = async (group: {
    name: string;
    code: string;
    isPublic: boolean;
}) => {
    const ref = groupContext.doc();
    await ref.set({ ...group });
    return ref.id;
};

export const groupConverter = {
    toFirestore: (group: IGroup): firestore.DocumentData => {
        return {
            name: group.name,
            code: group.code,
            isPublic: group.isPublic,
        };
    },
    fromFirestore: (
        gSnapshot: firestore.QueryDocumentSnapshot,
        options: firestore.SnapshotOptions,
    ): Group => {
        const data = gSnapshot.data(options)!;

        return new Group({
            id: gSnapshot.id,
            name: data.name,
            code: data.code,
            isPublic: data.isPublic,
            participants: new Array<Participant>(),
            gifts: new Array<Gift>(),
        });
    },
};
