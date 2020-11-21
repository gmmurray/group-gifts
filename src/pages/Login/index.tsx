import React, { SyntheticEvent, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

import { useAuthentication } from '../../context/authentication';
import LoginForm from '../../components/loginForm/LoginForm';
import { validateEmail, validatePassword } from '../../helpers/fieldValidation';

const INITIAL_LOGIN_FORM_VALUES: {
    email: string;
    password: string;
    confirmPassword: string;
} = {
    email: '',
    password: '',
    confirmPassword: '',
};

const INITIAL_LOGIN_FORM_ERRORS: {
    email: string | null;
    password: string | null;
    form: string | null;
} = {
    email: null,
    password: null,
    form: null,
};

export const Login = () => {
    const { push } = useHistory();
    const { doLogin, doGoogleLogin } = useAuthentication();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginFormValues, setLoginFormValues] = useState(
        INITIAL_LOGIN_FORM_VALUES,
    );
    const [loginFormErrors, setLoginFormErrors] = useState(
        INITIAL_LOGIN_FORM_ERRORS,
    );

    const doValidation = (): boolean => {
        const email = validateEmail(loginFormValues.email)
            ? null
            : 'Please enter a valid email address';
        const password = validatePassword(loginFormValues.password)
            ? null
            : 'Please enter a valid password';
        setLoginFormErrors({
            ...loginFormErrors,
            email,
            password,
        });
        return email !== null || password !== null;
    };

    const onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (doValidation()) return;

        const { email, password } = loginFormValues;

        try {
            setIsSubmitting(true);

            await doLogin(email, password);

            push('/');
        } catch (e) {
            setIsSubmitting(false);
            setLoginFormErrors({
                ...INITIAL_LOGIN_FORM_ERRORS,
                form: 'Unable to verify your email or password',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginFormValues({
            ...loginFormValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleGoogleLogin = async () => {
        try {
            setIsSubmitting(true);
            await doGoogleLogin();
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
            value: loginFormValues.email,
            error: loginFormErrors.email,
        },
        {
            label: 'Password',
            type: 'password',
            name: 'password',
            value: loginFormValues.password,
            error: loginFormErrors.password,
        },
    ];

    return (
        <LoginForm
            formTitle="Login"
            loadingState={isSubmitting}
            formInputs={formInputs}
            formError={loginFormErrors.form}
            onSubmit={onSubmit}
            onChange={handleChange}
            onGoogleClick={handleGoogleLogin}
            renderFooter={
                <>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-success">
                        Register here
                    </Link>
                </>
            }
        />
    );
};
