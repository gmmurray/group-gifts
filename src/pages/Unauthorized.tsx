import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthentication } from '../context/authentication';

const Unauthorized = () => {
    const { doLogout } = useAuthentication();
    const { push, go } = useHistory();

    const logout = useCallback(async () => {
        await doLogout();

        push('/login');
    }, [doLogout, push]);

    const doRefresh = useCallback(() => {
        go(0);
    }, [go]);
    return (
        <div>
            You have successfully signed up, but do not yet have access to use
            this application. Please wait until the admin provides your access.{' '}
            <div>
                <button
                    onClick={logout}
                    type="button"
                    className="btn btn-secondary mr-2"
                >
                    Log out
                </button>
                <button
                    onClick={doRefresh}
                    type="button"
                    className="btn btn-secondary mr-2"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
