// Dashboard view types
export const dashboardViews = ['homes', 'overview', 'payments', 'events', 'voting', 'profile'] as const;
export type DashboardView = typeof dashboardViews[number];

export const adminViews = ['homes', 'overview', 'apartments', 'payments', 'events', 'voting', 'reports'] as const;
export type AdminView = typeof adminViews[number];