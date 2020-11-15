import { firestore } from 'firebase';
import { Gift } from '../../models/gift';
import { Group, IGroup } from '../../models/group';
import { Participant } from '../../models/participant';
import { fireDb } from '../db';
import { deleteGiftFromGroup, getGifts, getUserGifts } from './giftRepository';
import {
    getParticipants,
    deleteParticipantFromGroup,
} from './participantRepository';

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

    const results = new Array<Group>();
    for (let group of retrievedGroups) {
        if (includeParticipants) {
            getParticipants(group.id).then(
                retrievedParticipants =>
                    (group.participants = [...retrievedParticipants]),
            );
        }

        if (includeGifts) {
            getGifts(group.id).then(
                retrievedGifts => (group.gifts = [...retrievedGifts]),
            );
        }
        results.push(group);
    }
    return results;
};

export const getJoinableGroups = async (
    userId: string,
): Promise<Array<Group>> => {
    const snapshot = await groupContext
        .where('invitedUsers', 'array-contains', userId)
        .withConverter(groupConverter)
        .get();

    const retrievedGroups = new Array<Group>();
    snapshot.forEach(g => {
        const group = new Group(g.data());
        if (group.ownerId !== userId) {
            group.code = '';
            retrievedGroups.push(group);
        }
    });

    const results = new Array<Group>();
    for (let group of retrievedGroups) {
        const participants = await getParticipants(group.id);
        if (
            participants.length === 0 ||
            participants.every(p => p.userId !== userId)
        ) {
            group.participants = [...participants];
            results.push(group);
        }
    }
    return results;
};

export const verifyGroupCode = async (
    groupId: string,
    code: string,
): Promise<boolean> => {
    const group = await groupContext
        .withConverter(groupConverter)
        .doc(groupId)
        .get();
    return group && (group?.data()?.code === code ?? false);
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
    ownerId: string;
    name: string;
    code: string;
    isPublic: boolean;
    description: string;
    invitedUsers: Array<string>;
}) => {
    const ref = groupContext.doc();
    await ref.set({ ...group });
    return ref.id;
};

export const removeUserFromGroup = async (groupId: string, userId: string) => {
    await deleteParticipantFromGroup(groupId, userId);
    const giftsToDelete = await getUserGifts(groupId, userId);
    if (giftsToDelete.length > 0) {
        const result = giftsToDelete.map(
            async ({ id }) => await deleteGiftFromGroup(groupId, id),
        );
        await Promise.all(result);
    }
};

export const deleteGroup = async (groupId: string) => {
    const tasks = new Array<Promise<void>>();

    const groupTask = groupContext.doc(groupId).delete();

    const participantsToDelete = await getParticipants(groupId);
    if (participantsToDelete.length > 0) {
        const participantTasks = participantsToDelete.map(
            async ({ userId }) =>
                await deleteParticipantFromGroup(groupId, userId),
        );
        tasks.concat(participantTasks);
    }

    const giftsToDelete = await getGifts(groupId);
    if (giftsToDelete.length > 0) {
        const giftTasks = giftsToDelete.map(
            async ({ id }) => await deleteGiftFromGroup(groupId, id),
        );
        tasks.concat(giftTasks);
    }

    await Promise.all([groupTask, ...tasks]);
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
            invitedUsers: data.invitedUsers,
            description: data.description,
            ownerId: data.ownerId,
        });
    },
};
