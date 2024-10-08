// Persisted store for saving the state to localStorage
// https://github.com/joshnuss/svelte-persisted-store
import { persisted } from 'svelte-persisted-store'

interface DashboardCollapsed {
    companies: Record<string, boolean>;
    chargers: Record<string, boolean>;
}

// For tracking the state of the collapsible components on /dashboard
export const dashboardCollapsed = persisted<DashboardCollapsed>("dashboard-collapsed",
    {
        companies: {},
        chargers: {}
    }
);

// For tracking the state of ordering of company collapsibles on /dashboard
export const dashboardOrder = persisted<number[]>("dashboard-order", []);