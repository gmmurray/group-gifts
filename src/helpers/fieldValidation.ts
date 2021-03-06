export const validateEmail = (email: string | null): boolean =>
    isNotNullOrEmpty(email) && /(.+)@(.+){2,}\.(.+){2,}/.test(email!);

export const validatePassword = (password: string | null): boolean =>
    isNotNullOrEmpty(password) && password!.length > 5;

export const validatePasswordConfirmation = (
    password: string | null,
    comparison: string | null,
): boolean => isNotNullOrEmpty(password) && password === comparison;

export const validateDisplayName = (input: string | null): boolean =>
    isNotNullOrEmpty(input) && input!.length <= 60;

export const validatePhotoURL = (input: string | null): boolean =>
    !isNotNullOrEmpty(input) || isValidURL(input!);

export const validateGroupCode = (input: string | null): boolean =>
    isNotNullOrEmpty(input) && input!.length >= 4;

export const validateRequiredField = (input: string | null): boolean =>
    isNotNullOrEmpty(input);

export const validateEmptyStringField = (input: string): boolean =>
    input.length === 0 && input === '';

export const isValidURL = (url: string): boolean =>
    url.match(
        // eslint-disable-next-line no-useless-escape
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    ) !== null;

const isNotNullOrEmpty = (input: string | null): boolean =>
    input !== null && input !== '';
