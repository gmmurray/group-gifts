export const sortByProperty = (
    items: Array<any>,
    property: string,
): Array<any> => {
    if (property === 'price') {
        return items.sort((a: any, b: any) => a[property] - b[property]);
    }
    return items.sort((a: any, b: any) =>
        a[property].localeCompare(b[property]),
    );
};

export const sortByPropertyDesc = (
    items: Array<any>,
    property: string,
): Array<any> => {
    if (property === 'price') {
        return items.sort((a: any, b: any) => b[property] - a[property]);
    }
    return items.sort((a: any, b: any) =>
        b[property].localeCompare(a[property]),
    );
};
