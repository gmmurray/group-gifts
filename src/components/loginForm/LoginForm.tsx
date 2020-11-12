import React, { SyntheticEvent } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import loginCardImg from '../../assets/images/login-card-img.jpg';
import googleButton from '../../assets/images/btn_google_signin_light_normal_web.png';

import './styles.scss';

type FormInputSetup = {
    label: string;
    type: string;
    name: string;
    value: string;
    error: string | null;
};

interface IPropTypes {
    formTitle: string;
    loadingState: boolean;
    formInputs: Array<FormInputSetup>;
    formError: string | null;
    onSubmit: (e: SyntheticEvent) => Promise<void>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGoogleClick: () => Promise<void>;
    renderFooter: JSX.Element;
}

const LoginForm = ({
    formTitle,
    loadingState,
    formInputs,
    formError,
    onSubmit,
    onChange,
    onGoogleClick,
    renderFooter,
}: IPropTypes) => {
    return (
        <div className="login-form-container">
            <Card bg="light">
                <Card.Img variant="top" src={loginCardImg} />
                <Card.Body>
                    <Card.Title className="text-center">
                        <h1 className="display-4">Group Gift</h1>
                    </Card.Title>
                    <Card.Title className="text-center">{formTitle}</Card.Title>
                    <Form noValidate>
                        {formInputs.map(
                            ({ label, type, name, value, error }) => (
                                <Form.Group controlId={name} key={name}>
                                    <Form.Label>{label}</Form.Label>
                                    <Form.Control
                                        type={type}
                                        name={name}
                                        value={value}
                                        onChange={onChange}
                                        isInvalid={!!error}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {error}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            ),
                        )}
                        <Button
                            type="submit"
                            disabled={loadingState}
                            onClick={onSubmit}
                            block
                            variant="success"
                        >
                            {loadingState ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />{' '}
                                    Loading...
                                </>
                            ) : (
                                formTitle
                            )}
                        </Button>
                        <Form.Text className="text-danger">
                            {formError}
                        </Form.Text>
                    </Form>
                    <Button
                        type="button"
                        onClick={onGoogleClick}
                        variant="link"
                        block
                    >
                        <img src={googleButton} alt="Sign in with Google" />
                    </Button>
                </Card.Body>
                <Card.Footer className="text-center">
                    {renderFooter}
                </Card.Footer>
            </Card>
        </div>
    );
};

export default LoginForm;
