import React, { useState, useEffect } from 'react';
import { useAuthentication } from '../../context/authentication';
import { useHistory } from 'react-router-dom';
import { groupRepository } from '../../database/db';

export const Home = () => {
    const { push } = useHistory();
    const { doLogout, user } = useAuthentication();
    const [groups, setGroups] = useState(Array<string>());

    useEffect(() => {
        const updateGroups = () => {
            const retrievedGroups = new Array<string>();
            groupRepository.get().then(snapshot => {
                snapshot.forEach(doc => {
                    retrievedGroups.push(doc.id);
                    const stuff = { ...doc.data() };
                    console.log(stuff);
                });
            });
            return retrievedGroups;
        };
        setGroups(updateGroups());
    }, []);

    const logout = async () => {
        await doLogout();

        push('/login');
    };

    return (
        <>
            <h1>Welcome to home page {user?.email} :)</h1>
            <button onClick={logout} type="button">
                Logout
            </button>
        </>
    );
};
