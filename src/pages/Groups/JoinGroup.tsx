import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import { useAuthentication } from '../../context/authentication';
import {
    getJoinableGroups,
    verifyGroupCode,
} from '../../database/repositories/groupRepository';
import { Group } from '../../models/group';
import { addParticipantToGroup } from '../../database/repositories/participantRepository';
import PageSpinner from '../../components/PageSpinner';
import BasicPage from '../../components/BasicPage';

//#region interfaces
interface IJoinGroup {}
//#endregion

const JoinGroup: FunctionComponent<IJoinGroup> = () => {
    //#region context
    const { user } = useAuthentication();
    const { push } = useHistory();
    //#endregion

    //#region state
    const [availableGroups, setAvailableGroups] = useState(Array<Group>());
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joinError, setJoinError] = useState(false);
    //#endregion

    //#region side effects
    useEffect(() => {
        const getGroupData = async (userId: string): Promise<void> => {
            try {
                const result = await getJoinableGroups(userId);
                if (result !== null) {
                    setAvailableGroups(result);
                    setGroupsLoaded(true);
                }
            } catch (error) {
                console.log(error);
            }
        };
        if (user !== null) {
            getGroupData(user.uid);
        }
    }, [user]);
    //#endregion

    //#region callbacks
    const handleJoinGroup = useCallback(
        async (id: string): Promise<void> => {
            setIsSubmitting(true);
            const userCode = prompt('Please enter the group code');
            if (userCode === null) {
                setIsSubmitting(false);
                return;
            }
            try {
                const validCode = await verifyGroupCode(id, userCode ?? '');
                if (!validCode) {
                    setJoinError(true);
                    setIsSubmitting(false);
                    return;
                }

                if (user !== null) {
                    await addParticipantToGroup(id, user);
                    setIsSubmitting(false);
                    push(`/groups/${id}`);
                }
            } catch (error) {
                console.log(error);
                setJoinError(true);
                setIsSubmitting(false);
            }
        },
        [setIsSubmitting, setJoinError, push, user],
    );
    //#endregion
    //#region renderHeader
    const renderHeader = useCallback(
        (): React.ReactNode => (
            <>
                <h1 className="display-4">Join Group</h1>
                <p className="lead">
                    Below are the groups that are available for you to join.
                </p>
                <p>
                    <em>
                        You can only join groups that you are not already in and
                        are invited to
                    </em>
                </p>
            </>
        ),
        [],
    );
    //#endregion

    //#region render
    return (
        <BasicPage
            showAlert={joinError}
            onAlertClose={() => setJoinError(false)}
            alertText="There was an error trying to join the group."
            renderHeader={renderHeader()}
        >
            {groupsLoaded ? (
                availableGroups && availableGroups.length > 0 ? (
                    <CardDeck>
                        {availableGroups.map(
                            ({
                                id,
                                name,
                                participants,
                                description,
                            }: Group): JSX.Element => {
                                const participantCount = participants?.length;
                                return (
                                    <Card key={id} className="text-center">
                                        <Card.Header>{name}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>
                                                {description}
                                            </Card.Title>
                                            <Card.Subtitle>
                                                Participants: {participantCount}
                                            </Card.Subtitle>
                                        </Card.Body>
                                        <Card.Footer>
                                            <Button
                                                onClick={() =>
                                                    handleJoinGroup(id)
                                                }
                                                disabled={isSubmitting}
                                            >
                                                Join
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                );
                            },
                        )}
                    </CardDeck>
                ) : (
                    <h1 className="display-5 text-center">
                        No available groups. You can create one, or ask a friend
                        to invite you!
                    </h1>
                )
            ) : (
                <PageSpinner />
            )}
        </BasicPage>
    );
    //#endregion
};

export default JoinGroup;
