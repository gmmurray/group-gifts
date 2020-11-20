import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import ModalForm, {
    LoadingActionButtonType,
    SelectInputType,
    TextInputType,
} from '../../components/ModalForm';
import { useAuthentication } from '../../context/authentication';
import {
    deleteGroup,
    updateGroup,
} from '../../database/repositories/groupRepository';
import { getUserDetailItems } from '../../database/repositories/userDetailRepository';
import {
    validateGroupCode,
    validateRequiredField,
} from '../../helpers/fieldValidation';
import { GroupUpdate } from '../../models/group';
import { UserDetail } from '../../models/userDetail';

//#region types
type groupUpdateFormType = {
    values: GroupUpdate;
    errors: {
        name: string | null;
        invitedUsers: string | null;
        description: string | null;
        ownerId: string | null;
        code: string | null;
        form: string | null;
    };
    dirty: {
        name: boolean;
        invitedUsers: boolean;
        description: boolean;
        ownerId: boolean;
        code: boolean;
    };
};

type loadingType = {
    loading: boolean;
    error: string | null;
};

type loadedType = {
    loaded: boolean;
    error: string | null;
};

type UpdateGroupModalType = {
    groupId: string;
    groupData: GroupUpdate;
    open: boolean;
    onClose: () => void;
};
//#endregion

//#region initial values
const INITIAL_UPDATE_FORM: groupUpdateFormType = {
    values: {
        name: '',
        invitedUsers: new Array<string>(),
        description: '',
        ownerId: '',
        code: '',
    },
    errors: {
        name: null,
        invitedUsers: null,
        description: null,
        ownerId: null,
        code: null,
        form: null,
    },
    dirty: {
        name: false,
        invitedUsers: false,
        description: false,
        ownerId: false,
        code: false,
    },
};

const INITIAL_LOADING: loadingType = {
    loading: false,
    error: null,
};

const INITIAL_LOADED: loadedType = {
    loaded: false,
    error: null,
};
//#endregion

