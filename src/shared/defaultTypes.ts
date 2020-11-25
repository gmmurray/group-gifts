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

export type pageDirectionType = 'next' | 'prev' | null;

export type pagedType = {
    dir: pageDirectionType;
    orderBy: string;
    page: number;
    reference: string | null;
};
export const DEFAULT_PAGED_STATE: pagedType = {
    dir: null,
    orderBy: 'id',
    page: 6,
    reference: null,
};

export type pageStateType = {
    page: number;
    first: string | null;
    last: string | null;
    prevRef: string | null;
};
export const DEFAULT_PAGE_STATE: pageStateType = {
    page: 0,
    first: null,
    last: null,
    prevRef: null,
};
