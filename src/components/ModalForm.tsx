import React, { FunctionComponent, SyntheticEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import SpinnerButton from './SpinnerButton';

//#region interfaces
export type TextInputType = {
    label: string;
    type: string;
    name: string;
    value: string;
    error: string | null;
    initialValue?: string;
    placeholder?: string;
    helpText?: string;
};

export type SelectOptionType = {
    value: string;
    name: string;
};

export type SelectInputType = {
    label: string;
    name: string;
    multiple?: boolean;
    placeholder?: string;
    disabled?: boolean;
    helpText?: string;
    value: Array<string>;
    options: Array<SelectOptionType>;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onClear?: () => void;
};

export type ActionButtonType = {
    name: string;
    variant: string;
    onClick: () => void;
};

export type LoadingActionButtonType = {
    variant: string;
    type: string;
    actionLoading: boolean;
    actionLoadingText: string;
    actionStaticText: string;
    onClick: () => void | Promise<void>;
};

type dirtyFormValues = {
    [key: string]: boolean;
};

interface IModalForm {
    title: string;
    loading: boolean;
    show: boolean;
    submitText: string;
    submitProcessingText: string;
    modalProps?: React.ComponentProps<typeof Modal>;
    textInputs: Array<TextInputType>;
    selectInputs?: Array<SelectInputType>;
    additionalActions?: Array<ActionButtonType | LoadingActionButtonType>;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: SyntheticEvent) => Promise<void>;
    formDirty: dirtyFormValues;
    alertText?: string;
    onAlertClose?: () => void;
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
    selectInputs,
    additionalActions,
    onChange,
    onClose,
    onSubmit,
    formDirty,
    alertText,
    onAlertClose,
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
                {alertText && (
                    <Alert variant="danger" onClose={onAlertClose} dismissible>
                        <Alert.Heading>Error</Alert.Heading>
                        <hr />
                        <p>{alertText}</p>
                    </Alert>
                )}
                <Form noValidate>
                    {textInputs.map(
                        ({
                            label,
                            type,
                            name,
                            value,
                            error,
                            initialValue = '',
                            placeholder = label,
                            helpText = undefined,
                        }: TextInputType) => (
                            <Form.Group controlId={name} key={name}>
                                <Form.Label>{label}</Form.Label>
                                <Form.Control
                                    type={type}
                                    name={name}
                                    value={
                                        formDirty[name] ? value : initialValue
                                    }
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
                    {selectInputs &&
                        selectInputs.map(
                            ({
                                label,
                                name,
                                multiple,
                                placeholder,
                                disabled,
                                helpText,
                                value,
                                options,
                                onChange,
                                onClear,
                            }: SelectInputType): React.ReactNode => (
                                <Form.Group controlId={name} key={name}>
                                    <Form.Label>{label}</Form.Label>
                                    {onClear && (
                                        <Button
                                            variant="link"
                                            onClick={onClear}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Form.Control
                                        name={name}
                                        as="select"
                                        multiple={multiple}
                                        placeholder={placeholder}
                                        disabled={disabled}
                                        value={value}
                                        onChange={onChange}
                                    >
                                        {options &&
                                            options.map(
                                                ({
                                                    value,
                                                    name,
                                                }: SelectOptionType) => (
                                                    <option
                                                        value={value}
                                                        key={value}
                                                    >
                                                        {name}
                                                    </option>
                                                ),
                                            )}
                                    </Form.Control>
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
                {additionalActions &&
                    additionalActions.map(
                        (
                            action: ActionButtonType | LoadingActionButtonType,
                        ) => {
                            if ('actionLoading' in action) {
                                const {
                                    variant,
                                    type,
                                    actionLoading,
                                    actionLoadingText,
                                    actionStaticText,
                                    onClick,
                                } = action;
                                return (
                                    <SpinnerButton
                                        key={`${actionStaticText}SpinnerButton`}
                                        loading={actionLoading}
                                        loadingText={actionLoadingText}
                                        staticText={actionStaticText}
                                        buttonProps={{
                                            type: type,
                                            disabled: actionLoading,
                                            onClick: onClick,
                                            variant: variant,
                                        }}
                                    />
                                );
                            } else {
                                const { name, variant, onClick } = action;
                                return (
                                    <Button onClick={onClick} variant={variant}>
                                        {name}
                                    </Button>
                                );
                            }
                        },
                    )}
                <Button onClick={onClose} variant="danger">
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
