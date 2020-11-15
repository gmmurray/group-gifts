import { firestore } from 'firebase';
import { IUserDetail, UserDetail } from '../../models/userDetail';
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
        });
    },
};
