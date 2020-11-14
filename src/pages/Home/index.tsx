import React, { useState, useEffect, Fragment } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { useAuthentication } from '../../context/authentication';
import { useHistory, Link } from 'react-router-dom';
import {
    getGroups,
    createEmptyGroup,
} from '../../database/repositories/groupRepository';
import { Group } from '../../models/group';
import { addParticipantToGroup } from '../../database/repositories/participantRepository';

import './styles.scss';

//#region interfaces
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
//#endregion

export const Home = () => {
    //#region context
    const { push } = useHistory();
    const { doLogout, user, doProfileUpdate } = useAuthentication();
    //#endregion

    //#region state
    const [groups, setGroups] = useState(Array<Group>());
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    const [display, setDisplay] = useState(DEFAULT_DISPLAY);
    const [createGroupForm, setCreateGroupForm] = useState(
        DEFAULT_CREATE_GROUP,
    );
    const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_UPDATE);
    //#endregion

    //#region side effects
    useEffect(() => {
        const getGroupData = async () => {
            try {
                const result = await getGroups(true);
                if (result !== null) {
                    setGroups(result);
                    setGroupsLoaded(true);
                }
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
    //#endregion

    //#region callbacks
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
    //#endregion

    //#region local variables
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
    //#endregion

    //#region render
    return (
        <>
            <Container
                fluid
                className="position-relative overflow-hidden p-md-5 text-center bg-light"
            >
                <Col md={5} className="p-lg-5 mx-auto my-5">
                    <h1 className="display-4 font-weight-normal">Group Gift</h1>
                    <p className="lead font-weight-normal">
                        The best way to plan wish lists for any gift-buying
                        event
                    </p>
                </Col>
            </Container>
            <Container fluid className="pl-0 pr-0 py-2 py-lg-5">
                <Row noGutters className="w-100 text-center">
                    <Col
                        lg={4}
                        className="w-100 bg-dark text-light home-column"
                    >
                        <Container className="my-3 py-3">
                            <h1 className="display-5">
                                Join an existing group
                            </h1>
                            <p className="lead">
                                Click below to view groups that have already
                                been created. The owner of each group will need
                                to invite you for you to be able to see their
                                group
                            </p>
                            <Button
                                variant="outline-light"
                                as={Link}
                                to="/join"
                            >
                                Join now
                            </Button>
                        </Container>
                    </Col>
                    <Col lg={4} className="w-100 bg-light home-column">
                        <Container className="my-3 py-3">
                            <h1 className="display-5">Create a new group</h1>
                            <p className="lead">
                                Click below to create a new group. You can
                                invite as many people to the group as you want.
                                The more the merrier!
                            </p>
                            <Button
                                variant="outline-dark"
                                as={Link}
                                to="/create"
                            >
                                Create now
                            </Button>
                        </Container>
                    </Col>
                    <Col
                        lg={4}
                        className="w-100 bg-dark text-light home-column"
                    >
                        <Container className="my-3 py-3">
                            <h1 className="display-5">View your groups</h1>
                            <p className="lead">
                                Click below to view the groups that you have
                                already joined. You will be able to see what the
                                group is for, the people in the group, and
                                available gifts (except yours of course!).
                            </p>
                            <Button
                                variant="outline-light"
                                as={Link}
                                to="/view"
                            >
                                View now
                            </Button>
                        </Container>
                    </Col>
                </Row>
            </Container>
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
    //#endregion
};
