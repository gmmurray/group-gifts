import React, { useEffect, useState } from 'react';
import { useAuthentication } from '../../context/authentication';
import {
    addGiftToGroup,
    deleteGiftFromGroup,
    getUserGifts,
} from '../../database/repositories/giftRepository';
import { Gift } from '../../models/gift';

interface IGiftsProps {
    match: {
        params: {
            groupId: string;
        };
    };
    history: {
        push: Function;
    };
    groupId: string;
}

const DEFAULT_LOAD_STATE: { loaded: boolean; error: string | null } = {
    loaded: false,
    error: null,
};

interface IDisplayType {
    create: boolean;
}

const DEFAULT_DISPLAY: IDisplayType = {
    create: false,
};

const DEFAULT_GIFT_FORM: {
    name: string;
    webUrl: string;
    price: string;
    note: string;
} = {
    name: '',
    webUrl: '',
    price: '',
    note: '',
};

const Gifts = ({
    match: {
        params: { groupId },
    },
    history: { push },
}: IGiftsProps) => {
    const { user } = useAuthentication();
    const [giftsLoaded, setGiftsLoaded] = useState(DEFAULT_LOAD_STATE);
    const [display, setDisplay] = useState(DEFAULT_DISPLAY);
    const [userGifts, setUserGifts] = useState(new Array<Partial<Gift>>());
    const [giftForm, setGiftForm] = useState(DEFAULT_GIFT_FORM);

    const getGroupData = async () => {
        const result = await getUserGifts(groupId, user?.uid!);
        if (result !== null) {
            setGiftsLoaded({ ...giftsLoaded, loaded: true });
            if (result.length === 0) {
                setUserGifts(new Array<Gift>());
                return;
            }
            const formattedResult = result.map(g => ({
                ...g,
                status: undefined,
            }));
            setUserGifts(formattedResult);
        } else {
            setGiftsLoaded({
                ...giftsLoaded,
                loaded: true,
                error: 'Error loading gifts',
            });
        }
    };

    useEffect(() => {
        getGroupData();
    }, []);

    useEffect(() => {
        if (!display?.create) {
            setGiftForm(DEFAULT_GIFT_FORM);
        }
    }, [display, setGiftForm]);

    const handleFormChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setGiftForm({
            ...giftForm,
            [e.target.name]: e.target.value,
        });
    };

    const createGift = async () => {
        if (user !== null) {
            const newGift = await addGiftToGroup(groupId, user, giftForm);
            if (newGift) {
                setDisplay({ ...DEFAULT_DISPLAY, create: false });
                await getGroupData();
                return;
            }
        }
        alert('Error creating gift');
    };

    const deleteGift = async (giftId: string) => {
        try {
            await deleteGiftFromGroup(groupId, giftId);
            await getGroupData();
        } catch (error) {
            console.log(error);
            alert('Error deleting gift');
        }
    };

    const toggleDisplay = (displayKey: keyof IDisplayType) => {
        setDisplay({ ...DEFAULT_DISPLAY, [displayKey]: !display[displayKey] });
    };

    if (!giftsLoaded?.loaded) {
        return (
            <div>
                <h1>Loading gifts...</h1>
            </div>
        );
    } else if (giftsLoaded.error !== null) {
        return (
            <div>
                <h1>{giftsLoaded.error}</h1>
            </div>
        );
    }

    return (
        <div>
            <>
                <button onClick={() => push('/')}>Home</button>
                <br />
                <button onClick={() => push(`/groups/${groupId}`)}>
                    Group
                </button>
                <br />
                <h1>Gifts</h1>
                <button onClick={() => toggleDisplay('create')}>
                    Add Gift
                </button>
                {display.create && (
                    <>
                        <hr />
                        <div>
                            <h4>New Gift</h4>
                            <div style={{ marginBottom: '2rem' }}>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={giftForm.name}
                                    onChange={handleFormChange}
                                    placeholder="Name"
                                    style={{ marginRight: '2rem ' }}
                                />
                                <input
                                    type="text"
                                    name="price"
                                    id="price"
                                    required
                                    value={giftForm.price}
                                    onChange={handleFormChange}
                                    placeholder="Price"
                                    style={{ marginRight: '2rem ' }}
                                />
                                <input
                                    type="text"
                                    name="webUrl"
                                    id="webUrl"
                                    value={giftForm.webUrl}
                                    onChange={handleFormChange}
                                    placeholder="Link"
                                    style={{ marginRight: '2rem ' }}
                                />
                                <textarea
                                    name="note"
                                    id="note"
                                    value={giftForm.note}
                                    onChange={handleFormChange}
                                    placeholder="Note"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <button onClick={createGift}>
                                    Create gift
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {userGifts.length === 0 && (
                    <div>
                        <h2>You haven't added any gifts yet.</h2>
                    </div>
                )}
                {userGifts.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                        }}
                    >
                        {userGifts.map(({ id, name, price, webUrl }) => {
                            if (id) {
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            border: '2px solid black',
                                            padding: '2rem',
                                        }}
                                    >
                                        <h3>{name}</h3>
                                        <h5>${price}</h5>
                                        <ul>
                                            <li>{webUrl}</li>
                                        </ul>
                                        <button onClick={() => deleteGift(id)}>
                                            Delete
                                        </button>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </>
        </div>
    );
};

export default Gifts;
