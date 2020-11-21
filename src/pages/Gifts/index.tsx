import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useAuthentication } from '../../context/authentication';
import { useWindowDimensions } from '../../context/windowDimensions';
import { getUserGifts } from '../../database/repositories/giftRepository';
import { checkGroupMembership } from '../../database/repositories/participantRepository';
import { Gift, UserGift } from '../../models/gift';
import { DEFAULT_LOAD_STATE } from '../../shared/defaultTypes';
import BasicPage from '../../components/BasicPage';
import GiftCard, { GiftCardAction } from '../../components/GiftCard';
import PageSpinner from '../../components/PageSpinner';
import CreateUpdateGiftModal from '../Groups/CreateUpdateGiftModal';

//#region types
type ModalStateType = {
    open: boolean;
    type: 'create' | 'update' | null;
    giftId: string | null;
};

type GiftsPropsType = {
    match: {
        params: {
            groupId: string;
        };
    };
};
//#endregion

//#region initial values and constants
const DEFAULT_MODAL_STATE: ModalStateType = {
    open: false,
    type: null,
    giftId: null,
};
//#endregion

const Gifts: FunctionComponent<GiftsPropsType> = ({
    match: {
        params: { groupId },
    },
}) => {
    //#region context
    const { user } = useAuthentication();
    const { push } = useHistory();
    const { recalcDimensions } = useWindowDimensions();
    //#endregion

    //#region state
    const [giftsLoaded, setGiftsLoaded] = useState(DEFAULT_LOAD_STATE);
    const [userGifts, setUserGifts] = useState(new Array<UserGift>());
    const [modalOpen, setModalOpen] = useState(DEFAULT_MODAL_STATE);
    const [giftFilter, setGiftFilter] = useState('');
    //#endregion

    const getGiftData = useCallback(async (): Promise<void> => {
        const result = await getUserGifts(groupId, user?.uid!);
        if (result !== null) {
            setGiftsLoaded({ ...giftsLoaded, loaded: true });
            if (result.length === 0) {
                setUserGifts(new Array<Gift>());
                return;
            }
            setUserGifts(result);
        } else {
            setGiftsLoaded({
                ...giftsLoaded,
                loaded: true,
                error: 'Error loading gifts',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //#region effects
    useEffect(() => {
        if (user !== null) {
            const hasAccess = checkGroupMembership(groupId, user.uid);
            if (hasAccess) {
                getGiftData();
            } else {
                push('/groups');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect((): void => {
        if (giftsLoaded.loaded) recalcDimensions();
    }, [giftsLoaded.loaded, recalcDimensions]);
    //#endregion

    //#region callbacks
    const handleGiftFilter = useCallback((): Array<UserGift> => {
        const searchProps = (gift: UserGift, filter: string) => {
            const lowerFilter = filter.toLocaleLowerCase();
            return (
                gift.name.toLocaleLowerCase().includes(lowerFilter) ||
                gift.note.toLocaleLowerCase().includes(lowerFilter)
            );
        };

        return userGifts.filter(gift => searchProps(gift, giftFilter));
    }, [giftFilter, userGifts]);

    const clearAlert = useCallback((): void => {
        setGiftsLoaded(state => ({
            ...state,
            error: DEFAULT_LOAD_STATE.error,
        }));
    }, [setGiftsLoaded]);

    const handleFilterChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void =>
            setGiftFilter(e.target.value),
        [setGiftFilter],
    );

    const resetGiftFilter = useCallback((): void => setGiftFilter(''), [
        setGiftFilter,
    ]);

    const handleModalClose = useCallback(async (): Promise<void> => {
        setModalOpen(state => ({
            ...state,
            open: false,
            type: null,
            giftId: null,
        }));
        await getGiftData();
    }, [setModalOpen, getGiftData]);
    //#endregion

    //#region render header
    const renderHeader = useCallback(
        (): React.ReactNode => (
            <>
                <h1 className="display-4">Wish List</h1>
                <p className="lead">
                    You probably won't get them all but you can definitely try!
                </p>
                <Button
                    variant="primary"
                    onClick={() =>
                        setModalOpen(state => ({
                            ...state,
                            open: true,
                            type: 'create',
                        }))
                    }
                >
                    Add a gift
                </Button>
            </>
        ),
        [setModalOpen],
    );
    //#endregion

    const alertText = giftsLoaded.error;

    return (
        <BasicPage
            showAlert={!!alertText}
            onAlertClose={clearAlert}
            alertText={alertText || ''}
            renderHeader={renderHeader()}
        >
            <ButtonToolbar
                aria-label="gift filter"
                className="justify-content-center mt-2"
            >
                <ButtonGroup
                    aria-label="return to group"
                    className="mb-2 mr-lg-auto"
                >
                    <Button
                        variant="primary"
                        onClick={() => push(`/groups/${groupId}`)}
                    >
                        Back to group
                    </Button>
                </ButtonGroup>
                <InputGroup className="mb-2">
                    <FormControl
                        placeholder="Search"
                        aria-label="Search gifts"
                        onChange={handleFilterChange}
                        value={giftFilter}
                    />
                    <InputGroup.Append>
                        <Button variant="primary" onClick={resetGiftFilter}>
                            Reset
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </ButtonToolbar>
            {giftsLoaded.loaded ? (
                userGifts && userGifts.length > 0 ? (
                    <Row xs={1} lg={3}>
                        {handleGiftFilter().map(
                            ({ id, name, price, webUrl, note }: UserGift) => {
                                const actions: Array<GiftCardAction> = [
                                    {
                                        name: 'Update',
                                        onClick: () =>
                                            setModalOpen(state => ({
                                                ...state,
                                                open: true,
                                                type: 'update',
                                                giftId: id,
                                            })),
                                        variant: 'primary',
                                    },
                                ];
                                return (
                                    <Col key={id} className="mb-4">
                                        <GiftCard
                                            id={id}
                                            name={name}
                                            webUrl={webUrl}
                                            price={price}
                                            note={note}
                                            actions={actions}
                                            bg="light"
                                        />
                                    </Col>
                                );
                            },
                        )}
                    </Row>
                ) : (
                    <h1 className="display-5 text-center">
                        You haven't added any gifts to your wish list yet.
                        Better work on that...
                    </h1>
                )
            ) : (
                <PageSpinner />
            )}
            <CreateUpdateGiftModal
                open={modalOpen.open}
                type={modalOpen.type}
                giftId={modalOpen.giftId}
                onClose={handleModalClose}
                groupId={groupId}
            />
        </BasicPage>
    );
};

export default Gifts;
