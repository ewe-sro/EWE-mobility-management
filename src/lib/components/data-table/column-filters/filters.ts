export const textFilter = ({ filterValue, value }: {
    filterValue: string,
    value: string
}) => {
    // If value in the table is not defined return false (hide the row)
    if (!value) return false;

    return value.toLowerCase().includes(filterValue.toLowerCase());
};

export const stateFilter = ({ filterValue, value }: {
    filterValue: string,
    value: string
}) => {
    if (filterValue === "") return true;

    const state = value !== null ? 'online' : 'charging';

    return state === filterValue;
};

export const rangeFilter = ({ filterValue, value }: {
    filterValue: number[],
    value: number
}) => {
    if (!Array.isArray(filterValue) || typeof value !== 'object') return true;

    const [min, max] = filterValue;
    if (min === null && max === null) return true;
    if (min === null) return value <= max;
    if (max === null) return min <= value;

    return value >= min && value <= max;
};