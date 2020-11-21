import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

export const defaultPhotoURL =
    'https://st.depositphotos.com/1779253/5140/v/600/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg';

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

type TrackingProviderProps = {
    children: React.ReactNode;
};

type createUserOnFirebaseType = (
    email: string,
    password: string,
) => Promise<void>;
type doUserLoginOnFirebaseType = (
    email: string,
    password: string,
) => Promise<void>;
type loginThroughGoogleType = () => Promise<void>;
type createThroughGoogleType = () => Promise<void>;
type logoutUserFromFirebaseType = () => Promise<void>;
export type userPermissionType = { allow: boolean; admin: boolean };
export type getUserPermissionType = (
    userId: string,
) => Promise<userPermissionType>;

type FirebaseState = {
    user: firebase.User | null;
    isFetchingUser: boolean;
    userPermission: userPermissionType;
    getUserPermission: getUserPermissionType;
    createUserOnFirebase: createUserOnFirebaseType;
    doUserLoginOnFirebase: doUserLoginOnFirebaseType;
    loginThroughGoogle: loginThroughGoogleType;
    createThroughGoogle: createThroughGoogleType;
    logoutUserFromFirebase: logoutUserFromFirebaseType;
};

const FirebaseContext = createContext<FirebaseState | undefined>(undefined);

function FirebaseProvider({ children }: TrackingProviderProps) {
    const firestore = firebase.firestore();
    const auth = firebase.auth();

    // AUTHENTICATION
    const [user, setUser] = useState<firebase.User | null>(null);
    const [isFetchingUser, setIsFetchingUser] = useState(true);
    const [userPermission, setUserPermission] = useState({
        allow: false,
        admin: false,
    });
    const [isFetchingAccess, setIsFetchingAccess] = useState(true);

    auth.onAuthStateChanged(async user => {
        if (user) {
            setUser(user);
            const userPermissions = await getUserPermission(user.uid);
            setUserPermission(userPermissions);
            setIsFetchingAccess(false);
        } else {
            setUser(null);
            setIsFetchingAccess(false);
        }
    });

    useEffect(() => {
        if (!isFetchingAccess) setIsFetchingUser(false);
    }, [isFetchingAccess]);

    const createUserOnFirebase: createUserOnFirebaseType = (email, password) =>
        new Promise(async (resolve, reject) => {
            try {
                const firebaseUser = await auth.createUserWithEmailAndPassword(
                    email,
                    password,
                );

                if (!firebaseUser.user) {
                    reject();
                    return;
                }

                await usersCollection.doc(firebaseUser.user.uid).set({
                    email: firebaseUser.user.email,
                    displayName: firebaseUser.user.email,
                    photoURL: defaultPhotoURL,
                });

                resolve();
            } catch (e) {
                reject(e);
            }
        });

    const doUserLoginOnFirebase: doUserLoginOnFirebaseType = (
        email,
        password,
    ) =>
        new Promise(async (resolve, reject) => {
            try {
                await auth.signInWithEmailAndPassword(email, password);

                resolve();
            } catch (e) {
                reject(e);
            }
        });

    const logoutUserFromFirebase = async () => await auth.signOut();

    const loginThroughGoogle: loginThroughGoogleType = () =>
        new Promise(async (resolve, reject) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const firebaseUser = await firebase
                    .auth()
                    .signInWithPopup(provider);

                if (!firebaseUser.user) {
                    reject();
                    return;
                }

                const userExists = await usersCollection
                    .doc(firebaseUser.user.uid)
                    .get();

                if (!userExists.exists) {
                    await usersCollection.doc(firebaseUser.user.uid).set({
                        email: firebaseUser.user.email,
                        displayName: firebaseUser.user.email,
                        photoURL: defaultPhotoURL,
                    });
                }

                resolve();
            } catch (err) {
                reject(err);
            }
        });

    const createThroughGoogle: createThroughGoogleType = () =>
        new Promise(async (resolve, reject) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const firebaseUser = await firebase
                    .auth()
                    .signInWithPopup(provider);

                if (!firebaseUser.user) {
                    reject();
                    return;
                }

                await usersCollection.doc(firebaseUser.user.uid).set({
                    email: firebaseUser.user.email,
                    displayName: firebaseUser.user.email,
                    photoURL: defaultPhotoURL,
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        });

    const getUserPermission: getUserPermissionType = userId =>
        new Promise(async (resolve, reject) => {
            try {
                const userDoc = await usersCollection.doc(userId).get();

                if (!userDoc) {
                    reject();
                    return;
                }

                const data = userDoc.data();
                if (data) {
                    resolve({
                        allow:
                            (data?.allow ?? false) &&
                            data.allow !== undefined &&
                            data.allow,
                        admin:
                            (data?.admin ?? false) &&
                            data.admin !== undefined &&
                            data.admin,
                    });
                } else resolve({ allow: false, admin: false });
                return;
            } catch (error) {
                reject(error);
            }
        });

    // FIRESTORE
    const usersCollection = firestore.collection('users');

    return (
        <FirebaseContext.Provider
            value={{
                createUserOnFirebase,
                doUserLoginOnFirebase,
                logoutUserFromFirebase,
                loginThroughGoogle,
                createThroughGoogle,
                user,
                isFetchingUser,
                userPermission,
                getUserPermission,
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
}

function useFirebase() {
    const context = useContext(FirebaseContext);

    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }

    return context;
}

export { FirebaseProvider, useFirebase };
