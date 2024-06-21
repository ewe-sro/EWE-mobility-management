import { error, json } from '@sveltejs/kit';
import { convertSecondstoTime } from '$lib/utils';

export const fetchApi = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: any) => {
    const response = await fetch(url, {
        method: method,
        body: body,
    });

    if (!response.ok) {
        error(response.status);
    }

    return await response.json();
}


export const fetchChargingData = async (ipAddress: string | null, restApiPort: number | null, controllerId: string | null) => {
    if (!ipAddress || !restApiPort || !controllerId) return json({ success: false });

    // URL boilerplate
    const apiUrl = `http://${ipAddress}:${restApiPort}/api/v1.0/charging-controllers/${controllerId}`;

    const energyData = await fetchApi(`${apiUrl}/data?param_list=energy`, "GET");
    const energyObj = energyData['energy'];

    // Get connected time in seconds
    const connectedTimeSec = await fetchApi(`${apiUrl}/data?param_list=connected_time_sec`, "GET");
    const connectedTime = convertSecondstoTime(connectedTimeSec['connected_time_sec']);

    // Get connected time in seconds
    const chargingTimeSec = await fetchApi(`${apiUrl}/data?param_list=charge_time_sec`, "GET");
    const chargingTime = convertSecondstoTime(chargingTimeSec['charge_time_sec']);

    // Get EV connection data (is EV connected to the charger)
    const stateData = await fetchApi(`${apiUrl}/data?param_list=iec_61851_state`, "GET");
    const stateObj = stateData['iec_61851_state'];

    // EV-state options for connected vehicle
    const connectedStates = ["B1", "B2", "C1", "C2", "D1", "D2"];
    const state = connectedStates.includes(stateObj) ? "connected" : "disconnected";

    return json({
        controllerId: controllerId,
        state: state,
        energyRealPower: energyObj.energy_real_power,
        partEnergyRealPower: energyObj.part_energy_real_power,
        realPower: energyObj.real_power,
        connectedTime: connectedTime,
        chargingTime: chargingTime
    });
}