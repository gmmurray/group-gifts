import React, { FunctionComponent, SyntheticEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import SpinnerButton from './SpinnerButton';

//#region interfaces
type TextInputType = {
    label: string;
    type: string;
    name: string;
    value: string;
    error: string | null;
    placeholder?: string;
    helpText?: string;
};

interface IModalForm {
    title: string;
    loading: boolean;
    show: boolean;
    submitText: string;
    submitProcessingText: string;
    modalProps?: React.ComponentProps<typeof Modal>;
    textInputs: Array<TextInputType>;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: SyntheticEvent) => Promise<void>;
}
//#endregion

const ModalForm: FunctionComponent<IModalForm> = ({
    title,
    loading,
    show,
    submitText,
    submitProcessingText,
    modalProps,
    textInputs,
    onChange,
    onClose,
    onSubmit,
}) => {
    const resolvedModalProps = modalProps || {
        size: 'lg',
        centered: true,
    };

    //#region render
    return (
        <Modal
            show={show}
            onHide={onClose}
            aria-labelledby="modal-title"
            {...resolvedModalProps}
        >
            <Modal.Header closeButton>
                <Modal.Title id="modal-title">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    {textInputs.map(
                        ({
                            label,
                            type,
                            name,
                            value,
                            error,
                            placeholder = label,
                            helpText = undefined,
                        }: TextInputType) => (
                            <Form.Group controlId={name} key={name}>
                                <Form.Label>{label}</Form.Label>
                                <Form.Control
                                    type={type}
                                    name={name}
                                    value={value}
                                    onChange={onChange}
                                    isInvalid={!!error}
                                    placeholder={placeholder}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {error}
                                </Form.Control.Feedback>
                                {helpText && (
                                    <Form.Text id={`${name}HelpText`} muted>
                                        {helpText}
                                    </Form.Text>
                                )}
                            </Form.Group>
                        ),
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} variant="secondary">
                    Cancel
                </Button>
                <SpinnerButton
                    loading={loading}
                    loadingText={submitProcessingText}
                    staticText={submitText}
                    buttonProps={{
                        type: 'submit',
                        disabled: loading,
                        onClick: onSubmit,
                        variant: 'success',
                    }}
                />
            </Modal.Footer>
        </Modal>
    );
    //#endregion
};

export default ModalForm;
