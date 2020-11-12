import React, { useEffect, useState } from 'react';
import { useAuthentication } from '../../context/authentication';
import {
    deleteGroup,
    getFullGroup,
    removeUserFromGroup,
} from '../../database/repositories/groupRepository';
import { Group as GroupModel } from '../../models/group';

interface IGroupProps {
    match: {
        params: {
            groupId: string;
        };
    };
    history: {
        push: Function;
    };
}

const DEFAULT_LOAD_STATE: { loaded: boolean; error: string | null } = {
    loaded: false,
    error: null,
};

const Group = ({
    match: {
        params: { groupId },
    },
    history: { push },
}: IGroupProps) => {
    const { user } = useAuthentication();
    const [groupLoaded, setGroupLoaded] = useState(DEFAULT_LOAD_STATE);
    const [userGroup, setUserGroup] = useState(new GroupModel(undefined));

    useEffect(() => {
        const getGroupData = async () => {
            const result = await getFullGroup(groupId);
            if (result !== null) {
                setGroupLoaded({ ...groupLoaded, loaded: true });
                setUserGroup(
                    new GroupModel({
                        ...result,
                    }),
                );
            } else {
                setGroupLoaded({
                    ...groupLoaded,
                    loaded: true,
                    error: 'Error loading group',
                });
            }
        };

        getGroupData();
    }, []);

    const leaveGroup = async () => {
        if (user !== null) {
            try {
                await removeUserFromGroup(groupId, user.uid);
                push('/');
            } catch (error) {
                console.log(error);
                alert('Error removing you from the group');
            }
        }
    };

    const deleteCurrentGroup = async () => {
        if (user !== null) {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure you want to delete this group?')) {
                await deleteGroup(groupId);
                push('/');
                return;
            }
        }
    };

    if (!groupLoaded?.loaded) {
        return (
            <div>
                <h1>Loading group...</h1>
            </div>
        );
    } else if (groupLoaded.error !== null) {
        return (
            <div>
                <h1>{groupLoaded.error}</h1>
            </div>
        );
    } else if (
        (userGroup?.participants?.length === 0 ?? true) ||
        userGroup.participants.every(p => p.userId !== user?.uid)
    ) {
        return (
            <div>
                <h1>You do not have access to this group</h1>
            </div>
        );
    }
    return (
        <div>
            <button onClick={() => push('/')}>Home</button>
            <h1>Group {userGroup.id}</h1>
            <h2>Event: {userGroup.name}</h2>
            {userGroup.description !== undefined &&
                userGroup.description !== '' && (
                    <h2>Description: {userGroup.description}</h2>
                )}
            <div>
                {userGroup.ownerId &&
                user !== null &&
                userGroup.ownerId === user.uid ? (
                    <button onClick={deleteCurrentGroup}>Delete Group</button>
                ) : (
                    <button onClick={leaveGroup}>Leave Group</button>
                )}

                <h2>Participants</h2>
                <div
                    style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                    {userGroup.participants &&
                        userGroup.participants.map(({ userId, identifier }) => (
                            <div
                                key={userId}
                                style={{
                                    border: `2px solid ${
                                        userId === user?.uid ? 'red' : 'black'
                                    }`,
                                    padding: '2rem',
                                }}
                            >
                                {identifier}
                            </div>
                        ))}
                </div>
            </div>
            <div>
                <h2>Gifts</h2>
                <button onClick={() => push(`/groups/${groupId}/gifts`)}>
                    My Wish List
                </button>
                <div
                    style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                    {userGroup.gifts &&
                        userGroup.gifts
                            .filter(({ userId }) => userId !== user?.uid)
                            .map(
                                ({
                                    id,
                                    name,
                                    price,
                                    status,
                                    userId,
                                    webUrl,
                                }) => (
                                    <div
                                        key={id}
                                        style={{
                                            border: '2px solid black',
                                            padding: '2rem',
                                        }}
                                    >
                                        <h3>{name}</h3>
                                        <h5>
                                            {
                                                userGroup.participants.find(
                                                    p => p.userId === userId,
                                                )?.identifier
                                            }
                                        </h5>
                                        <ul>
                                            <li>{price}</li>
                                            <li>{status}</li>
                                            <li>{webUrl}</li>
                                        </ul>
                                    </div>
                                ),
                            )}
                </div>
            </div>
        </div>
    );
};

export default Group;
