import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useAuthentication } from '../../context/authentication';
import { Group } from '../../models/group';
import PageSpinner from '../../components/PageSpinner';
import {
    getUserGroups,
    removeUserFromGroup,
} from '../../database/repositories/groupRepository';
import { sortByProperty } from '../../helpers/sort';
import { useWindowDimensions } from '../../context/windowDimensions';
import SpinnerButton from '../../components/SpinnerButton';
import BasicPage from '../../components/BasicPage';

//#region interfaces
interface IMyGroups {}
//#endregion

const MyGroups: FunctionComponent<IMyGroups> = () => {
    //#region context
    const { user } = useAuthentication();
    const { push } = useHistory();
    const { recalcDimensions } = useWindowDimensions();
    //#endregion

    //#region state
    const [availableGroups, setAvailableGroups] = useState(Array<Group>());
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState(false);
    //#endregion

    //#region side effects
    useEffect(() => {
        const getGroupData = async (userId: string): Promise<void> => {
            try {
                const result = await getUserGroups(userId);
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

    useEffect(() => {
        if (groupsLoaded) recalcDimensions();
    }, [groupsLoaded, recalcDimensions]);
    //#endregion

    //#region callbacks
    const refreshGroups = useCallback(async (): Promise<void> => {
        if (user !== null) {
            try {
                const result = await getUserGroups(user?.uid);
                if (result !== null) {
                    setAvailableGroups(result);
                    setGroupsLoaded(true);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, [setAvailableGroups, setGroupsLoaded, user]);

    const handleViewGroup = useCallback(
        (id: string): void => {
            push(`/groups/${id}`);
        },
        [push],
    );

    const handleLeaveGroup = useCallback(
        async (id: string): Promise<void> => {
            if (user !== null) {
                setLeaveLoading(true);
                try {
                    await removeUserFromGroup(id, user.uid);
                    await refreshGroups();
                } catch (error) {
                    console.log(error);
                    setLeaveError(true);
                }
                setLeaveLoading(false);
            }
        },
        [refreshGroups, user],
    );
    //#endregion

    //#region render header
    const renderHeader = useCallback(
        (): React.ReactNode => (
            <>
                <h1 className="display-4">My Groups</h1>
                <p className="lead">
                    These are the groups you've already joined.
                </p>
            </>
        ),
        [],
    );
    //#endregion

    //#region render
    return (
        <BasicPage
            showAlert={leaveError}
            onAlertClose={() => setLeaveError(false)}
            alertText="There was an error trying to leave the group."
            renderHeader={renderHeader()}
        >
            {groupsLoaded ? (
                availableGroups && availableGroups.length > 0 ? (
                    <Row xs={1} lg={2}>
                        {sortByProperty(availableGroups, 'name').map(
                            ({
                                id,
                                name,
                                participants,
                                description,
                                ownerId,
                            }: Group): JSX.Element => {
                                const participantCount = participants?.length;
                                return (
                                    <Col key={id} className="mb-4">
                                        <Card key={id} className="text-center">
                                            <Card.Header>{name}</Card.Header>
                                            <Card.Body>
                                                <Card.Title>
                                                    {description}
                                                </Card.Title>
                                                <Card.Subtitle>
                                                    Participants:{' '}
                                                    {participantCount}
                                                </Card.Subtitle>
                                            </Card.Body>
                                            <Card.Footer>
                                                {ownerId === user?.uid ? (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip
                                                                id={`leave-${id}-tooltip`}
                                                            >
                                                                You are unable
                                                                to leave a group
                                                                that you
                                                                created.
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Button
                                                            variant="danger"
                                                            className="mr-2"
                                                            onClick={() => {}}
                                                        >
                                                            Leave
                                                        </Button>
                                                    </OverlayTrigger>
                                                ) : (
                                                    <SpinnerButton
                                                        loading={leaveLoading}
                                                        staticText="Leave"
                                                        loadingText="Leaving..."
                                                        buttonProps={{
                                                            type: 'button',
                                                            disabled: leaveLoading,
                                                            onClick: () =>
                                                                handleLeaveGroup(
                                                                    id,
                                                                ),
                                                            variant: 'danger',
                                                            className: 'mr-2',
                                                        }}
                                                    />
                                                )}
                                                <Button
                                                    onClick={() =>
                                                        handleViewGroup(id)
                                                    }
                                                >
                                                    View
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                );
                            },
                        )}
                    </Row>
                ) : (
                    <h1 className="display-5 text-center">
                        You aren't in any groups. You can create one, or ask a
                        friend to invite you!
                    </h1>
                )
            ) : (
                <PageSpinner />
            )}
        </BasicPage>
    );
    //#endregion
};

export default MyGroups;
