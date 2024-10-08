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
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are zero-indexed, so add 1
    let day = date.getDate();
    let hour = date.getUTCHours() + timezoneOffset;
    const minutes = date.getMinutes();

    // Adjust for day rollover
    if (hour >= 24) {
        hour -= 24;
        date.setUTCDate(date.getUTCDate() + 1);
        day = date.getUTCDate();
        month = date.getUTCMonth() + 1;
        year = date.getUTCFullYear();
    }

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


export const convertSecondsToTime = (givenSeconds: number | null): string => {
    if (givenSeconds === null) {
        return "";
    }

    // Calculate hours
    const hours = Math.floor(givenSeconds / 3600);
    givenSeconds %= 3600;

    // Calculate minutes
    const minutes = Math.floor(givenSeconds / 60);

    // Calculate remaining seconds
    const remainingSeconds = round(givenSeconds % 60, 0);

    // Format time components to ensure two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Construct the time string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const convertTimeToSeconds = (timeString: string) => {
    // Regular expression to match the different time formats
    const regex = /^(?:(\d+)\s*(?:days?|d),?\s*)?(?:(\d+):)?(\d+):(\d+)$/;
    const match = timeString.match(regex);

    if (!match) {
        return;
    }

    // Remove the full match from the array
    const [, ...parts] = match;

    // Pad the array with zeros at the beginning if necessary
    while (parts.length < 4) {
        parts.unshift('0');
    }

    const [days, hours, minutes, seconds] = parts.map(part => parseInt(part) || 0);

    // Convert everything to seconds and sum up
    return (
        days * 86400 +    // 24 * 60 * 60
        hours * 3600 +    // 60 * 60
        minutes * 60 +
        seconds
    );
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

export const getChargerStatus = (lastConnected: string | any): "unavailable" | "offline" | "online" => {
    if (!lastConnected) {
        return 'unavailable';
    } else if (getDateDifference(lastConnected) > 3 * 60) {
        return 'offline';
    } else {
        return 'online';
    }
}

export const getControllerStatus = (connectedState: string | any): "offline" | "disconnected" | "connected" => {
    if (connectedState === "disconnected") {
        return 'disconnected';
    } else if (connectedState === "connected") {
        return 'connected';
    } else {
        return "offline";
    }
}

export const isEmptyNullOrUndefined = (value: any) => {
    return value === "" || value === null || value === undefined ? true : false;
}

// Check if a date is between two dates
export const isBetweenDates = (startTimestamp: Date, endTimestamp: Date, targetTimestamp: Date): boolean => {
    return targetTimestamp >= startTimestamp && targetTimestamp <= endTimestamp;
}

// convert an Array of data to CSV file
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

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) {
        return bytes + " B";
    } else if (bytes < 1048576) {
        return round(bytes / 1024, 1) + " KB";
    } else {
        return round(bytes / 1048576, 1) + " MB";
    }
}

export const getFilenameAndExtension = (fullFilename: string) => {
    // Find the position of the last dot
    const lastDotIndex = fullFilename.lastIndexOf('.');

    // If there's no dot or the dot is at the start, return the whole string as filename and empty extension
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return { filename: fullFilename, extension: '' };
    }

    // Extract the filename and extension
    const filename = fullFilename.slice(0, lastDotIndex);
    const extension = fullFilename.slice(lastDotIndex + 1);

    return { filename, extension };
}

export const csvToArrayOfArrays = (data: string | ArrayBuffer | null) => {
    if (typeof data !== "string") return false;

    const output = [];

    // Convert the CSV string to array
    const rows = data.split("\n");

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].split(",");
        output.push(cells);
    }

    return output;
}

export const csvToArrayOfObjects = (data: string | ArrayBuffer | null) => {
    if (typeof data !== "string") return false;

    const output = [];

    // Replace all \r characters (end of lines) with an empty string
    const cleanedData = data.replace(/\r/g, '');

    // Convert the CSV string to array
    const rows = cleanedData.split("\n");

    // Get the column names from the first row of the data
    const headers = rows[0].split(',');

    // Loop over the data and skip the header row
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(",");

        let obj: any = {};
        for (let j = 0; j < cells.length; j++) {
            obj[headers[j]] = cells[j];
        }

        output.push(obj);
    }

    console.log(output);
    return output;
}