const UpdateGroupModal: FunctionComponent<UpdateGroupModalType> = ({
    groupId,
    groupData,
    open,
    onClose,
}) => {
    //#region context
    const { user } = useAuthentication();
    const { push } = useHistory();
    //#endregion

    //#region state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [groupUpdateForm, setGroupUpdateForm] = useState(INITIAL_UPDATE_FORM);
    const [deleteLoading, setDeleteLoading] = useState(INITIAL_LOADING);
    const [availableUsers, setAvailableUsers] = useState(Array<UserDetail>());
    const [availableUsersLoaded, setAvailableUsersLoaded] = useState(
        INITIAL_LOADED,
    );
    //#endregion

    //#region effects
    useEffect((): void => {
        const getUserDetailData = async (): Promise<void> => {
            try {
                const result = await getUserDetailItems(true);
                if (result !== null) {
                    const users = result.filter(
                        u =>
                            !groupData.invitedUsers.includes(u.id) &&
                            groupData.ownerId !== u.id,
                    );
                    setAvailableUsers(users);
                    setAvailableUsersLoaded({
                        ...availableUsersLoaded,
                        loaded: true,
                    });
                }
            } catch (error) {
                setAvailableUsersLoaded({
                    ...availableUsersLoaded,
                    loaded: true,
                    error,
                });
            }
        };
        if (open) getUserDetailData();
    }, [open]);

    useEffect((): void => {
        const resetState = () => {
            setIsSubmitting(false);
            setGroupUpdateForm(INITIAL_UPDATE_FORM);
            setDeleteLoading(INITIAL_LOADING);
        };
        if (!open) {
            resetState();
        } else {
            setGroupUpdateForm(g => ({
                ...g,
                values: {
                    ...g.values,
                    ...groupData,
                },
            }));
        }
    }, [open, groupData, setGroupUpdateForm]);

    //#endregion

    //#region callbacks
    const handleDeleteGroup = useCallback(async (): Promise<void> => {
        if (user !== null) {
            setDeleteLoading({
                ...deleteLoading,
                loading: true,
            });
            try {
                // eslint-disable-next-line no-restricted-globals
                if (confirm('Are you sure you want to delete this group?')) {
                    await deleteGroup(groupId);
                    setDeleteLoading({
                        ...deleteLoading,
                        loading: false,
                    });
                    push('/groups');
                    return;
                }
            } catch (error) {
                console.log(error);
                setDeleteLoading({
                    ...deleteLoading,
                    loading: false,
                    error: 'There was an error deleting the group',
                });
                onClose();
            }
        }
    }, [groupId, setDeleteLoading, deleteLoading, user, onClose, push]);

    const doValidation = useCallback((): boolean => {
        const name = validateRequiredField(groupUpdateForm.values.name)
            ? null
            : 'Please enter a group name';
        const code = validateGroupCode(groupUpdateForm.values.code)
            ? null
            : 'Please enter a valid code';
        setGroupUpdateForm({
            ...groupUpdateForm,
            errors: {
                ...groupUpdateForm.errors,
                name,
                code,
            },
        });
        return name !== null || code !== null;
    }, [groupUpdateForm]);

    const onSubmit = useCallback(
        async (e: SyntheticEvent): Promise<void> => {
            e.preventDefault();
            if (doValidation()) return;

            try {
                setIsSubmitting(true);

                await updateGroup(groupId, groupUpdateForm.values);

                onClose();
            } catch (error) {
                setIsSubmitting(false);
                setGroupUpdateForm({
                    ...groupUpdateForm,
                    errors: {
                        ...groupUpdateForm.errors,
                        form: 'Error updating group information',
                    },
                });
            }
        },
        [
            doValidation,
            setIsSubmitting,
            onClose,
            setGroupUpdateForm,
            groupId,
            groupUpdateForm,
        ],
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setGroupUpdateForm({
                ...groupUpdateForm,
                values: {
                    ...groupUpdateForm.values,
                    [e.target.name]: e.target.value,
                },
                dirty: {
                    ...groupUpdateForm.dirty,
                    [e.target.name]: true,
                },
            });
        },
        [setGroupUpdateForm, groupUpdateForm],
    );

    const handleSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const userArray = Array.from(
                e.target.selectedOptions,
                option => option.value,
            );
            setGroupUpdateForm({
                ...groupUpdateForm,
                values: {
                    ...groupUpdateForm.values,
                    invitedUsers: userArray,
                },
            });
        },
        [setGroupUpdateForm, groupUpdateForm],
    );

    const clearSelectedUsers = useCallback((): void => {
        setGroupUpdateForm({
            ...groupUpdateForm,
            values: {
                ...groupUpdateForm.values,
                invitedUsers: new Array<string>(),
            },
        });
    }, [setGroupUpdateForm, groupUpdateForm]);

    const clearAlert = useCallback((): void => {
        setDeleteLoading({
            ...deleteLoading,
            error: INITIAL_LOADING.error,
        });
        setAvailableUsersLoaded({
            ...availableUsersLoaded,
            error: INITIAL_LOADING.error,
        });
    }, [
        setDeleteLoading,
        deleteLoading,
        availableUsersLoaded,
        setAvailableUsersLoaded,
    ]);
    //#endregion

    //#region modal props
    const modalProps: {
        size: 'sm' | 'lg' | 'xl';
        centered: boolean;
    } = {
        size: 'lg',
        centered: true,
    };

    const textInputs: Array<TextInputType> = [
        {
            label: 'Name',
            type: 'text',
            name: 'name',
            value: groupUpdateForm.values.name,
            error: groupUpdateForm.errors.name,
            placeholder: 'Name',
            initialValue: groupData.name ?? undefined,
        },
        {
            label: 'Description',
            type: 'text',
            name: 'description',
            value: groupUpdateForm.values.description,
            error: groupUpdateForm.errors.description,
            placeholder: 'Description',
            initialValue: groupData.description ?? undefined,
        },
        {
            label: 'Owner ID',
            type: 'text',
            name: 'ownerId',
            value: groupUpdateForm.values.ownerId,
            error: groupUpdateForm.errors.ownerId,
            placeholder: 'Owner ID',
            initialValue: groupData.ownerId ?? undefined,
            helpText: 'Changing this will make you no longer the group owner',
        },
        {
            label: 'Group code',
            type: 'text',
            name: 'code',
            value: groupUpdateForm.values.code,
            error: groupUpdateForm.errors.code,
            placeholder: 'Group code',
            initialValue: groupData.code ?? undefined,
            helpText:
                "This should be four or more letters/numbers that your friends can use to join your group. Don't forget it but don't make it too easy to guess!",
        },
    ];

    const selectInputs: Array<SelectInputType> = [
        {
            label: 'Invite users',
            name: 'invitedUsers',
            multiple: true,
            placeholder: 'Select...',
            disabled: !availableUsersLoaded.loaded,
            helpText: 'Hold shift to select more than one!',
            value: groupUpdateForm.values.invitedUsers,
            options: availableUsers.map(({ id, email }: UserDetail) => ({
                value: id,
                name: email || id,
            })),
            onChange: handleSelectChange,
            onClear: clearSelectedUsers,
        },
    ];

    const additionalActions: Array<LoadingActionButtonType> = [
        {
            variant: 'warning',
            type: 'button',
            actionLoading: deleteLoading.loading,
            actionLoadingText: 'Deleting...',
            actionStaticText: 'Delete',
            onClick: handleDeleteGroup,
        },
    ];

    const alertText = availableUsersLoaded.error || deleteLoading.error;
    //#endregion

    //#region render
    return (
        <ModalForm
            title="Update group information"
            loading={isSubmitting}
            show={open}
            submitText="Save"
            submitProcessingText="Saving..."
            modalProps={modalProps}
            textInputs={textInputs}
            selectInputs={selectInputs}
            additionalActions={additionalActions}
            onClose={onClose}
            onChange={handleChange}
            onSubmit={onSubmit}
            formDirty={groupUpdateForm.dirty}
            alertText={alertText ?? undefined}
            onAlertClose={clearAlert}
        />
    );
    //#endregion
};

export default UpdateGroupModal;
