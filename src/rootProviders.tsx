import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseProvider } from './context/firebase';
import { AuthenticationProvider } from './context/authentication';
import { WindowProvider } from './context/windowDimensions';

type RootProviderProps = {
    children: React.ReactNode;
};

export const RootProvider = ({ children }: RootProviderProps) => {
    return (
        <BrowserRouter>
            <WindowProvider>
                <FirebaseProvider>
                    <AuthenticationProvider>{children}</AuthenticationProvider>
                </FirebaseProvider>
            </WindowProvider>
        </BrowserRouter>
    );
};
