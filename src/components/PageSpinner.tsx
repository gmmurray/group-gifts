import React, { FunctionComponent } from 'react';
import { StyleSheet, css } from 'aphrodite';
import Spinner from 'react-bootstrap/Spinner';

//#region styles
const styles = StyleSheet.create({
    pageSpinnerContainer: {
        display: 'flex',
        minHeight: '300px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    largerSpinner: {
        width: '5rem',
        height: '5rem',
    },
});
//#endregion

//#region interfaces
interface IPageSpinner {
    variant?: string;
}
//#endregion

const PageSpinner: FunctionComponent<IPageSpinner> = ({
    variant = 'secondary',
}) => {
    return (
        <div className={css(styles.pageSpinnerContainer)}>
            <Spinner
                className={css(styles.largerSpinner)}
                animation="border"
                variant={variant}
            />
        </div>
    );
};

export default PageSpinner;
