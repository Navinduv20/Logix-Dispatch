import type { ShipmentStatus } from '../types';

/**
 * Single source of truth for all user-facing copy in the app.
 *
 * Keeping strings here (rather than inline in components) makes wording
 * consistent across views, easy to review in one place, and ready for future
 * internationalisation. Dynamic values are exposed as small functions.
 */

// Shared, human-readable labels for each shipment status.
export const statusLabels: Record<ShipmentStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  failed: 'Failed',
  delayed: 'Delayed',
};

export const content = {
  app: {
    brand: 'Logix Dispatch',
    brandInitials: 'LX',
    brandSubtitle: 'Logistics Management Platform',
    footer: 'Logix Dispatch.',
  },

  nav: {
    home: 'Home',
    customerPortal: 'Customer Portal',
    dispatcher: 'Dispatcher',
    driver: 'Driver',
    manager: 'Manager',
    menu: 'Menu',
    navigateAria: 'Navigate',
    notificationsAria: (unread: number) =>
      `Notifications${unread > 0 ? `, ${unread} unread` : ''}`,
  },

  home: {
    eyebrow: 'Logix Dispatch',
    headline: 'Real-time logistics visibility for dispatchers, drivers, and customers.',
    subhead:
      'One platform replacing spreadsheets, phone calls, and paper route sheets. Built for small logistics operators who need the control of enterprise tooling without the complexity.',
    trackFormAria: 'Track a shipment',
    trackPlaceholder: 'Enter tracking number (e.g. LGX-100001)',
    trackButton: 'Track shipment',
    createShipment: '+ Create shipment',
    errorEmpty: 'Please enter a tracking number.',
    errorNotFound:
      'We could not find that tracking number. Try LGX-100001 to LGX-100008 in the demo.',
    workspacesTitle: 'Choose a workspace',
    workspacesSubtitle:
      'The demo ships with four role-based views. Each role sees only what it needs.',
    workspaceCards: [
      {
        to: '/portal',
        title: 'Customer Portal',
        copy: 'Track, reschedule, and manage delivery notifications in a self-service view.',
      },
      {
        to: '/dispatcher',
        title: 'Dispatcher',
        copy: 'See every driver on the map, assign parcels, and intervene when things go wrong.',
      },
      {
        to: '/driver/d1',
        title: 'Driver',
        copy: 'A mobile-first route list with one-tap status updates and turn-by-turn navigation.',
      },
      {
        to: '/manager',
        title: 'Manager Reports',
        copy: 'Fleet KPIs, on-time rates, and fuel cost trends in a single dashboard.',
      },
    ],
    statActive: 'Active shipments',
    statDelivered: 'Delivered this window',
    statAttention: 'Need attention',
  },

  customerPortal: {
    title: 'Customer portal',
    subtitle: 'Self-service tracking, rescheduling, and notification preferences.',
    signedInAs: 'Signed in as',
    account: 'Account',
    notifications: 'Notifications',
    emailUpdates: 'Email updates',
    smsAlerts: 'SMS alerts',
    on: 'On',
    off: 'Off',
    activeDeliveries: 'Active deliveries',
    shipmentCount: (n: number) => `${n} shipments`,
    noActive: 'You have no active deliveries right now.',
    reschedule: 'Reschedule',
    track: 'Track',
    etaPrefix: 'ETA',
    historyTitle: 'Delivery history',
    historyEmpty: 'No completed deliveries yet.',
  },

  dispatcher: {
    title: 'Dispatcher console',
    subtitle: 'Live fleet view with drag-free assignment and at-a-glance queue health.',
    newShipment: '+ New shipment',
    filters: [
      { value: 'all', label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'assigned', label: 'Assigned' },
      { value: 'in_transit', label: 'In transit' },
      { value: 'out_for_delivery', label: 'Out for delivery' },
      { value: 'delayed', label: 'Delayed' },
      { value: 'failed', label: 'Failed' },
    ] as const,
    fleet: 'Fleet',
    queue: 'Queue',
    activeSuffix: 'active',
    driverPrefix: 'Driver:',
    unassigned: 'Unassigned',
    assign: 'Assign',
    reassign: 'Reassign',
    pickDriver: 'Pick driver',
    noMatch: 'No shipments match this filter.',
  },

  driver: {
    notFoundTitle: 'Driver not found',
    notFoundHint: 'Pick a driver from the list below.',
    todaysRoute: "Today's route",
    routeHint: 'Optimised by ETA and priority. Tap a stop to see details.',
    noActiveStops: 'No active stops. You are done for the day.',
    completed: (n: number) => `Completed (${n})`,
    stopDetails: 'Stop details',
    tracking: 'Tracking',
    recipient: 'Recipient',
    address: 'Address',
    phone: 'Phone',
    instructions: 'Instructions',
    etaPrefix: 'ETA',
  },

  manager: {
    title: 'Operations dashboard',
    subtitle:
      'On-time performance, fleet utilisation, and fuel cost trends for the last seven days.',
    kpiDelivered: 'Deliveries completed',
    kpiOnTime: 'On-time rate',
    kpiFuel: 'Fuel spend (LKR)',
    onTimeChartTitle: 'On-time rate, last 7 days',
    statusMixTitle: 'Status mix',
    driverPerformanceTitle: 'Driver performance',
    seriesOnTime: 'On time %',
    seriesDelayed: 'Delayed %',
    seriesDeliveries: 'Deliveries',
    seriesAvgDuration: 'Avg duration (min)',
    table: {
      driver: 'Driver',
      completed: 'Completed',
      onTime: 'On-time',
      avgDuration: 'Avg duration',
      fuel: 'Fuel (LKR)',
    },
  },

  tracking: {
    notFoundTitle: 'Shipment not found',
    notFoundHint: 'Try one of the demo tracking numbers: LGX-100001 to LGX-100008.',
    backHome: 'Back to home',
    trackingNumberLabel: 'Tracking number',
    etaPrefix: 'ETA',
    reschedule: 'Reschedule',
    deliveryHistory: 'Delivery history',
    deliveryHistoryHint:
      'Every status change is logged for compliance and customer-service review.',
    shipmentDetails: 'Shipment details',
    origin: 'Origin',
    destination: 'Destination',
    priority: 'Priority',
    weight: 'Weight',
    instructions: 'Instructions',
    recipient: 'Recipient',
    driver: 'Driver',
  },

  statusUpdate: {
    title: 'Update status',
    hint: 'Changes are timestamped and trigger customer notifications automatically.',
    newStatus: 'New status',
    noteLabel: 'Note (optional)',
    notePlaceholder: 'e.g. Handed to reception',
    submit: 'Record update',
    lastUpdatePrefix: 'Last update at',
    options: [
      { value: 'in_transit', label: 'Mark in transit' },
      { value: 'out_for_delivery', label: 'Out for delivery' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'failed', label: 'Delivery failed' },
      { value: 'delayed', label: 'Delay reported' },
    ] as const,
  },

  createShipment: {
    title: 'Create shipment',
    createdTitle: 'Shipment created',
    trackingNumberLabel: 'Tracking number',
    assignedReady: 'Assigned and ready for pickup.',
    queuedAwaiting: 'In the queue, awaiting a driver.',
    customerNotified: 'The customer has been notified.',
    done: 'Done',
    viewTracking: 'View tracking',
    customer: 'Customer',
    destination: 'Destination address',
    destinationHint: "Leave blank to use the customer's address on file.",
    priority: 'Priority',
    priorityStandard: 'Standard',
    priorityExpress: 'Express',
    weight: 'Weight (kg)',
    scheduledDelivery: 'Scheduled delivery',
    assignDriver: 'Assign driver (optional)',
    leaveUnassigned: 'Leave unassigned',
    specialInstructions: 'Special instructions',
    instructionsPlaceholder: 'Optional: gate code, fragile contents, call on arrival...',
    cancel: 'Cancel',
    submit: 'Create shipment',
  },

  reschedule: {
    title: 'Reschedule delivery',
    summary: (tracking: string, eta: string) => `Tracking ${tracking}, current ETA ${eta}.`,
    newDate: 'New delivery date and time',
    instructions: 'Delivery instructions',
    instructionsPlaceholder: 'Optional: gate code, doorman, safe-drop spot...',
    cancel: 'Cancel',
    save: 'Save changes',
  },

  notificationCenter: {
    title: 'Notifications',
    markAllRead: 'Mark all read',
    empty: 'No notifications sent yet. Update a shipment status to trigger one.',
    previewAria: 'Notification preview',
    closePreview: 'Close preview',
    smsSimulated: 'SMS channel is simulated for the demo.',
    statusLabels: {
      sending: 'Sending…',
      sent: 'Sent',
      simulated: 'Simulated',
      failed: 'Failed',
    } as Record<string, string>,
  },

  shipmentNotifications: {
    title: 'Notifications sent',
    hint: 'Email and SMS updates dispatched to the recipient for this shipment.',
    empty: 'Nothing sent yet for this shipment. Status changes and reschedules will appear here.',
  },

  shipmentList: {
    empty: 'No shipments to show.',
  },

  trackingCard: {
    trackingNumberLabel: 'Tracking number',
    forPrefix: 'For',
    destination: 'Destination',
    eta: 'ETA',
    priority: 'Priority',
    driver: 'Driver',
    unassigned: 'Unassigned',
    viewTracking: 'View tracking',
  },

  common: {
    dismissNotification: 'Dismiss notification',
    close: 'Close',
  },
} as const;
