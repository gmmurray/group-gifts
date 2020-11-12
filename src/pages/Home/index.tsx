import React, { useState, useEffect, Fragment } from 'react';
import { useAuthentication } from '../../context/authentication';
import { useHistory } from 'react-router-dom';
import {
    getGroups,
    createEmptyGroup,
} from '../../database/repositories/groupRepository';
import { Group } from '../../models/group';
import { addParticipantToGroup } from '../../database/repositories/participantRepository';

const DEFAULT_CREATE_GROUP: {
    name: string;
    code: string;
    description: string;
    isPublic: boolean;
    invitedUsers: Array<string>;
} = {
    name: '',
    code: '',
    description: '',
    isPublic: false,
    invitedUsers: new Array<string>(),
};

const DEFAULT_PROFILE_UPDATE: {
    displayName: string;
    photoURL: string;
} = {
    displayName: '',
    photoURL: '',
};

interface IDisplayType {
    join: boolean;
    create: boolean;
    groups: boolean;
    profile: boolean;
}
const DEFAULT_DISPLAY: IDisplayType = {
    join: false,
    create: false,
    groups: false,
    profile: false,
};

export const Home = () => {
    const { push } = useHistory();
    const { doLogout, user, doProfileUpdate } = useAuthentication();
    const [groups, setGroups] = useState(Array<Group>());
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    const [display, setDisplay] = useState(DEFAULT_DISPLAY);
    const [createGroupForm, setCreateGroupForm] = useState(
        DEFAULT_CREATE_GROUP,
    );
    const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_UPDATE);

    useEffect(() => {
        const getGroupData = async () => {
            try {
                const result = await getGroups(true);
                if (result !== null) {
                    setGroups(result);
                    setGroupsLoaded(true);
                }
                return result;
            } catch (error) {
                console.log(error);
            }
        };
        getGroupData();
    }, []);

    useEffect(() => {
        if (!display?.create) setCreateGroupForm(DEFAULT_CREATE_GROUP);

        if (!display?.profile) setProfileForm(DEFAULT_PROFILE_UPDATE);
    }, [display, setCreateGroupForm]);

    const logout = async () => {
        await doLogout();

        push('/login');
    };

    const toggleDisplay = (displayKey: keyof IDisplayType) => {
        setDisplay({ ...DEFAULT_DISPLAY, [displayKey]: !display[displayKey] });
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
            const newGroupId = await createEmptyGroup({
                ...createGroupForm,
                ownerId: user.uid,
            });
            await addParticipantToGroup(newGroupId, user);
            push(`/groups/${newGroupId}`);
        } else {
            alert('Unable to create group.');
        }
    };

    const updateProfile = async () => {
        await doProfileUpdate({ ...profileForm });
    };

    const viewGroup = (id: string) => {
        push(`/groups/${id}`);
    };

    const handleCreateFormChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        if (e.target.name === 'isPublic') {
            setCreateGroupForm({
                ...createGroupForm,
                [e.target.name]: e.target.value === 'true',
            });
        } else if (e.target.name === 'invitedUsers') {
            const userArray = e.target.value?.split(',') ?? new Array<string>();

            setCreateGroupForm({
                ...createGroupForm,
                [e.target.name]: userArray,
            });
        } else {
            setCreateGroupForm({
                ...createGroupForm,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleProfileFormChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value,
        });
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

    // Group is available if current user is not the owner, is not a participant,
    // or is an invited user
    const availableGroups =
        groups &&
        groups?.filter(
            group =>
                group.participants &&
                group.participants.every(
                    p => p.userId === null || p.userId !== user?.uid,
                ) &&
                ((group.invitedUsers &&
                    group.invitedUsers.some(id => id === user?.uid)) ||
                    group.ownerId === user?.uid),
        );
    return (
        <>
            <div>
                <h1>
                    Welcome to home page {user?.displayName ?? user?.email} :)
                </h1>
                <button onClick={logout} type="button">
                    Logout
                </button>
                <button
                    onClick={() => toggleDisplay('profile')}
                    type="button"
                    style={{ marginLeft: '2rem', marginRight: '2rem' }}
                >
                    Profile
                </button>
            </div>
            <hr />
            <div style={{ display: 'flex' }}>
                <button
                    onClick={() => toggleDisplay('join')}
                    type="button"
                    style={{ marginRight: '2rem' }}
                >
                    Join a group
                </button>
                <button
                    onClick={() => toggleDisplay('create')}
                    type="button"
                    style={{ marginLeft: '2rem', marginRight: '2rem' }}
                >
                    Create a group
                </button>
                <button
                    onClick={() => toggleDisplay('groups')}
                    type="button"
                    style={{ marginLeft: '2rem' }}
                >
                    View my groups
                </button>
            </div>
            {display.profile && (
                <>
                    <hr />
                    <div>
                        <div style={{ marginBottom: '2rem' }}>
                            <input
                                type="text"
                                name="displayName"
                                id="displayName"
                                value={profileForm.displayName}
                                onChange={handleProfileFormChange}
                                placeholder={
                                    user?.displayName !== null
                                        ? user?.displayName
                                        : 'Display Name'
                                }
                                style={{ marginRight: '2rem ' }}
                            />
                            <input
                                type="text"
                                name="code"
                                id="code"
                                value={profileForm.photoURL}
                                onChange={handleProfileFormChange}
                                placeholder="Photo URL"
                                style={{ marginRight: '2rem ' }}
                            />
                        </div>
                        <div>
                            <button onClick={updateProfile}>
                                Update profile
                            </button>
                        </div>
                    </div>
                </>
            )}
            {display.join && (
                <>
                    <hr />
                    <div>
                        <h4>Available Groups:</h4>
                        <ul>
                            {availableGroups.map(
                                ({ id, name, isPublic, code }) => (
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
                                ),
                            )}
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
                            <textarea
                                name="description"
                                id="description"
                                value={createGroupForm.description}
                                onChange={handleCreateFormChange}
                                placeholder="Description"
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
                                    style={{ marginRight: '2rem ' }}
                                />
                            </label>
                            <textarea
                                name="invitedUsers"
                                id="invitedUsers"
                                value={createGroupForm.invitedUsers}
                                onChange={handleCreateFormChange}
                                placeholder="Invited User IDs"
                                style={{ marginRight: '2rem ' }}
                                hidden={createGroupForm.isPublic !== false}
                            />
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
