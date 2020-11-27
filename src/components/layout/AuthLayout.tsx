import React, { FunctionComponent, useCallback, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { useAuthentication } from '../../context/authentication';
import ProfileModal from './ProfileModal';
import { useWindowDimensions } from '../../context/windowDimensions';

import LogoOnly from '../../assets/images/group-gift-logo-only.png';

interface IAuthLayoutProps {}

const AuthLayout: FunctionComponent<IAuthLayoutProps> = ({ children }) => {
    const { push } = useHistory();
    const { user, doLogout, userPermission } = useAuthentication();
    const { windowDimensions } = useWindowDimensions();
    const { bodyHeight, documentHeight } = windowDimensions;
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        await doLogout();
        push('/login');
    }, [doLogout, push]);

    return (
        <Container fluid>
            <Navbar expand="lg" variant="dark" bg="dark-blue">
                <Container>
                    <Navbar.Brand as={NavLink} to="/">
                        <img
                            src={LogoOnly}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                            alt="Group Gift Logo"
                        />
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
                            <Nav.Link as={NavLink} to="/groups" exact>
                                My groups
                            </Nav.Link>
                            {userPermission.admin && (
                                <Nav.Link as={NavLink} to="/admin" exact>
                                    Admin
                                </Nav.Link>
                            )}
                        </Nav>
                        {user && (
                            <span className="text-white mr-1">
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
            <div>{children}</div>
            <Navbar
                expand={false}
                variant="dark"
                bg="dark-blue"
                fixed={bodyHeight <= documentHeight ? 'bottom' : undefined}
            >
                <Container>
                    <Row className="w-100 text-center">
                        <Col lg={4}></Col>
                        <Col lg={4}>
                            <p className="text-light">
                                Built by{' '}
                                <strong>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://gregmurray.org"
                                        className="text-white"
                                    >
                                        Greg Murray
                                    </a>
                                </strong>
                            </p>
                        </Col>
                        <Col lg={4}></Col>
                    </Row>
                </Container>
            </Navbar>
            <ProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                user={user}
            />
        </Container>
    );
};

export default AuthLayout;
