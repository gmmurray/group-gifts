import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';

import GroupGiftLogo from '../../assets/images/group-gift-logo.png';
import './styles.scss';

export const Home = () => {
    //#region render
    return (
        <>
            <Container
                fluid
                className="position-relative overflow-hidden p-md-5 text-center bg-light"
            >
                <Col md={5} className="p-lg-5 mx-auto my-5">
                    <img src={GroupGiftLogo} alt="Group Gift Logo" />
                    <p className="lead font-weight-normal">
                        The best way to plan wish lists for any gift-buying
                        event
                    </p>
                </Col>
            </Container>
            <Container fluid className="pl-0 pr-0 py-2 py-lg-5">
                <Row noGutters className="w-100 text-center">
                    <Col
                        lg={4}
                        className="w-100 bg-primary border border-white  text-light home-column"
                    >
                        <Container className="my-3 py-3">
                            <h1 className="display-5">
                                Join an existing group
                            </h1>
                            <p className="lead">
                                Click below to view groups that have already
                                been created. The owner of each group will need
                                to invite you for you to be able to see their
                                group
                            </p>
                            <Button
                                variant="outline-light"
                                as={Link}
                                to="/join"
                            >
                                Join now
                            </Button>
                        </Container>
                    </Col>
                    <Col
                        lg={4}
                        className="w-100 bg-primary border border-white text-light home-column"
                    >
                        <Container className="my-3 py-3">
                            <h1 className="display-5">Create a new group</h1>
                            <p className="lead">
                                Click below to create a new group. You can
                                invite as many people to the group as you want.
                                The more the merrier!
                            </p>
                            <Button
                                variant="outline-light"
                                as={Link}
                                to="/create"
                            >
                                Create now
                            </Button>
                        </Container>
                    </Col>
                    <Col
                        lg={4}
                        className="w-100 bg-primary border border-white text-light home-column"
                    >
                        <Container className="my-3 py-3">
                            <h1 className="display-5">View your groups</h1>
                            <p className="lead">
                                Click below to view the groups that you have
                                already joined. You will be able to see what the
                                group is for, the people in the group, and
                                available gifts (except yours of course!).
                            </p>
                            <Button
                                variant="outline-light"
                                as={Link}
                                to="/groups"
                            >
                                View now
                            </Button>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </>
    );
    //#endregion
};
