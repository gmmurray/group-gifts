import React, { createContext, ReactNode, useContext } from 'react';
import { updateUserDetail } from '../database/repositories/userDetailRepository';
import {
    currentUserDetailsType,
    getCurrentUserDetailsType,
    refreshCurrentUserDetailsType,
    useFirebase,
} from './firebase';

type doLoginType = (email: string, password: string) => Promise<void>;
type doRegisterType = (email: string, password: string) => Promise<void>;
type doGooglerRegisterType = () => Promise<void>;
type doGoogleLoginType = () => Promise<void>;
type doLogoutType = () => Promise<void>;
type doPasswordUpdateType = (password: string) => Promise<void>;
type doPasswordResetType = (email: string) => Promise<void>;

type updateType = {
    displayName: string | undefined;
    photoURL: string | undefined;
};
type doProfileUpdateType = (updates: updateType) => Promise<void>;

type AuthenticationContextState = {
    isLogged: boolean;
    isFetchingUser: boolean;
    currentUserDetails: currentUserDetailsType;
    getCurrentUserDetails: getCurrentUserDetailsType;
    refreshCurrentUserDetails: refreshCurrentUserDetailsType;
    user: firebase.User | null;
    doLogin: doLoginType;
    doRegister: doRegisterType;
    doGoogleLogin: doGoogleLoginType;
    doGoogleRegister: doGooglerRegisterType;
    doLogout: doLogoutType;
    doProfileUpdate: doProfileUpdateType;
    doPasswordUpdate: doPasswordUpdateType;
    doPasswordReset: doPasswordResetType;
};

const AuthenticationContext = createContext<
    AuthenticationContextState | undefined
>(undefined);

type AuthenticationProviderProps = {
    children: ReactNode;
};

const AuthenticationProvider = ({ children }: AuthenticationProviderProps) => {
    const {
        createUserOnFirebase,
        doUserLoginOnFirebase,
        logoutUserFromFirebase,
        createThroughGoogle,
        loginThroughGoogle,
        currentUserDetails,
        getCurrentUserDetails,
        user,
        isFetchingUser,
        refreshCurrentUserDetails,
        updateUserPassword,
        resetUserPassword,
    } = useFirebase();
    const getLoggedUser = () => user;

    const doLogin: doLoginType = (email, password) =>
        new Promise(async (resolve, reject) => {
            try {
                await doUserLoginOnFirebase(email, password);
                resolve();
            } catch (e) {
                reject(e);
            }
        });

    const doRegister: doRegisterType = (email, password) =>
        new Promise(async (resolve, reject) => {
            try {
                await createUserOnFirebase(email, password);
                resolve();
            } catch (e) {
                reject(e);
            }
        });

    const doLogout: doLogoutType = async () => await logoutUserFromFirebase();

    const doGoogleLogin: doGoogleLoginType = () =>
        new Promise(async (resolve, reject) => {
            try {
                await loginThroughGoogle();
                resolve();
            } catch (err) {
                reject(err);
            }
        });

    const doGoogleRegister: doGooglerRegisterType = () =>
        new Promise(async (resolve, reject) => {
            try {
                await createThroughGoogle();
                resolve();
            } catch (err) {
                reject(err);
            }
        });

    const doProfileUpdate: doProfileUpdateType = updates =>
        new Promise(async (resolve, reject) => {
            try {
                const user = getLoggedUser();
                if (user !== null) {
                    await user.updateProfile({
                        ...updates,
                    });
                    await updateUserDetail(user.uid, { ...updates });
                    resolve();
                } else {
                    throw Error('User does not exist');
                }
            } catch (err) {
                reject(err);
            }
        });

    const doPasswordUpdate: doPasswordUpdateType = (password: string) =>
        new Promise(async (resolve, reject) => {
            const user = getLoggedUser();
            if (user !== null) {
                try {
                    await updateUserPassword(password);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });

    const doPasswordReset: doPasswordResetType = (email: string) =>
        new Promise(async (resolve, reject) => {
            try {
                await resetUserPassword(email);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    return (
        <AuthenticationContext.Provider
            value={{
                isLogged: !!getLoggedUser(),
                user: getLoggedUser(),
                isFetchingUser,
                doLogin,
                doRegister,
                doGoogleLogin,
                doGoogleRegister,
                doLogout,
                doProfileUpdate,
                currentUserDetails,
                getCurrentUserDetails,
                refreshCurrentUserDetails,
                doPasswordUpdate,
                doPasswordReset,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};

const useAuthentication = () => {
    const context = useContext(AuthenticationContext);

    if (context === undefined) {
        throw new Error(
            'useAuthentication must be used within a AuthenticationProvider',
        );
    }

    return context;
};

export { AuthenticationProvider, useAuthentication };
