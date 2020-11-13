import React, { FunctionComponent } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

interface ISpinnerButton {
    loading: boolean;
    loadingText?: string;
    staticText: string;
    buttonProps: React.ComponentProps<typeof Button>;
}

const SpinnerButton: FunctionComponent<ISpinnerButton> = ({
    loading,
    loadingText,
    staticText,
    buttonProps,
}) => (
    <Button {...buttonProps}>
        {loading ? (
            <>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />{' '}
                {loadingText || 'Loading...'}
            </>
        ) : (
            staticText
        )}
    </Button>
);

export default SpinnerButton;
