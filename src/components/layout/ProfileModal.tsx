import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useAuthentication } from '../../context/authentication';
import {
    validateDisplayName,
    validatePhotoURL,
} from '../../helpers/fieldValidation';
import SpinnerButton from '../SpinnerButton';

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

interface IProfileModal {
    open: boolean;
    onClose: () => void;
}

const ProfileModal: FunctionComponent<IProfileModal> = ({ open, onClose }) => {
    const { user, doProfileUpdate } = useAuthentication();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileFormValues, setProfileFormValues] = useState(
        INITIAL_PROFILE_FORM_VALUES,
    );
    const [profileFormErrors, setProfileFormErrors] = useState(
        INITIAL_PROFILE_FORM_ERRORS,
    );

    const resetState = useCallback((): void => {
        setIsSubmitting(false);
        setProfileFormValues(INITIAL_PROFILE_FORM_VALUES);
        setProfileFormErrors(INITIAL_PROFILE_FORM_ERRORS);
    }, [setIsSubmitting, setProfileFormErrors, setProfileFormValues]);

    useEffect(() => resetState(), [open, resetState]);

    const doValidation = useCallback((): boolean => {
        const displayName = validateDisplayName(
            profileFormValues.displayName,
            user?.displayName ?? null,
        )
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
    }, [profileFormValues, profileFormErrors, setProfileFormErrors, user]);

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
        },
        [setProfileFormValues, profileFormValues],
    );

    return (
        <Modal
            show={open}
            onHide={onClose}
            size="lg"
            aria-labelledby="profile-modal-title"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="profile-modal-title">
                    Update your profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    <Form.Group controlId="displayName">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="displayName"
                            value={profileFormValues.displayName}
                            onChange={handleChange}
                            isInvalid={!!profileFormErrors.displayName}
                            placeholder={user?.displayName ?? 'Display name'}
                        />
                        <Form.Control.Feedback type="invalid">
                            {profileFormErrors.displayName}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="photoURL">
                        <Form.Label>Photo URL</Form.Label>
                        <Form.Control
                            type="text"
                            name="photoURL"
                            value={profileFormValues.photoURL}
                            onChange={handleChange}
                            isInvalid={!!profileFormErrors.photoURL}
                            placeholder={user?.photoURL ?? 'Photo URL'}
                            aria-describedby="photoHelpText"
                        />
                        <Form.Text id="photoHelpText" muted>
                            Copy and paste the full link to an image found
                            somewhere on the internet
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            {profileFormErrors.photoURL}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} variant="secondary">
                    Cancel
                </Button>
                <SpinnerButton
                    loading={isSubmitting}
                    staticText="Save"
                    loadingText="Saving..."
                    buttonProps={{
                        type: 'submit',
                        disabled: isSubmitting,
                        onClick: onSubmit,
                        variant: 'success',
                    }}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default ProfileModal;
