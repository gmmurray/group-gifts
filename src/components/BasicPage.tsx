import React, { FunctionComponent } from 'react';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Alert from 'react-bootstrap/Alert';

//#region interfaces
interface IBasicPage {
    showAlert: boolean;
    onAlertClose: () => void;
    alertText: string;
    renderHeader: React.ReactNode;
    children: React.ReactNode;
}
//#endregion

const BasicPage: FunctionComponent<IBasicPage> = ({
    showAlert,
    onAlertClose,
    alertText,
    renderHeader,
    children,
}: IBasicPage) => {
    //#region render
    return (
        <Container fluid className="px-0 mb-3">
            <Jumbotron fluid>
                <Container>{renderHeader}</Container>
            </Jumbotron>
            <Container>
                {showAlert && (
                    <Alert variant="danger" onClose={onAlertClose} dismissible>
                        <Alert.Heading>Error</Alert.Heading>
                        <hr />
                        <p>{alertText}</p>
                    </Alert>
                )}
                {children}
            </Container>
        </Container>
    );
    //#endregion
};

export default BasicPage;
