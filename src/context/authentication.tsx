import React, { createContext, ReactNode, useContext } from 'react';
import { useFirebase } from './firebase';

type doLoginType = (email: string, password: string) => Promise<void>;
type doRegisterType = (email: string, password: string) => Promise<void>;
type doGoogleLoginOrRegisterType = () => Promise<void>;
type doLogoutType = () => Promise<void>;

type AuthenticationContextState = {
    isLogged: boolean;
    isFetchingUser: boolean;
    user: firebase.User | null;

    doLogin: doLoginType;
    doRegister: doRegisterType;
    doGoogleLoginOrRegister: doGoogleLoginOrRegisterType;
    doLogout: doLogoutType;
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

    const doGoogleLoginOrRegister: doGoogleLoginOrRegisterType = () =>
        new Promise(async (resolve, reject) => {
            try {
                await createOrLoginThroughGoogle();
                resolve();
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
