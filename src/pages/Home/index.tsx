import React, { useState, useEffect, Fragment } from 'react';
import { useAuthentication } from '../../context/authentication';
import { useHistory } from 'react-router-dom';
import {
    getGroups,
    createEmptyGroup,
    subsribeGroups,
} from '../../database/repositories/groupRepository';
import { Group } from '../../models/group';
import { addParticipantToGroup } from '../../database/repositories/participantRepository';

const DEFAULT_CREATE_GROUP: {
    name: string;
    code: string;
    isPublic: boolean;
} = {
    name: '',
    code: '',
    isPublic: false,
};

const DEFAULT_DISPLAY: {
    join: boolean;
    create: boolean;
    groups: boolean;
} = { join: false, create: false, groups: false };

export const Home = () => {
    const { push } = useHistory();
    const { doLogout, user } = useAuthentication();
    const [groups, setGroups] = useState(Array<Group>());
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    const [display, setDisplay] = useState(DEFAULT_DISPLAY);
    const [displayJoin, setDisplayJoin] = useState(false);
    const [displayCreate, setDisplayCreate] = useState(false);
    const [createGroupForm, setCreateGroupForm] = useState(
        DEFAULT_CREATE_GROUP,
    );

    useEffect(() => {
        const getGroupData = async () => {
            const result = await getGroups(true);
            if (result !== null) {
                setGroups(result);
                setGroupsLoaded(true);
            }
            return result;
        };
        getGroupData();
    }, []);

    useEffect(() => {
        if (!displayCreate) {
            setCreateGroupForm(DEFAULT_CREATE_GROUP);
        }
    }, [displayCreate, setCreateGroupForm]);

    const logout = async () => {
        await doLogout();

        push('/login');
    };

    const toggleDisplayJoin = () => {
        setDisplay({ ...DEFAULT_DISPLAY, join: !display.join });
    };

    const toggleDisplayCreate = () => {
        setDisplay({ ...DEFAULT_DISPLAY, create: !display.create });
    };

    const toggleDisplayGroups = () => {
        setDisplay({ ...DEFAULT_DISPLAY, groups: !display.groups });
    };

    const joinGroup = async (id: string, isPublic: boolean, code: string) => {
        if (!isPublic) {
            const userCode = prompt('Please enter the group code');
            if (userCode !== code) {
                alert('You are unable to join this group');
                return;
            }
        }

        if (user !== null) {
            await addParticipantToGroup(id, user);
            push(`/groups/${id}`);
        }
    };

    const createGroup = async () => {
        if (user !== null) {
            const newGroupId = await createEmptyGroup(createGroupForm);
            await addParticipantToGroup(newGroupId, user);
            push(`/groups/${newGroupId}`);
        } else {
            alert('Unable to create group.');
        }
    };

    const viewGroup = (id: string) => {
        push(`/groups/${id}`);
    };

    const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'isPublic') {
            setCreateGroupForm({
                ...createGroupForm,
                [e.target.name]: e.target.value === 'true',
            });
        } else {
            setCreateGroupForm({
                ...createGroupForm,
                [e.target.name]: e.target.value,
            });
        }
    };

    const userGroups =
        groups &&
        groups?.filter(
            group =>
                group.participants &&
                group.participants.some(
                    p => p.userId && p.userId === user?.uid,
                ),
        );
    return (
        <>
            <div>
                <h1>Welcome to home page {user?.email} :)</h1>
                <button onClick={logout} type="button">
                    Logout
                </button>
            </div>
            <hr />
            <div style={{ display: 'flex' }}>
                <button
                    onClick={toggleDisplayJoin}
                    type="button"
                    style={{ marginRight: '2rem' }}
                >
                    Join a group
                </button>
                <button
                    onClick={toggleDisplayCreate}
                    type="button"
                    style={{ marginLeft: '2rem', marginRight: '2rem' }}
                >
                    Create a group
                </button>
                <button
                    onClick={toggleDisplayGroups}
                    type="button"
                    style={{ marginLeft: '2rem' }}
                >
                    View my groups
                </button>
            </div>
            {display.join && (
                <>
                    <hr />
                    <div>
                        <h4>Available Groups:</h4>
                        <ul>
                            {groups &&
                                groups.length &&
                                groups.map(({ id, name, isPublic, code }) => (
                                    <Fragment key={id}>
                                        <div>{name}</div>
                                        <div>
                                            <button
                                                onClick={() =>
                                                    joinGroup(
                                                        id,
                                                        isPublic,
                                                        code,
                                                    )
                                                }
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </Fragment>
                                ))}
                        </ul>
                    </div>
                </>
            )}
            {display.create && (
                <>
                    <hr />
                    <div>
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={createGroupForm.name}
                                onChange={handleCreateFormChange}
                                placeholder="Name"
                                style={{ marginRight: '2rem ' }}
                            />
                            <input
                                type="text"
                                name="code"
                                id="code"
                                required
                                maxLength={4}
                                value={createGroupForm.code}
                                onChange={handleCreateFormChange}
                                placeholder="Code"
                                style={{ marginRight: '2rem ' }}
                            />
                            <label>
                                Public
                                <input
                                    type="radio"
                                    name="isPublic"
                                    id="isPublic-true"
                                    value="true"
                                    checked={createGroupForm.isPublic}
                                    onChange={handleCreateFormChange}
                                    style={{ marginRight: '2rem ' }}
                                />
                            </label>
                            <label>
                                Private
                                <input
                                    type="radio"
                                    name="isPublic"
                                    id="isPublic-false"
                                    value="false"
                                    checked={createGroupForm.isPublic === false}
                                    onChange={handleCreateFormChange}
                                />
                            </label>
                        </div>
                        <div>
                            <button onClick={createGroup}>Create group</button>
                        </div>
                    </div>
                </>
            )}
            {display.groups && (
                <>
                    <hr />
                    <h3>My groups</h3>
                    {!groupsLoaded ? (
                        <div>Loading...</div>
                    ) : (
                        userGroups.map(({ id, name }) => (
                            <button key={id} onClick={() => viewGroup(id)}>
                                {name}
                            </button>
                        ))
                    )}
                </>
            )}
        </>
    );
};
