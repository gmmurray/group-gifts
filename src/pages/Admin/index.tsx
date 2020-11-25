import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Link, useHistory } from 'react-router-dom';
import BasicPage from '../../components/BasicPage';
import PageSpinner from '../../components/PageSpinner';
import SpinnerButton from '../../components/SpinnerButton';
import { useAuthentication } from '../../context/authentication';
import { getPaginatedUserDetails } from '../../database/repositories/userDetailRepository';
import { UserDetail } from '../../models/userDetail';
import {
    DEFAULT_LOADING_STATE,
    DEFAULT_LOAD_STATE,
    pageDirectionType,
    DEFAULT_PAGE_STATE,
} from '../../shared/defaultTypes';

//#region constants
const ELEMENTS_PER_PAGE = 3;
//#endregion

//#region types
type AdminType = {};
//#endregion

const Admin: FunctionComponent<AdminType> = () => {
    //#region context
    const { user, getUserPermission } = useAuthentication();
    const { push } = useHistory();
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
                    const result = await getUserPermission(user.uid);
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
    //#endregion
    const alertText = userPermissionLoaded.error || usersLoading.error;
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
                        <SpinnerButton
                            loading={usersLoading.loading}
                            loadingText="Loading..."
                            staticText="Load users"
                            buttonProps={{
                                type: 'button',
                                disabled: usersLoading.loading,
                                variant: 'primary',
                                onClick: () => handleGetUserData(null, null),
                            }}
                        />
                        {usersLoading.loading ? (
                            <PageSpinner />
                        ) : (
                            <div>
                                <div style={{ minHeight: '300px' }}>
                                    {users.map(u => (
                                        <div>{u.id}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <SpinnerButton
                            loading={usersLoading.loading}
                            loadingText="Loading..."
                            staticText="Next Page"
                            buttonProps={{
                                type: 'button',
                                disabled:
                                    usersLoading.loading ||
                                    (users &&
                                        users.length > 0 &&
                                        users.length < ELEMENTS_PER_PAGE) ||
                                    pagingState.prevRef !== null ||
                                    pagingState.page === 0,
                                variant: 'primary',
                                onClick: () =>
                                    handleGetUserData('next', pagingState.last),
                            }}
                        />
                        <div>{pagingState.page}</div>
                        <SpinnerButton
                            loading={usersLoading.loading}
                            loadingText="Loading..."
                            staticText="Prev Page"
                            buttonProps={{
                                type: 'button',
                                disabled:
                                    usersLoading.loading ||
                                    pagingState.page <= 1,
                                variant: 'primary',
                                onClick: () =>
                                    handleGetUserData(
                                        'prev',
                                        pagingState.first ||
                                            pagingState.prevRef,
                                    ),
                            }}
                        />
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
