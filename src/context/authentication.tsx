import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useFirebase } from './firebase';

type doLoginType = (email: string, password: string) => Promise<void>;
type doRegisterType = (email: string, password: string) => Promise<void>;
type doGoogleLoginOrRegisterType = (create: boolean) => Promise<void>;
type doLogoutType = () => Promise<void>;

type updateType = {
    displayName: string | undefined;
    photoURL: string | undefined;
};
type doProfileUpdateType = (updates: updateType) => Promise<void>;

type AuthenticationContextState = {
    isLogged: boolean;
    isFetchingUser: boolean;
    hasAccess: boolean;
    user: firebase.User | null;
    doLogin: doLoginType;
    doRegister: doRegisterType;
    doGoogleLoginOrRegister: doGoogleLoginOrRegisterType;
    doLogout: doLogoutType;
    doProfileUpdate: doProfileUpdateType;
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
        createOrLoginThroughGoogle,
        hasAccess,
        user,
        isFetchingUser,
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

    const doGoogleLoginOrRegister: doGoogleLoginOrRegisterType = create =>
        new Promise(async (resolve, reject) => {
            try {
                await createOrLoginThroughGoogle(create);
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
                    resolve();
                } else {
                    throw Error('User does not exist');
                }
            } catch (err) {
                reject(err);
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
                doGoogleLoginOrRegister,
                doLogout,
                doProfileUpdate,
                hasAccess,
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
