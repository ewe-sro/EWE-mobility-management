import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (
        valueA: number,
        scaleA: [number, number],
        scaleB: [number, number]
    ) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (
        style: Record<string, number | string | undefined>
    ): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t
            });
        },
        easing: cubicOut
    };
};

const getTimezoneOffset = () => {
    const today = new Date();
    const offsetMinutes = today.getTimezoneOffset();
    const offsetHours = -offsetMinutes / 60;

    return offsetHours;
}

export const convertTimestampToDate = (timestamp: string | any, type: "datetime" | "date") => {
    if (timestamp === null || timestamp === undefined) {
        return " ";
    }

    // Create a Date object from the timestamp
    const date = new Date(timestamp);

    const timezoneOffset = getTimezoneOffset();

    // Extract date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
    const day = date.getDate();
    const hour = date.getUTCHours() + timezoneOffset;
    const minutes = date.getMinutes();

    // Construct the date string in desired format
    let formattedDate

    if (type === "datetime") {
        formattedDate = `${day.toString().padStart(2, '0')}. ${month.toString().padStart(2, '0')}. ${year} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } else {
        formattedDate = `${day.toString().padStart(2, '0')}. ${month.toString().padStart(2, '0')}. ${year}`
    }

    return formattedDate;
}

export const getDateDifference = (timestamp: string | any) => {
    const now = new Date();
    const date = new Date(timestamp);

    const differenceInMilliseconds = now.getTime() - date.getTime();

    return Math.floor(differenceInMilliseconds / 1000);
}

export const getSessionDuration = (startTimestamp: Date | null, endTimestamp: Date | null) => {
    if (!startTimestamp || !endTimestamp) return null;

    const differenceInMilliseconds = endTimestamp.getTime() - startTimestamp.getTime();

    return Math.floor(differenceInMilliseconds / 1000);
}

export const convertTokW = (value: number | null, unit: string) => {
    if (value === null) {
        return "";
    }

    if (value > 1000) {
        // Return value in kW format with 2 decimals
        return `${(value / 1000).toFixed(2)} k${unit}`;
    }

    return value;
}

export const emptyStringOnNull = (value: string | number | null | undefined) => {
    return value ?? " ";
}


export const convertSecondstoTime = (givenSeconds: number | null) => {
    if (givenSeconds === null) {
        return "";
    }

    // Calculate days
    const days = Math.floor(givenSeconds / (24 * 3600));
    givenSeconds %= 24 * 3600;

    // Calculate hours
    const hours = Math.floor(givenSeconds / 3600);
    givenSeconds %= 3600;

    // Calculate minutes
    const minutes = Math.floor(givenSeconds / 60);

    // Calculate remaining givenSeconds
    const remainingSeconds = givenSeconds % 60;

    // Format time components to ensure two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Construct the time string
    let timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

    // Add days to the time string if there are any
    if (days > 0) {
        timeString = `${days} ${days > 1 ? 'dny' : 'den'} ${timeString}`;
    }

    return timeString;
}


export const convertEnergyPower = (value: number, unit: "Wh" | "W") => {
    let realPowerCalc;
    let realPowerWh;

    if (value <= 1000) {
        realPowerCalc = round(value, 1);
        realPowerWh = `${realPowerCalc} ${unit}`;
    } else {
        realPowerCalc = round(value / 1000, 2);
        realPowerWh = `${realPowerCalc} k${unit}`;
    }

    return realPowerWh;
}

export const getTodaysDate = () => {
    const today = new Date();

    // Extract date components
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
    const day = String(today.getDate()).padStart(2, "0");
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");

    return { year, month, day, hours, minutes };
}

export const round = (value: number, decimals: number) => {
    const multiplier = Math.pow(10, decimals || 0);
    return Math.round(value * multiplier) / multiplier;
}

export const exportCsv = (data: any) => {
    const BOM = '\uFEFF'; // BOM character for correct character encoding
    const blob = new Blob([BOM + data], { type: 'text/csv;charset=utf-8;' });

    // Create a hidden link used for downloading the CSV
    const hiddenElement = document.createElement('a');

    // Create a URL for the Blob and set it as the href attribute
    const url = URL.createObjectURL(blob);
    hiddenElement.href = url;

    const { year, month, day, hours, minutes } = getTodaysDate();
    hiddenElement.download = `charging_data_export_${day}${month}${year}-${hours}${minutes}.csv`;

    hiddenElement.click();
    hiddenElement.remove();

    // Revoke the object URL after the download is triggered
    URL.revokeObjectURL(url);
};

export const getChargerStatus = (lastConnected: string | any): string | "unavailable" | "offline" | "online" => {
    let status;

    if (!lastConnected) {
        status = 'unavailable';
    } else if (getDateDifference(lastConnected) > 3 * 60) {
        status = 'offline';
    } else {
        status = 'online';
    }

    return status;
}

export const isEmptyNullOrUndefined = (value: any) => {
    return value === "" || value === null || value === undefined ? true : false;
}

// Check if a date is between two dates
export const isBetweenDates = (startTimestamp: Date, endTimestamp: Date, targetTimestamp: Date): boolean => {
    return targetTimestamp >= startTimestamp && targetTimestamp <= endTimestamp;
}

// convert an Array of data
export const getCsvFromData = (data: any[]) => {
    // Get the keys from the first object to use as the header
    const headers = Object.keys(data[0]);

    // Map the data to an array of CSV rows
    const csvRows = data.map((row) => {
        // Map the row values to an array of values
        const rowValues = headers.map((header) => {
            const value = row[header];
            // Convert values to strings
            if (typeof value === 'object' && value !== null) {
                return value.toISOString();
            } else {
                return value !== null ? value.toString() : '';
            }
        });
        return rowValues.join(',');
    });

    // Join the header row with the data rows
    const csvString = [headers.join(','), ...csvRows].join('\n');
    return csvString;
};