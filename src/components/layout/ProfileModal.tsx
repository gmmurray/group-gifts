import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';

import { useAuthentication } from '../../context/authentication';
import {
    validateDisplayName,
    validatePhotoURL,
} from '../../helpers/fieldValidation';
import ModalForm from '../ModalForm';

const INITIAL_PROFILE_FORM_VALUES: {
    displayName: string;
    photoURL: string;
} = {
    displayName: '',
    photoURL: '',
};

const INITIAL_PROFILE_FORM_ERRORS: {
    displayName: string | null;
    photoURL: string | null;
    form: string | null;
} = {
    displayName: null,
    photoURL: null,
    form: null,
};

const INITIAL_PROFILE_FORM_DIRTY: {
    displayName: boolean;
    photoURL: boolean;
} = {
    displayName: false,
    photoURL: false,
};

interface IProfileModal {
    open: boolean;
    onClose: () => void;
    user: firebase.User | null;
}

const ProfileModal: FunctionComponent<IProfileModal> = ({
    open,
    onClose,
    user,
}) => {
    const { doProfileUpdate } = useAuthentication();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileFormValues, setProfileFormValues] = useState(
        INITIAL_PROFILE_FORM_VALUES,
    );
    const [profileFormErrors, setProfileFormErrors] = useState(
        INITIAL_PROFILE_FORM_ERRORS,
    );
    const [formDirty, setFormDirty] = useState(INITIAL_PROFILE_FORM_DIRTY);

    useEffect((): void => {
        if (open) {
            setProfileFormValues({
                ...profileFormValues,
                displayName: user?.displayName ?? '',
                photoURL: user?.photoURL ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const resetState = useCallback((): void => {
        setIsSubmitting(false);
        setProfileFormValues(INITIAL_PROFILE_FORM_VALUES);
        setProfileFormErrors(INITIAL_PROFILE_FORM_ERRORS);
        setFormDirty(INITIAL_PROFILE_FORM_DIRTY);
    }, [setIsSubmitting, setProfileFormErrors, setProfileFormValues]);

    useEffect(() => {
        if (!open) resetState();
    }, [open, resetState]);

    const doValidation = useCallback((): boolean => {
        const displayName = validateDisplayName(profileFormValues.displayName)
            ? null
            : 'Please enter a display name';
        const photoURL = validatePhotoURL(profileFormValues.photoURL)
            ? null
            : 'Please enter a valid photo URL or no URL';
        setProfileFormErrors({
            ...profileFormErrors,
            displayName,
            photoURL,
        });
        return displayName !== null || photoURL !== null;
    }, [profileFormValues, profileFormErrors, setProfileFormErrors]);

    const onSubmit = useCallback(
        async (e: SyntheticEvent): Promise<void> => {
            e.preventDefault();
            if (doValidation()) return;

            try {
                setIsSubmitting(true);

                await doProfileUpdate({ ...profileFormValues });

                onClose();
            } catch (error) {
                setIsSubmitting(false);
                setProfileFormErrors({
                    ...INITIAL_PROFILE_FORM_ERRORS,
                    form: 'Error updating profile information',
                });
            }
        },
        [
            profileFormValues,
            doValidation,
            setIsSubmitting,
            doProfileUpdate,
            onClose,
        ],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            setProfileFormValues({
                ...profileFormValues,
                [e.target.name]: e.target.value,
            });
            setFormDirty({
                ...formDirty,
                [e.target.name]: true,
            });
        },
        [setProfileFormValues, profileFormValues, formDirty, setFormDirty],
    );

    const modalProps: {
        size: 'sm' | 'lg' | 'xl';
        centered: boolean;
    } = {
        size: 'lg',
        centered: true,
    };

    const textInputs = [
        {
            label: 'Display Name',
            type: 'text',
            name: 'displayName',
            value: profileFormValues.displayName,
            error: profileFormErrors.displayName,
            placeholder: 'Display name',
            initialValue: user?.displayName ?? undefined,
        },
        {
            label: 'Photo URL',
            type: 'text',
            name: 'photoURL',
            value: profileFormValues.photoURL,
            error: profileFormErrors.photoURL,
            placeholder: 'Photo URL',
            initialValue: user?.photoURL ?? undefined,
            helpText:
                'Copy and paste the full link to an image found somewhere on the internet',
        },
    ];

    return (
        <ModalForm
            title="Update your profile"
            loading={isSubmitting}
            show={open}
            submitText="Save"
            submitProcessingText="Saving..."
            modalProps={modalProps}
            textInputs={textInputs}
            onClose={onClose}
            onChange={handleChange}
            onSubmit={onSubmit}
            formDirty={formDirty}
        />
    );
};

export default ProfileModal;
