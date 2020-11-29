import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import {
    BsArrowRepeat,
    BsCaretDownFill,
    BsCaretUpFill,
    BsInfoCircleFill,
} from 'react-icons/bs';

import BasicPage from '../../components/BasicPage';
import { useAuthentication } from '../../context/authentication';
import { useWindowDimensions } from '../../context/windowDimensions';
import {
    getFullGroup,
    removeUserFromGroup,
} from '../../database/repositories/groupRepository';
import { getUserDetailItemsFromList } from '../../database/repositories/userDetailRepository';
import { GroupUpdate, mapToGroupUpdate, ViewGroup } from '../../models/group';
import { UserDetail } from '../../models/userDetail';
import { sortByProperty, sortByPropertyDesc } from '../../helpers/sort';
import { Gift, GiftStatus } from '../../models/gift';
import { defaultPhotoURL } from '../../context/firebase';
import AccordionDropdown from '../../components/AccordionDropdown';
import GiftCard from '../../components/GiftCard';
import PageSpinner from '../../components/PageSpinner';
import UpdateGroupModal from './UpdateGroupModal';
import { updateGiftStatus } from '../../database/repositories/giftRepository';
import {
    defaultLoadedType,
    DEFAULT_LOADING_STATE,
    DEFAULT_LOAD_STATE,
} from '../../shared/defaultTypes';
import HelpPopover from './HelpPopover';

//#region interfaces
type sortOptions = { name: string; price: string };
type defaultGiftOptionsType = {
    sort: keyof sortOptions;
    dir: string;
    filter: string;
    user: string | null;
    status: GiftStatus | null;
};
const DEFAULT_GIFT_OPTIONS: defaultGiftOptionsType = {
    sort: 'name',
    dir: 'asc',
    filter: '',
    user: null,
    status: null,
};

interface IGroupsProps {
    match: {
        params: {
            groupId: string;
        };
    };
    history: {
        push: Function;
    };
}
//#endregion

