import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import ModalForm, {
    LoadingActionButtonType,
    TextInputType,
} from '../../components/ModalForm';
import { useAuthentication } from '../../context/authentication';
import {
    addGiftToGroup,
    deleteGiftFromGroup,
    getUserGift,
    updateFullGift,
} from '../../database/repositories/giftRepository';
import {
    isValidURL,
    validateRequiredField,
    validateEmptyStringField,
} from '../../helpers/fieldValidation';
import { GiftUpateOrCreate } from '../../models/gift';
import {
    DEFAULT_LOADING_STATE,
    DEFAULT_LOAD_STATE,
} from '../../shared/defaultTypes';

//#region types
type giftFormType = {
    values: GiftUpateOrCreate;
    errors: {
        name: string | null;
        price: string | null;
        webUrl: string | null;
        note: string | null;
        form: string | null;
    };
    dirty: {
        name: boolean;
        price: boolean;
        webUrl: boolean;
        note: boolean;
    };
};

type CreateUpdateGiftModalType = {
    open: boolean;
    type: string | null;
    giftId: string | null;
    onClose: () => void;
    groupId: string;
};
//#endregion

//#region initial values
const INITIAL_FORM: giftFormType = {
    values: {
        name: '',
        webUrl: '',
        price: '',
        note: '',
    },
    errors: {
        name: null,
        webUrl: null,
        price: null,
        note: null,
        form: null,
    },
    dirty: {
        name: false,
        price: false,
        webUrl: false,
        note: false,
    },
};
//#endregion

