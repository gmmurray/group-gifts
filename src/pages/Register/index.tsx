import React, { SyntheticEvent, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import LoginForm from '../../components/loginForm/LoginForm';
import { useAuthentication } from '../../context/authentication';
import {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
} from '../../helpers/fieldValidation';

const INITIAL_REGISTER_FORM_VALUES: {
    email: string;
    password: string;
    confirmPassword: string;
} = {
    email: '',
    password: '',
    confirmPassword: '',
};

const INITIAL_REGISTER_FORM_ERRORS: {
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
    form: string | null;
} = {
    email: null,
    password: null,
    confirmPassword: null,
    form: null,
};

export const Register = () => {
    const { push } = useHistory();
    const { doRegister, doGoogleRegister } = useAuthentication();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerFormValues, setFormValues] = useState(
        INITIAL_REGISTER_FORM_VALUES,
    );
    const [registerFormErrors, setRegisterFormErrors] = useState(
        INITIAL_REGISTER_FORM_ERRORS,
    );

    const doValidation = (): boolean => {
        const email = validateEmail(registerFormValues.email)
            ? null
            : 'Please enter a valid email address';
        const password = validatePassword(registerFormValues.password)
            ? null
            : 'Please enter a valid password';
        const confirmPassword = validatePasswordConfirmation(
            registerFormValues.confirmPassword,
            registerFormValues.password,
        )
            ? null
            : 'Passwords do not match';
        setRegisterFormErrors({
            ...registerFormErrors,
            email,
            password,
            confirmPassword,
        });
        return email !== null || password !== null || confirmPassword !== null;
    };

    const onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (doValidation()) return;

        const { email, password } = registerFormValues;

        try {
            setIsSubmitting(true);

            await doRegister(email, password);

            push('/');
        } catch (e) {
            setIsSubmitting(false);
            setRegisterFormErrors({
                ...INITIAL_REGISTER_FORM_ERRORS,
                form: 'Error registering your account',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...registerFormValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleGoogleRegister = async () => {
        try {
            setIsSubmitting(true);
            await doGoogleRegister();
            push('/');
        } catch (err) {
            setIsSubmitting(false);
        }
    };

    const formInputs = [
        {
            label: 'Email address',
            type: 'email',
            name: 'email',
            value: registerFormValues.email,
            error: registerFormErrors.email,
        },
        {
            label: 'Password',
            type: 'password',
            name: 'password',
            value: registerFormValues.password,
            error: registerFormErrors.password,
        },
        {
            label: 'Confirm Password',
            type: 'password',
            name: 'confirmPassword',
            value: registerFormValues.confirmPassword,
            error: registerFormErrors.confirmPassword,
        },
    ];

    return (
        <LoginForm
            formTitle="Register"
            loadingState={isSubmitting}
            formInputs={formInputs}
            formError={registerFormErrors.form}
            onSubmit={onSubmit}
            onChange={handleChange}
            onGoogleClick={handleGoogleRegister}
            renderFooter={
                <>
                    Already have an account? <Link to="/login">Login here</Link>
                </>
            }
        />
    );
};
