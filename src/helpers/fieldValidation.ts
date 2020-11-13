export const validateEmail = (email: string | null): boolean =>
    isNotNullOrEmpty(email) && /(.+)@(.+){2,}\.(.+){2,}/.test(email!);

export const validatePassword = (password: string | null): boolean =>
    isNotNullOrEmpty(password) && password!.length > 5;

export const validatePasswordConfirmation = (
    password: string | null,
    comparison: string | null,
): boolean => isNotNullOrEmpty(password) && password === comparison;

export const validateDisplayName = (
    input: string | null,
    currentDisplayName: string | null,
): boolean =>
    isNotNullOrEmpty(currentDisplayName) ||
    (isNotNullOrEmpty(input) && input!.length <= 60);

export const validatePhotoURL = (input: string | null): boolean =>
    !isNotNullOrEmpty(input) || isValidURL(input!);

const isValidURL = (url: string): boolean =>
    url.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    ) !== null;

const isNotNullOrEmpty = (input: string | null): boolean =>
    input !== null && input !== '';
