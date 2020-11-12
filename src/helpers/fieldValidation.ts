export const validateEmail = (email: string): boolean =>
    email !== null && email !== '' && /(.+)@(.+){2,}\.(.+){2,}/.test(email);

export const validatePassword = (password: string): boolean =>
    password !== null && password !== '' && password.length > 5;

export const validatePasswordConfirmation = (
    password: string,
    comparison: string,
): boolean => password !== null && password !== '' && password === comparison;