const Group: FunctionComponent<IGroupsProps> = ({
    match: {
        params: { groupId },
    },
    history: { push },
}) => {
    //#region context
    const { user } = useAuthentication();
    const { recalcDimensions } = useWindowDimensions();
    //#endregion

    //#region state
    const [groupLoaded, setGroupLoaded] = useState(DEFAULT_LOAD_STATE);
    const [leaveLoading, setLeaveLoading] = useState(DEFAULT_LOADING_STATE);
    const [updateGroupOpen, setUpdateGroupOpen] = useState(false);
    const [userGroup, setUserGroup] = useState(new ViewGroup(undefined));
    const [groupParticipants, setGroupParticipants] = useState(
        new Array<UserDetail>(),
    );
    const [giftOptions, setGiftOptions] = useState(DEFAULT_GIFT_OPTIONS);
    //#endregion

    //#region side effects
    useEffect(() => {
        const getGroupData = async () => {
            const result = await getFullGroup(groupId, user?.uid);
            if (result !== null) {
                const userDetails = await getUserDetailItemsFromList(
                    result.participants.map(p => p.userId),
                );
                setUserGroup(
                    new ViewGroup({
                        ...result,
                    }),
                );
                if (userDetails !== null) {
                    setGroupParticipants(userDetails);
                }
                setGroupLoaded({ ...groupLoaded, loaded: true });
            } else {
                setGroupLoaded({
                    ...groupLoaded,
                    loaded: true,
                    error: 'There was an error loading the group',
                });
            }
        };

        getGroupData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (groupLoaded.loaded) recalcDimensions();
    }, [groupLoaded.loaded, recalcDimensions]);

    useEffect(() => recalcDimensions(), [giftOptions, recalcDimensions]);

    useEffect((): void => {
        if (user !== null && groupLoaded.loaded) {
            if (
                userGroup.participants.length === 0 ||
                !userGroup.participants.some(p => p.userId === user.uid)
            )
                push('/join');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, groupLoaded, userGroup]);
    //#endregion

    //#region callbacks
    const handleLeaveGroup = useCallback(async (): Promise<void> => {
        if (user !== null) {
            setLeaveLoading({
                ...leaveLoading,
                loading: true,
            });
            try {
                await removeUserFromGroup(groupId, user.uid);
                setLeaveLoading({
                    ...leaveLoading,
                    loading: false,
                });
                push('/');
            } catch (error) {
                console.log(error);
                setLeaveLoading({
                    ...leaveLoading,
                    loading: false,
                    error: 'There was an error leaving the group',
                });
            }
        }
    }, [user, setLeaveLoading, push, leaveLoading, groupId]);

    const handleGiftOptions = useCallback((): Array<Gift> => {
        const resolvedStatus = (currStatus: GiftStatus | null) => {
            if (giftOptions.status === null) {
                return (
                    currStatus === GiftStatus.Available ||
                    currStatus === GiftStatus.Claimed ||
                    currStatus === GiftStatus.Purchased
                );
            } else {
                return currStatus === giftOptions.status;
            }
        };

        const resolvedUser = (userId: string) => {
            if (giftOptions.user !== null) {
                return giftOptions.user === userId;
            }
            return true;
        };

        const searchProps = (gift: Gift, filter: string) => {
            const lowerFilter = filter.toLocaleLowerCase();
            return (
                gift.name.toLocaleLowerCase().includes(lowerFilter) ||
                gift.note.toLocaleLowerCase().includes(lowerFilter) ||
                (gift.status as string)
                    .toLocaleLowerCase()
                    .includes(lowerFilter)
            );
        };

        const gifts = userGroup.gifts.filter(
            g =>
                searchProps(g, giftOptions.filter) &&
                resolvedStatus(g.status) &&
                resolvedUser(g.userId),
        );

        return giftOptions.dir === 'asc'
            ? sortByProperty(gifts, giftOptions.sort)
            : sortByPropertyDesc(gifts, giftOptions.sort);
    }, [userGroup.gifts, giftOptions]);

    const clearAlert = useCallback((): void => {
        setGroupLoaded({
            ...groupLoaded,
            error: DEFAULT_LOAD_STATE.error,
        });
        setLeaveLoading({
            ...leaveLoading,
            error: DEFAULT_LOADING_STATE.error,
        });
    }, [setGroupLoaded, groupLoaded, leaveLoading, setLeaveLoading]);

    const handleStatusSelect = useCallback(
        (eventKey: string | null): void =>
            setGiftOptions({
                ...giftOptions,
                status: Object.values(GiftStatus).includes(
                    eventKey as GiftStatus,
                )
                    ? (eventKey as GiftStatus)
                    : null,
            }),
        [setGiftOptions, giftOptions],
    );

    const handleSortSelect = useCallback(
        (eventKey: string | null): void => {
            if (eventKey !== null) {
                const eventArr = eventKey.split('-');
                const sort = eventArr[0] === 'name' ? 'name' : 'price';
                const dir = eventArr[1] === 'asc' ? 'asc' : 'desc';
                setGiftOptions({
                    ...giftOptions,
                    sort,
                    dir,
                });
            }
        },
        [setGiftOptions, giftOptions],
    );

    const handleFilterChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            setGiftOptions({
                ...giftOptions,
                filter: e.target.value,
            });
        },
        [setGiftOptions, giftOptions],
    );

    const resetGiftOptions = useCallback(
        (): void => setGiftOptions(DEFAULT_GIFT_OPTIONS),
        [setGiftOptions],
    );

    const getGroupForUpdate = useCallback(
        (): GroupUpdate => mapToGroupUpdate(userGroup),
        [userGroup],
    );

    const handleModalClose = useCallback(async (): Promise<void> => {
        setUpdateGroupOpen(false);
        const result = await getFullGroup(groupId, user?.uid);
        if (result !== null) {
            const userDetails = await getUserDetailItemsFromList(
                result.participants.map(p => p.userId),
            );
            setUserGroup(
                new ViewGroup({
                    ...result,
                }),
            );
            if (userDetails !== null) {
                setGroupParticipants(userDetails);
            }
            setGroupLoaded((g: defaultLoadedType) => ({ ...g, loaded: true }));
        } else {
            setGroupLoaded((g: defaultLoadedType) => ({
                ...g,
                loaded: true,
                error: 'There was an error loading the group',
            }));
        }
    }, [
        setUserGroup,
        setGroupParticipants,
        setGroupLoaded,
        groupId,
        user,
        setUpdateGroupOpen,
    ]);

    const refreshGroup = useCallback(async (): Promise<void> => {
        setGroupLoaded(DEFAULT_LOAD_STATE);
        const result = await getFullGroup(groupId, user?.uid);
        if (result !== null) {
            const userDetails = await getUserDetailItemsFromList(
                result.participants.map(p => p.userId),
            );
            setUserGroup(
                new ViewGroup({
                    ...result,
                }),
            );
            if (userDetails !== null) {
                setGroupParticipants(userDetails);
            }
            setGroupLoaded((g: defaultLoadedType) => ({ ...g, loaded: true }));
        } else {
            setGroupLoaded((g: defaultLoadedType) => ({
                ...g,
                loaded: true,
                error: 'There was an error loading the group',
            }));
        }
    }, [setUserGroup, setGroupParticipants, setGroupLoaded, groupId, user]);

    const updateGiftItem = useCallback(
        async (giftId: string, status: GiftStatus): Promise<void> => {
            if (user !== null) {
                try {
                    let statusText: string;
                    if (status === GiftStatus.Available) statusText = '';
                    else statusText = user.uid;
                    await updateGiftStatus(groupId, giftId, status, statusText);
                    const gifts = userGroup.gifts.map(
                        (g: Gift): Gift =>
                            g.id === giftId ? { ...g, status } : { ...g },
                    );
                    setUserGroup((group: ViewGroup) => ({
                        ...group,
                        gifts: [...gifts],
                    }));
                } catch (error) {
                    console.log(error);
                }
            }
        },
        [userGroup, setUserGroup, groupId, user],
    );

    const handleViewUserGifts = useCallback(
        (id: string): void => {
            if (giftOptions.user === id) {
                setGiftOptions(state => ({ ...state, user: null }));
            } else {
                setGiftOptions(state => ({ ...state, user: id }));
            }
        },
        [giftOptions.user, setGiftOptions],
    );
    //#endregion

    const owner = groupParticipants.find(p => p.id === userGroup.ownerId);
    const ownerName = owner
        ? owner.displayName && owner.displayName !== ''
            ? owner.displayName
            : owner.email
        : null;

    //#region render header
    const renderHeader = useCallback(
        (): React.ReactNode => (
            <>
                <h1 className="display-4">{userGroup.name}</h1>
                <p className="lead">{userGroup.description}</p>
                <p>{ownerName && `${ownerName}'s group`}</p>
                {groupLoaded.loaded ? (
                    userGroup.ownerId &&
                    user !== null &&
                    userGroup.ownerId === user.uid ? (
                        <Button
                            variant="primary"
                            onClick={() => setUpdateGroupOpen(true)}
                        >
                            Manage Group
                        </Button>
                    ) : (
                        <Button variant="danger" onClick={handleLeaveGroup}>
                            Leave Group
                        </Button>
                    )
                ) : null}
            </>
        ),
        [userGroup, ownerName, handleLeaveGroup, user, groupLoaded],
    );
    //#endregion

    const alertText = groupLoaded.error || leaveLoading.error;
    const participantNames: { [id: string]: string } = {};
    groupParticipants.forEach(({ id, displayName, email }: UserDetail) => {
        participantNames[id] = displayName || email;
    });

    return (
        <BasicPage
            showAlert={!!alertText}
            onAlertClose={clearAlert}
            alertText={alertText || ''}
            renderHeader={renderHeader()}
        >
            <AccordionDropdown
                openText="Hide Members"
                closedText="View Members"
            >
                {groupParticipants && groupParticipants.length > 0 ? (
                    <Container>
                        <Row xs={1} lg={3}>
                            {sortByProperty(
                                groupParticipants,
                                groupParticipants.every(
                                    u => u.displayName !== undefined,
                                )
                                    ? 'displayName'
                                    : 'email',
                            ).map(
                                ({
                                    id,
                                    email,
                                    displayName,
                                    photoURL,
                                }): React.ReactNode => (
                                    <Col key={id} className="w-25">
                                        <Card className="text-center">
                                            <Card.Img
                                                variant="top"
                                                src={
                                                    photoURL || defaultPhotoURL
                                                }
                                                className="img-thumbnail"
                                                alt={email}
                                            />
                                            <Card.Body>
                                                <Card.Title>
                                                    {displayName}
                                                </Card.Title>
                                                <Card.Text>{email}</Card.Text>
                                                <Button
                                                    variant="primary"
                                                    onClick={() =>
                                                        handleViewUserGifts(id)
                                                    }
                                                >
                                                    View Gifts
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ),
                            )}
                        </Row>
                    </Container>
                ) : (
                    <h1 className="display-5 text-center">
                        This group doesn't have any members yet. Invite some to
                        get the party started!
                    </h1>
                )}
            </AccordionDropdown>
            <ButtonToolbar
                aria-label="Gift options"
                className="justify-content-center mt-2"
            >
                <ButtonGroup
                    aria-label="My Wish List"
                    className="mb-2 mr-lg-auto"
                >
                    <Button
                        variant="primary"
                        onClick={() => push(`/groups/${groupId}/gifts`)}
                    >
                        My wish list
                    </Button>
                    <DropdownButton
                        variant="primary"
                        title="Sort"
                        id="sort-dropdown"
                        as={ButtonGroup}
                    >
                        <Dropdown.Item
                            active={giftOptions.sort === 'name'}
                            eventKey={
                                giftOptions.dir === 'asc'
                                    ? 'name-desc'
                                    : 'name-asc'
                            }
                            onSelect={handleSortSelect}
                        >
                            Name{' '}
                            {giftOptions.dir === 'asc' ? (
                                <BsCaretDownFill />
                            ) : (
                                <BsCaretUpFill />
                            )}
                        </Dropdown.Item>
                        <Dropdown.Item
                            active={giftOptions.sort === 'price'}
                            eventKey={
                                giftOptions.dir === 'asc'
                                    ? 'price-desc'
                                    : 'price-asc'
                            }
                            onSelect={handleSortSelect}
                        >
                            Price{' '}
                            {giftOptions.dir === 'asc' ? (
                                <BsCaretDownFill />
                            ) : (
                                <BsCaretUpFill />
                            )}
                        </Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton
                        variant="primary"
                        title="Status"
                        id="sort-dropdown"
                        as={ButtonGroup}
                    >
                        <Dropdown.Item
                            active={giftOptions.status === null}
                            eventKey={''}
                            onSelect={handleStatusSelect}
                        >
                            Any
                        </Dropdown.Item>
                        <Dropdown.Item
                            active={giftOptions.status === GiftStatus.Available}
                            eventKey={GiftStatus.Available}
                            onSelect={handleStatusSelect}
                        >
                            Available
                        </Dropdown.Item>
                        <Dropdown.Item
                            active={giftOptions.status === GiftStatus.Claimed}
                            eventKey={GiftStatus.Claimed}
                            onSelect={handleStatusSelect}
                        >
                            Claimed
                        </Dropdown.Item>
                        <Dropdown.Item
                            active={giftOptions.status === GiftStatus.Purchased}
                            eventKey={GiftStatus.Purchased}
                            onSelect={handleStatusSelect}
                        >
                            Purchased
                        </Dropdown.Item>
                    </DropdownButton>
                    <Button onClick={refreshGroup} className="primary">
                        <BsArrowRepeat />
                    </Button>
                    <OverlayTrigger
                        trigger="click"
                        placement="auto"
                        overlay={HelpPopover}
                    >
                        <Button variant="primary">
                            <BsInfoCircleFill />
                        </Button>
                    </OverlayTrigger>
                </ButtonGroup>
                <InputGroup className="mb-2">
                    <FormControl
                        placeholder="Search"
                        aria-label="search-gifts"
                        onChange={handleFilterChange}
                        value={giftOptions.filter}
                    />
                    <InputGroup.Append>
                        <Button variant="primary" onClick={resetGiftOptions}>
                            Reset
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </ButtonToolbar>
            {groupLoaded.loaded ? (
                userGroup.gifts && userGroup.gifts.length > 0 ? (
                    <Row xs={1} lg={3}>
                        {handleGiftOptions()
                            .filter(({ userId }: Gift) => userId !== user?.uid)
                            .map(
                                ({
                                    id,
                                    name,
                                    price,
                                    status,
                                    userId,
                                    webUrl,
                                    note,
                                    statusText,
                                }: Gift) => {
                                    const thisDisplayName =
                                        participantNames[userId];

                                    const actions = [
                                        {
                                            name: GiftStatus.Available,
                                            onClick: () =>
                                                updateGiftItem(
                                                    id,
                                                    GiftStatus.Available,
                                                ),
                                            disabled:
                                                GiftStatus.Available === status,
                                            variant: 'success',
                                        },
                                        {
                                            name: GiftStatus.Claimed,
                                            onClick: () =>
                                                updateGiftItem(
                                                    id,
                                                    GiftStatus.Claimed,
                                                ),
                                            disabled:
                                                GiftStatus.Claimed === status,
                                            variant: 'info',
                                        },
                                        {
                                            name: GiftStatus.Purchased,
                                            onClick: () =>
                                                updateGiftItem(
                                                    id,
                                                    GiftStatus.Purchased,
                                                ),
                                            disabled:
                                                GiftStatus.Purchased === status,
                                            variant: 'secondary',
                                        },
                                    ];
                                    return (
                                        <Col key={id} className="mb-4">
                                            <GiftCard
                                                id={id}
                                                userDisplayName={
                                                    thisDisplayName
                                                }
                                                name={name}
                                                webUrl={webUrl}
                                                price={price}
                                                note={note}
                                                status={
                                                    userId === user?.uid
                                                        ? undefined
                                                        : status
                                                }
                                                actions={actions}
                                                bg="light"
                                                statusText={
                                                    userId === user?.uid ||
                                                    !statusText
                                                        ? undefined
                                                        : `${status} by ${participantNames[statusText]}`
                                                }
                                            />
                                        </Col>
                                    );
                                },
                            )}
                    </Row>
                ) : (
                    <h1 className="display-5 text-center">
                        This group has no gifts yet. Have everyone update their
                        wish lists!
                    </h1>
                )
            ) : (
                <PageSpinner />
            )}
            <UpdateGroupModal
                open={updateGroupOpen}
                onClose={handleModalClose}
                groupId={groupId}
                groupData={getGroupForUpdate()}
            />
        </BasicPage>
    );
};

export default Group;
