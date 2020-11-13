import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthentication } from './context/authentication';

import { authorizedRoutes } from './routes';
import Unauthorized from './pages/Unauthorized';
import AuthLayout from './components/layout/AuthLayout';

export const App = () => {
    const { isFetchingUser, isLogged, hasAccess } = useAuthentication();

    if (!isLogged && isFetchingUser) return <h1>Loading user...</h1>;
    if (isLogged && !hasAccess && !isFetchingUser) return <Unauthorized />;
    return isLogged ? <AuthenticatedApp /> : <UnauthenticatedApp />;
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
        </Switch>
    );
};