const CreateUpdateGiftModal: FunctionComponent<CreateUpdateGiftModalType> = ({
    open,
    type,
    giftId,
    onClose,
    groupId,
}) => {
    //#region context
    const { user } = useAuthentication();
    //#endregion

    //#region state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [giftForm, setGiftForm] = useState(INITIAL_FORM);
    const [deleteLoading, setDeleteLoading] = useState(DEFAULT_LOADING_STATE);
    const [currentGift, setCurrentGift] = useState(
        new GiftUpateOrCreate(undefined),
    );
    const [currentGiftLoaded, setCurrentGiftLoaded] = useState(
        DEFAULT_LOAD_STATE,
    );
    //#endregion

    const isUpdating = type === 'update' && giftId !== null;

    //#region effects
    useEffect((): void => {
        const getGiftData = async (): Promise<void> => {
            try {
                const result = await getUserGift(groupId, giftId!);
                if (result !== null) {
                    setCurrentGift(new GiftUpateOrCreate(result));
                    setGiftForm(state => ({
                        ...state,
                        values: { ...state.values, ...result },
                    }));
                    setCurrentGiftLoaded(state => ({ ...state, loaded: true }));
                }
            } catch (error) {
                setCurrentGiftLoaded(state => ({
                    ...state,
                    loaded: true,
                    error,
                }));
            }
        };
        if (open && isUpdating) getGiftData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect((): void => {
        const resetState = () => {
            setIsSubmitting(false);
            setGiftForm(INITIAL_FORM);
            setDeleteLoading(DEFAULT_LOADING_STATE);
            setCurrentGift(new GiftUpateOrCreate(undefined));
        };
        if (!open) {
            resetState();
        }
    }, [open, setGiftForm, setCurrentGift]);
    //#endregion

    //#region callbacks
    const handleDeleteGift = useCallback(async (): Promise<void> => {
        if (user !== null && giftId !== null) {
            setDeleteLoading(state => ({ ...state, loading: true }));

            try {
                // eslint-disable-next-line no-restricted-globals
                if (confirm('Are you sure you want to delete this gift?')) {
                    await deleteGiftFromGroup(groupId, giftId);
                    setDeleteLoading(state => ({
                        ...state,
                        loading: false,
                    }));

                    onClose();
                    return;
                }
            } catch (error) {
                console.log(error);
                setDeleteLoading(state => ({
                    ...state,
                    loading: false,
                    error: 'There was an error deleting the gift',
                }));
            }
        }
    }, [setDeleteLoading, onClose, groupId, giftId, user]);

    const doValidation = useCallback(() => {
        const name = validateRequiredField(giftForm.values.name)
            ? null
            : 'Please enter a gift name';
        const webUrl =
            validateEmptyStringField(giftForm.values.webUrl) ||
            isValidURL(giftForm.values.webUrl)
                ? null
                : 'Please enter a valid URL';
        const note = validateRequiredField(giftForm.values.note)
            ? null
            : 'Please enter a note, description, or additional info';
        const price = validateRequiredField(giftForm.values.price)
            ? null
            : 'Please enter the price of the gift';
        setGiftForm(state => ({
            ...state,
            errors: { ...state.errors, name, webUrl, note, price },
        }));
        return (
            name !== null || webUrl !== null || note !== null || price !== null
        );
    }, [setGiftForm, giftForm.values]);

    const onSubmit = useCallback(
        async (e: SyntheticEvent): Promise<void> => {
            e.preventDefault();
            if (doValidation()) return;

            if (user !== null) {
                try {
                    setIsSubmitting(true);
                    if (isUpdating) {
                        await updateFullGift(groupId, giftId!, giftForm.values);
                    } else {
                        await addGiftToGroup(groupId, user, giftForm.values);
                    }
                    onClose();
                } catch (error) {
                    console.log(error);
                    setIsSubmitting(false);
                    setGiftForm(state => ({
                        ...state,
                        errors: {
                            ...state.errors,
                            form: 'Error updating/adding gift information',
                        },
                    }));
                }
            }
        },
        [
            doValidation,
            setIsSubmitting,
            onClose,
            setGiftForm,
            user,
            giftForm.values,
            giftId,
            groupId,
            isUpdating,
        ],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setGiftForm({
                ...giftForm,
                values: { ...giftForm.values, [e.target.name]: e.target.value },
                dirty: {
                    ...giftForm.dirty,
                    [e.target.name]: true,
                },
            });
        },
        [setGiftForm, giftForm],
    );

    const clearAlert = useCallback((): void => {
        setDeleteLoading(state => ({
            ...state,
            error: DEFAULT_LOADING_STATE.error,
        }));
        setCurrentGiftLoaded(state => ({
            ...state,
            error: DEFAULT_LOAD_STATE.error,
        }));
        setGiftForm(state => ({
            ...state,
            errors: { ...state.errors, form: null },
        }));
    }, [setDeleteLoading, setCurrentGiftLoaded]);
    //#endregion

    //#region modal props
    const modalProps: {
        size: 'sm' | 'lg' | 'xl';
        centered: boolean;
    } = {
        size: 'lg',
        centered: true,
    };

    const textInputs: Array<TextInputType> = [
        {
            label: 'Name',
            type: 'text',
            name: 'name',
            value: giftForm.values.name,
            error: giftForm.errors.name,
            placeholder: 'Name',
            initialValue: currentGift.name ?? undefined,
        },
        {
            label: 'Price ($)',
            type: 'text',
            name: 'price',
            value: giftForm.values.price,
            error: giftForm.errors.price,
            placeholder: 'Price',
            initialValue: currentGift.price ?? undefined,
        },
        {
            label: 'Note',
            type: 'text',
            name: 'note',
            value: giftForm.values.note,
            error: giftForm.errors.note,
            placeholder: 'Note',
            initialValue: currentGift.note ?? undefined,
            helpText:
                'Provide some helpful information about the gift, perhaps like how badly you need it.',
        },
        {
            label: 'Web URL',
            type: 'text',
            name: 'webUrl',
            value: giftForm.values.webUrl,
            error: giftForm.errors.webUrl,
            placeholder: 'Web URL',
            initialValue: currentGift.webUrl ?? undefined,
            helpText:
                'It can be very useful to include a link especially if you are asking for a very specific item',
        },
    ];

    const additionalActions: Array<LoadingActionButtonType> = [
        {
            variant: 'warning',
            type: 'button',
            actionLoading: deleteLoading.loading,
            actionLoadingText: 'Deleting...',
            actionStaticText: 'Delete',
            onClick: handleDeleteGift,
        },
    ];
    //#endregion

    const alertText =
        currentGiftLoaded.error || giftForm.errors.form || deleteLoading.error;
    const modalTitle = isUpdating ? 'Update gift' : 'Add new gift';
    //#region render

    //#endregion
    return (
        <ModalForm
            title={modalTitle}
            loading={isSubmitting}
            show={open}
            submitText="Save"
            submitProcessingText="Saving..."
            modalProps={modalProps}
            textInputs={textInputs}
            additionalActions={isUpdating ? additionalActions : undefined}
            onClose={onClose}
            onChange={handleChange}
            onSubmit={onSubmit}
            formDirty={giftForm.dirty}
            alertText={alertText ?? undefined}
            onAlertClose={clearAlert}
        />
    );
};

export default CreateUpdateGiftModal;
