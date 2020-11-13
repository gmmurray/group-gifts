import React, { FunctionComponent, useCallback, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { useAuthentication } from '../../context/authentication';
import ProfileModal from './ProfileModal';

interface IAuthLayoutProps {}

const AuthLayout: FunctionComponent<IAuthLayoutProps> = ({ children }) => {
    const { push, location } = useHistory();
    const { user, doLogout } = useAuthentication();
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        await doLogout();
        push('/login');
    }, [doLogout, push]);

    return (
        <>
            <Navbar expand="lg" variant="dark" bg="dark">
                <Container>
                    <Navbar.Brand as={NavLink} to="/">
                        Group Gift
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="auth-navbar" />
                    <Navbar.Collapse id="auth-navbar">
                        <Nav className="mr-auto">
                            <Nav.Link as={NavLink} to="/" exact>
                                Home
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/join">
                                Join
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/create">
                                Create
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/groups">
                                My groups
                            </Nav.Link>
                        </Nav>
                        {user && (
                            <span className="text-secondary">
                                Hi {user.displayName || user.email}!
                            </span>
                        )}
                        <Nav>
                            <Nav.Link onClick={() => setProfileModalOpen(true)}>
                                Update Profile
                            </Nav.Link>
                            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>{children}</Container>
            <Navbar expand={false} fixed="bottom" variant="dark" bg="dark">
                <Container>
                    <Row className="w-100 text-center">
                        <Col lg={4}></Col>
                        <Col lg={4}>
                            <p className="text-light">
                                Built by{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://gregmurray.org"
                                >
                                    Greg Murray
                                </a>
                            </p>
                        </Col>
                        <Col lg={4}></Col>
                    </Row>
                </Container>
            </Navbar>
            <ProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </>
    );
};

export default AuthLayout;
