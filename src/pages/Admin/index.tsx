import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

import BasicPage from '../../components/BasicPage';
import PageSpinner from '../../components/PageSpinner';
import SpinnerButton from '../../components/SpinnerButton';
import { useAuthentication } from '../../context/authentication';
import {
    getPaginatedUserDetails,
    updateSingleUserDetail,
} from '../../database/repositories/userDetailRepository';
import { UserDetail } from '../../models/userDetail';
import {
    DEFAULT_LOADING_STATE,
    DEFAULT_LOAD_STATE,
    pageDirectionType,
    DEFAULT_PAGE_STATE,
} from '../../shared/defaultTypes';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import Button from 'react-bootstrap/esm/Button';

//#region constants
const ELEMENTS_PER_PAGE = 3;
//#endregion

//#region types
type AdminType = {};
//#endregion

const Admin: FunctionComponent<AdminType> = () => {
    //#region context
    const { user, getCurrentUserDetails } = useAuthentication();
    //#endregion

    //#region state
    const [userPermission, setUserPermission] = useState({
        allow: false,
        admin: false,
    });
    const [userPermissionLoaded, setUserPermissionLoaded] = useState(
        DEFAULT_LOAD_STATE,
    );
    const [users, setUsers] = useState(new Array<UserDetail>());
    const [usersLoading, setUsersLoading] = useState(DEFAULT_LOADING_STATE);
    const [pagingState, setPagingState] = useState(DEFAULT_PAGE_STATE);
    //#endregion

    //#region side effects
    useEffect((): void => {
        const getPermissionData = async () => {
            if (user !== null) {
                try {
                    const result = await getCurrentUserDetails(user.uid);
                    if (result !== null) {
                        setUserPermission(state => ({ ...state, ...result }));
                        setUserPermissionLoaded(state => ({
                            ...state,
                            loaded: true,
                        }));
                    }
                } catch (error) {
                    console.log(error);
                    setUserPermissionLoaded(state => ({
                        ...state,
                        loaded: false,
                        error: 'Error getting permissions',
                    }));
                }
            }
        };
        getPermissionData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    //#endregion

    //#region callbacks
    const handleGetUserData = useCallback(
        async (
            dir: pageDirectionType,
            reference: string | null,
        ): Promise<void> => {
            setUsersLoading(state => ({ ...state, loading: true }));
            try {
                getPaginatedUserDetails(
                    dir,
                    'email',
                    ELEMENTS_PER_PAGE,
                    reference,
                    (result: any) => {
                        if (result) {
                            let onLastPage: boolean;
                            if (result.length > 0) {
                                setUsers(result);
                                onLastPage = false;
                            } else onLastPage = true;

                            setPagingState(state => {
                                let page;
                                if (onLastPage) page = state.page;
                                else if (dir === 'next') page = state.page + 1;
                                else if (dir === 'prev') page = state.page - 1;
                                else page = 1;

                                return {
                                    ...state,
                                    page,
                                    first: result[0]?.email ?? null,
                                    last:
                                        result[result.length - 1]?.email ??
                                        null,
                                    prevRef: onLastPage ? state.first : null,
                                };
                            });
                            setUsersLoading(state => ({
                                ...state,
                                loading: false,
                            }));
                        }
                    },
                );
            } catch (error) {
                console.log(error);
                setUsersLoading(state => ({
                    ...state,
                    loading: false,
                    error: 'Error loading users',
                }));
            }
        },
        [],
    );

    const clearAlert = useCallback((): void => {
        setUsersLoading(DEFAULT_LOADING_STATE);
        setUserPermissionLoaded(DEFAULT_LOAD_STATE);
    }, []);
    //#endregion

    //#region render header
    const renderHeader = useCallback(
        (): React.ReactNode => (
            <>
                <h1 className="display-4">Admin</h1>
            </>
        ),
        [],
    );

    const updateDetail = useCallback(
        async (
            userId,
            { key, value }: { key: keyof UserDetail; value: any },
        ): Promise<void> => {
            try {
                updateSingleUserDetail(userId, { key, value }).then(() =>
                    handleGetUserData(null, null),
                );
            } catch (error) {
                console.log(error);
                setUsersLoading(state => ({
                    ...state,
                    loading: false,
                    error: 'Error updating user',
                }));
            }
        },
        [handleGetUserData],
    );
    //#endregion
    const alertText = userPermissionLoaded.error || usersLoading.error;
    const showUsers = user && users.length > 0;
    return (
        <BasicPage
            showAlert={!!alertText}
            onAlertClose={clearAlert}
            alertText={alertText || ''}
            renderHeader={renderHeader}
        >
            {userPermissionLoaded.loaded ? (
                userPermission.admin && userPermission.allow ? (
                    <>
                        <h1 className="display-5">Manage users</h1>
                        <ButtonGroup>
                            <SpinnerButton
                                loading={usersLoading.loading}
                                loadingText="Loading..."
                                staticText="Load users"
                                buttonProps={{
                                    type: 'button',
                                    disabled: usersLoading.loading,
                                    variant: 'primary',
                                    onClick: () =>
                                        handleGetUserData(null, null),
                                }}
                            />
                            <Button
                                disabled={
                                    usersLoading.loading ||
                                    pagingState.page <= 1
                                }
                                variant="primary"
                                onClick={() =>
                                    handleGetUserData(
                                        'prev',
                                        pagingState.first ||
                                            pagingState.prevRef,
                                    )
                                }
                            >
                                Prev Page
                            </Button>
                            <Button disabled={!showUsers}>
                                {pagingState.page}
                            </Button>
                            <Button
                                disabled={
                                    usersLoading.loading ||
                                    (users &&
                                        users.length > 0 &&
                                        users.length < ELEMENTS_PER_PAGE) ||
                                    pagingState.prevRef !== null ||
                                    pagingState.page === 0
                                }
                                variant="primary"
                                onClick={() =>
                                    handleGetUserData('next', pagingState.last)
                                }
                            >
                                Next Page
                            </Button>
                        </ButtonGroup>
                        {usersLoading.loading ? (
                            <PageSpinner />
                        ) : (
                            showUsers && (
                                <div>
                                    <Table
                                        striped
                                        bordered
                                        hover
                                        variant="dark"
                                        responsive
                                    >
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Email</th>
                                                <th>Name</th>
                                                <th>Allow</th>
                                                <th>Admin</th>
                                                <th>Photo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(
                                                ({
                                                    id,
                                                    email,
                                                    allow,
                                                    admin,
                                                    displayName,
                                                    photoURL,
                                                }) => {
                                                    const allowed =
                                                        allow === true;
                                                    const allowText = allowed
                                                        ? 'Remove'
                                                        : 'Add';
                                                    const adminUser =
                                                        admin === true;
                                                    const adminText = adminUser
                                                        ? 'Remove'
                                                        : 'Add';
                                                    return (
                                                        <tr
                                                            className={
                                                                id === user!.uid
                                                                    ? 'text-warning'
                                                                    : undefined
                                                            }
                                                        >
                                                            <td>{id}</td>
                                                            <td>{email}</td>
                                                            <td>
                                                                {displayName}
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    onClick={() =>
                                                                        updateDetail(
                                                                            id,
                                                                            {
                                                                                key:
                                                                                    'allow',
                                                                                value: !allowed,
                                                                            },
                                                                        )
                                                                    }
                                                                    variant="primary"
                                                                >
                                                                    {allowText}
                                                                </Button>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    onClick={() =>
                                                                        updateDetail(
                                                                            id,
                                                                            {
                                                                                key:
                                                                                    'admin',
                                                                                value: !adminUser,
                                                                            },
                                                                        )
                                                                    }
                                                                    variant="primary"
                                                                >
                                                                    {adminText}
                                                                </Button>
                                                            </td>
                                                            <td>
                                                                {photoURL
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )
                        )}
                    </>
                ) : (
                    <h1 className="display-5 text-center">
                        You do not have access to view this page. Click{' '}
                        <Link to="/" className="text-success">
                            here
                        </Link>{' '}
                        to return home
                    </h1>
                )
            ) : (
                <PageSpinner />
            )}
        </BasicPage>
    );
};

export default Admin;
