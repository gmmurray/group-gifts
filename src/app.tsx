import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthentication } from './context/authentication';

import { authorizedRoutes } from './routes';
import Unauthorized from './pages/Unauthorized';
import AuthLayout from './components/layout/AuthLayout';
import PageSpinner from './components/PageSpinner';

export const App = () => {
    const {
        isFetchingUser,
        isLogged,
        currentUserDetails,
    } = useAuthentication();
    if (isFetchingUser) return <PageSpinner />;
    else if (!isLogged) return <UnauthenticatedApp />;
    else
        return currentUserDetails && currentUserDetails.allow ? (
            <AuthenticatedApp />
        ) : (
            <Unauthorized />
        );
};

const AuthenticatedApp = () => {
    const { isLogged } = useAuthentication();

    if (!isLogged) return <Redirect to="/login" />;

    return (
        <AuthLayout>
            <Switch>
                {authorizedRoutes.map(
                    ({
                        path,
                        exact,
                        component: Component,
                    }: {
                        path: string;
                        exact: boolean;
                        component: Function;
                    }) => (
                        <Route
                            key={path}
                            path={path}
                            exact={exact}
                            render={props => <Component {...props} />}
                        />
                    ),
                )}
                <Route path="/login" exact render={() => <Redirect to="/" />} />
                <Route
                    path="/register"
                    exact
                    render={() => <Redirect to="/" />}
                />
                <Route path="*">Error 404 - Page not found!</Route>
            </Switch>
        </AuthLayout>
    );
};

const UnauthenticatedApp = () => {
    return (
        <Switch>
            <Route exact path={['/', '/login']}>
                <Login />
            </Route>
            <Route exact path="/register">
                <Register />
            </Route>
            <Route path="/">
                <Redirect to="/login" />
            </Route>
        </Switch>
    );
};
