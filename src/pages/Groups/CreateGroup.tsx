import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useAuthentication } from '../../context/authentication';
import { getUserDetailItems } from '../../database/repositories/userDetailRepository';
import { UserDetail } from '../../models/userDetail';
import {
    validateGroupCode,
    validateRequiredField,
} from '../../helpers/fieldValidation';
import { createEmptyGroup } from '../../database/repositories/groupRepository';
import { addParticipantToGroup } from '../../database/repositories/participantRepository';
import SpinnerButton from '../../components/SpinnerButton';
import BasicPage from '../../components/BasicPage';

//#region interfaces
const INITIAL_CREATE_FORM_VALUES: {
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

const INITIAL_CREATE_FORM_ERRORS: {
    name: string | null;
    code: string | null;
    description: string | null;
    isPublic: string | null;
    invitedUsers: string | null;
} = {
    name: null,
    code: null,
    description: null,
    isPublic: null,
    invitedUsers: null,
};

const INITIAL_CREATE_FORM = {
    values: INITIAL_CREATE_FORM_VALUES,
    errors: INITIAL_CREATE_FORM_ERRORS,
};

interface ICreateGroup {}
//#endregion

const CreateGroup: FunctionComponent<ICreateGroup> = () => {
    //#region context
    const { user } = useAuthentication();
    const { push } = useHistory();
    //#endregion

    //#region state
    const [availableUsers, setAvailableUsers] = useState(Array<UserDetail>());
    const [availableUsersLoaded, setAvailableUsersLoaded] = useState(false);
    const [groupForm, setGroupForm] = useState(INITIAL_CREATE_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createError, setCreateError] = useState(false);
    //#endregion

    //#region side effects
    useEffect(() => {
        const getUserDetailData = async (): Promise<void> => {
            try {
                const result = await getUserDetailItems(true);
                if (result !== null) {
                    setAvailableUsers(result);
                    setAvailableUsersLoaded(true);
                }
            } catch (error) {
                console.log(error);
                setAvailableUsersLoaded(true);
            }
        };

        getUserDetailData();
    }, [setAvailableUsersLoaded, setAvailableUsers]);
    //#endregion

    //#region callbacks
    const doValidation = useCallback((): boolean => {
        const name = validateRequiredField(groupForm.values.name)
            ? null
            : 'Please enter a group name';
        const code = validateGroupCode(groupForm.values.code)
            ? null
            : 'Please enter a valid group code';
        setGroupForm({
            ...groupForm,
            errors: {
                ...groupForm.errors,
                name,
                code,
            },
        });
        return name !== null || code !== null;
    }, [setGroupForm, groupForm]);

    const onSubmit = useCallback(
        async (e: SyntheticEvent): Promise<void> => {
            e.preventDefault();
            if (doValidation()) return;

            try {
                setIsSubmitting(true);
                if (user !== null) {
                    const newGroupId = await createEmptyGroup({
                        ...groupForm.values,
                        ownerId: user.uid,
                    });
                    await addParticipantToGroup(newGroupId, user);
                    push(`/groups/${newGroupId}`);
                } else {
                    setCreateError(true);
                    setIsSubmitting(false);
                }
            } catch (error) {
                setCreateError(true);
                setIsSubmitting(false);
                console.log(error);
            }
        },
        [
            setIsSubmitting,
            setCreateError,
            push,
            user,
            doValidation,
            groupForm.values,
        ],
    );

    const handleChange = useCallback(
        (
            e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>,
        ): void => {
            if (e.target.name === 'isPublic') {
                setGroupForm({
                    ...groupForm,
                    values: {
                        ...groupForm.values,
                        [e.target.name]: e.target.value === 'true',
                    },
                });
            } else {
                setGroupForm({
                    ...groupForm,
                    values: {
                        ...groupForm.values,
                        [e.target.name]: e.target.value,
                    },
                });
            }
        },
        [setGroupForm, groupForm],
    );

    const handleRadioChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>): void => {
            setGroupForm({
                ...groupForm,
                values: {
                    ...groupForm.values,
                    [e.currentTarget.name]: e.currentTarget.value === 'true',
                },
            });
        },
        [setGroupForm, groupForm],
    );

    const handleSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const userArray = Array.from(
                e.target.selectedOptions,
                option => option.value,
            );
            setGroupForm({
                ...groupForm,
                values: {
                    ...groupForm.values,
                    invitedUsers: userArray,
                },
            });
        },
        [setGroupForm, groupForm],
    );

    const clearSelectedUsers = useCallback((): void => {
        setGroupForm({
            ...groupForm,
            values: {
                ...groupForm.values,
                invitedUsers: new Array<string>(),
            },
        });
    }, [setGroupForm, groupForm]);

    const resetForm = useCallback((): void => {
        setGroupForm(INITIAL_CREATE_FORM);
    }, [setGroupForm]);
    //#endregion

    //#region render header
    const renderHeader = useCallback(
        () => (
            <>
                <h1 className="display-4">Create a group</h1>
                <p className="lead">
                    Here you can create a group to start working on your
                    friends' wish lists. If you'd like to, you can add people to
                    your group here. You'll only be able to see the emails of
                    people who have access to use this app already.
                </p>
                <p>
                    <em>
                        You will be made the owner of the group. So much power!
                    </em>
                </p>
            </>
        ),
        [],
    );
    //#endregion

    return (
        <BasicPage
            showAlert={createError}
            onAlertClose={() => setCreateError(false)}
            alertText="There was an error trying to join the group"
            renderHeader={renderHeader()}
        >
            <Card>
                <Card.Body>
                    <Card.Title>New Group</Card.Title>
                    <Form noValidate>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={groupForm.values.name}
                                onChange={handleChange}
                                isInvalid={!!groupForm.errors.name}
                                placeholder="Christmas, Grinch's Bday Party, etc..."
                            />
                            <Form.Control.Feedback type="invalid">
                                {groupForm.errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={groupForm.values.description}
                                onChange={handleChange}
                                isInvalid={!!groupForm.errors.description}
                                placeholder="Massive rager man!!"
                            />
                            <Form.Control.Feedback type="invalid">
                                {groupForm.errors.description}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="code">
                            <Form.Label>Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={groupForm.values.code}
                                onChange={handleChange}
                                isInvalid={!!groupForm.errors.code}
                                placeholder="1234"
                            />
                            <Form.Control.Feedback type="invalid">
                                {groupForm.errors.code}
                            </Form.Control.Feedback>
                            <Form.Text id="codeHelpText" muted>
                                This should be four or more letters/numbers that
                                your friends can use to join your group. Don't
                                forget it but don't make it too easy to guess!
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="isPublic">
                            <Form.Check
                                inline
                                label="Public"
                                type="radio"
                                name="isPublic"
                                id="isPublic-true"
                                value="true"
                                checked={groupForm.values.isPublic}
                                onChange={handleRadioChange}
                                disabled
                            />
                            <Form.Check
                                inline
                                label="Private"
                                type="radio"
                                name="isPublic"
                                id="isPublic-false"
                                value="false"
                                checked={groupForm.values.isPublic === false}
                                onChange={handleRadioChange}
                                disabled
                            />
                            <Form.Text id="isPublicHelpText" muted>
                                Groups are set to private by default for now.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="invitedUsers">
                            <Form.Label>Invite users</Form.Label>
                            <Button variant="link" onClick={clearSelectedUsers}>
                                Clear
                            </Button>
                            <Form.Control
                                as="select"
                                multiple
                                placeholder="Select..."
                                disabled={!availableUsersLoaded}
                                value={groupForm.values.invitedUsers}
                                onChange={handleSelectChange}
                            >
                                {availableUsers &&
                                    availableUsers
                                        .filter(u => user && u.id !== user.uid)
                                        .map(({ id, email }: UserDetail) => (
                                            <option value={id} key={id}>
                                                {email || id}
                                            </option>
                                        ))}
                            </Form.Control>
                            <Form.Text id="invitedUsersHelpText" muted>
                                Hold shift to select more than one!
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Container className="text-right">
                        <Button
                            onClick={resetForm}
                            variant="secondary"
                            className="mr-2"
                        >
                            Reset
                        </Button>
                        <SpinnerButton
                            loading={isSubmitting}
                            loadingText="Creating..."
                            staticText="Create"
                            buttonProps={{
                                type: 'submit',
                                disabled: isSubmitting,
                                onClick: onSubmit,
                                variant: 'success',
                            }}
                        />
                    </Container>
                </Card.Footer>
            </Card>
        </BasicPage>
    );
};

export default CreateGroup;
