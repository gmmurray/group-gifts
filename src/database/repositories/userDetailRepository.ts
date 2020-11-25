import { firestore } from 'firebase';
import { IUserDetail, UserDetail } from '../../models/userDetail';
import { pageDirectionType } from '../../shared/defaultTypes';
import { fireDb } from '../db';

export const userDetailContext = fireDb.collection('users');

export const getUserDetailItems = async (
    allowedOnly: boolean = false,
): Promise<Array<UserDetail>> => {
    const retrievedUserDetails = new Array<UserDetail>();
    let snapshot: firestore.QuerySnapshot<UserDetail>;
    if (allowedOnly) {
        snapshot = await userDetailContext
            .where('allow', '==', true)
            .withConverter(userDetailConverter)
            .get();
    } else {
        snapshot = await userDetailContext
            .withConverter(userDetailConverter)
            .get();
    }
    snapshot.forEach(ud => {
        const userDetail = new UserDetail(ud.data());
        retrievedUserDetails.push(userDetail);
    });

    return retrievedUserDetails;
};

export const getPaginatedUserDetails = async (
    dir: pageDirectionType,
    orderBy: string,
    page: number,
    reference: string | null,
    callback: Function,
): Promise<Array<UserDetail> | void> => {
    const retrievedUsers = new Array<UserDetail>();

    // get first page
    // if (reference === null) {
    //     const snapshot = await userDetailContext
    //         .withConverter(userDetailConverter)
    //         .orderBy(orderBy)
    //         .limit(page)
    //         .get();
    //     snapshot.forEach(u => retrievedUsers.push(new UserDetail(u.data())));
    // } else {
    //     if (dir === 'next') {
    userDetailContext
        .withConverter(userDetailConverter)
        .orderBy(orderBy)
        .limit(page)
        .get()
        .then((snapshot: firestore.QuerySnapshot<UserDetail>) => {
            if (dir === null && reference === null) {
                snapshot.forEach(u =>
                    retrievedUsers.push(new UserDetail(u.data())),
                );
                callback(retrievedUsers);
            } else {
                // let query = userDetailContext
                //     .withConverter(userDetailConverter)
                //     .orderBy(orderBy);
                if (dir === 'next') {
                    userDetailContext
                        .withConverter(userDetailConverter)
                        .orderBy(orderBy)
                        .startAfter(reference)
                        .limit(page)
                        .get()
                        .then(nextPage => {
                            nextPage.forEach(u =>
                                retrievedUsers.push(new UserDetail(u.data())),
                            );
                            callback(retrievedUsers);
                        });
                } else if (dir === 'prev') {
                    userDetailContext
                        .withConverter(userDetailConverter)
                        .orderBy(orderBy)
                        .endBefore(reference)
                        .limit(page)
                        .get()
                        .then(nextPage => {
                            nextPage.forEach(u =>
                                retrievedUsers.push(new UserDetail(u.data())),
                            );
                            callback(retrievedUsers);
                        });
                }
                // query
                //     .limit(page)
                //     .get()
                //     .then(nextPage => {
                //         nextPage.forEach(u =>
                //             retrievedUsers.push(new UserDetail(u.data())),
                //         );
                //     });
            }
        });
    // let last = userDetailContext.doc(reference);
    // userDetailContext
    //     .orderBy(orderBy)
    //     .startAfter(last)
    //     .limit(page)
    //     .withConverter(userDetailConverter)
    //     .get()
    //     .then(snapshot => {
    //         snapshot.forEach(u =>
    //             retrievedUsers.push(new UserDetail(u.data())),
    //         );
    //     });
    // callback(retrievedUsers);
    //     } else {
    //         userDetailContext
    //             .doc(reference)
    //             .get()
    //             .then(async doc => {
    //                 const snapshot = await userDetailContext
    //                     .orderBy(orderBy)
    //                     .endBefore(doc)
    //                     .limit(page)
    //                     .withConverter(userDetailConverter)
    //                     .get();

    //                 snapshot.forEach(u =>
    //                     retrievedUsers.push(new UserDetail(u.data())),
    //                 );
    //             });
    //     }
    // }

    //return retrievedUsers;
};

export const getUserDetailItemsFromList = async (
    ids: Array<string>,
): Promise<Array<UserDetail>> => {
    const retrievedUserDetails = new Array<UserDetail>();
    const snapshot = await userDetailContext
        .where(firestore.FieldPath.documentId(), 'in', ids)
        .withConverter(userDetailConverter)
        .get();
    snapshot.forEach(ud => {
        const userDetail = new UserDetail(ud.data());
        retrievedUserDetails.push(userDetail);
    });

    return retrievedUserDetails;
};

export const updateUserDetail = async (
    userId: string,
    updates: Partial<UserDetail>,
): Promise<void> => {
    let shapedUpdate: Partial<UserDetail> = {};

    if (updates.displayName) shapedUpdate.displayName = updates.displayName;
    if (updates.photoURL) shapedUpdate.photoURL = updates.photoURL;

    await userDetailContext.doc(userId).update({
        ...shapedUpdate,
    });
};

export const userDetailConverter = {
    toFirestore: (userDetail: IUserDetail): firestore.DocumentData => {
        return {
            email: userDetail.email,
            allow: userDetail.allow,
        };
    },
    fromFirestore: (
        udSnapshot: firestore.QueryDocumentSnapshot,
        options: firestore.SnapshotOptions,
    ): UserDetail => {
        const data = udSnapshot.data(options)!;

        return new UserDetail({
            id: udSnapshot.id,
            email: data.email,
            allow: data.allow,
            admin: data.admin,
            displayName: data.displayName,
            photoURL: data.photoURL,
        });
    },
};
