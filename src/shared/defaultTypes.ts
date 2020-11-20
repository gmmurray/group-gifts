export type defaultLoadedType = { loaded: boolean; error: string | null };
export const DEFAULT_LOAD_STATE: defaultLoadedType = {
    loaded: false,
    error: null,
};

export type defaultLoadingType = { loading: boolean; error: string | null };
export const DEFAULT_LOADING_STATE: defaultLoadingType = {
    loading: false,
    error: null,
};
