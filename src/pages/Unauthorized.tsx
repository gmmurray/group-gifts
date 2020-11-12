import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthentication } from '../context/authentication';

const Unauthorized = () => {
    const { doLogout } = useAuthentication();
    const { push } = useHistory();
    const logout = async () => {
        await doLogout();

        push('/login');
    };

    return (
        <div>
            You have successfully signed up, but do not yet have access to use
            this application. Please wait until the admin provides your access.{' '}
            <div>
                <button onClick={logout} type="button">
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
