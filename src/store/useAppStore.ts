import { create } from 'zustand';
import type {
  AppNotification,
  Customer,
  Driver,
  NotificationDeliveryStatus,
  Shipment,
  ShipmentStatus,
  StatusEvent,
} from '../types';
import { customers, drivers, shipments } from '../data/mockData';
import { sendEmailNotification } from '../services/notificationService';

export interface CreateShipmentInput {
  customerId: string;
  destination?: string;
  priority: 'standard' | 'express';
  weight: number;
  scheduledDelivery: string;
  specialInstructions?: string;
  driverId?: string;
}

interface AppState {
  shipments: Shipment[];
  drivers: Driver[];
  customers: Customer[];
  notifications: AppNotification[];

  // Selectors
  getShipmentById: (id: string) => Shipment | undefined;
  getShipmentByTracking: (tn: string) => Shipment | undefined;
  getShipmentsByDriver: (driverId: string) => Shipment[];
  getCustomerById: (id: string) => Customer | undefined;
  getDriverById: (id: string) => Driver | undefined;

  // Mutations
  updateShipmentStatus: (
    shipmentId: string,
    status: ShipmentStatus,
    note?: string
  ) => void;
  rescheduleShipment: (shipmentId: string, newDate: string, instructions?: string) => void;
  assignShipment: (shipmentId: string, driverId: string) => void;
  createShipment: (input: CreateShipmentInput) => Shipment | undefined;
  pushNotification: (n: Omit<AppNotification, 'id' | 'sentAt'>) => void;
  dismissNotification: (id: string) => void;
  setNotificationStatus: (id: string, status: NotificationDeliveryStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

function buildNotificationsFor(
  shipment: Shipment,
  customer: Customer | undefined,
  status: ShipmentStatus,
  note?: string
): Array<Omit<AppNotification, 'id' | 'sentAt'>> {
  if (!customer) return [];
  const channels: Array<'email' | 'sms'> = [];
  if (customer.notifyByEmail) channels.push('email');
  if (customer.notifyBySms) channels.push('sms');
  if (channels.length === 0) return [];

  const templates: Partial<Record<ShipmentStatus, { subject: string; body: string }>> = {
    assigned: {
      subject: `Driver assigned to ${shipment.trackingNumber}`,
      body: `Hi ${customer.name}, a driver has been assigned to your shipment. You can follow its progress in the tracking portal.`,
    },
    in_transit: {
      subject: `Your shipment ${shipment.trackingNumber} is in transit`,
      body: `Hi ${customer.name}, your package has been picked up and is moving through our network.`,
    },
    out_for_delivery: {
      subject: `Your shipment ${shipment.trackingNumber} is out for delivery`,
      body: `Hi ${customer.name}, your package is on its way and should arrive within the next couple of hours.`,
    },
    delivered: {
      subject: `Delivered: ${shipment.trackingNumber}`,
      body: `Hi ${customer.name}, your package has been delivered. Thanks for using our service.`,
    },
    delayed: {
      subject: `Delay notice for ${shipment.trackingNumber}`,
      body: `Hi ${customer.name}, there is a small delay on your package. An updated ETA is available in the tracking portal.`,
    },
    failed: {
      subject: `Delivery attempt unsuccessful: ${shipment.trackingNumber}`,
      body: `Hi ${customer.name}, the driver was unable to complete the delivery${
        note ? ` (driver note: ${note})` : ''
      }. A rescheduling link is in the tracking portal.`,
    },
  };

  const t = templates[status];
  if (!t) return [];
  return channels.map((channel) => ({
    channel,
    to: channel === 'email' ? customer.email : customer.phone,
    subject: t.subject,
    body: t.body,
    shipmentId: shipment.id,
    trackingNumber: shipment.trackingNumber,
  }));
}

export const useAppStore = create<AppState>((set, get) => ({
  shipments,
  drivers,
  customers,
  notifications: [],

  getShipmentById: (id) => get().shipments.find((s) => s.id === id),
  getShipmentByTracking: (tn) =>
    get().shipments.find((s) => s.trackingNumber.toLowerCase() === tn.toLowerCase()),
  getShipmentsByDriver: (driverId) =>
    get().shipments.filter((s) => s.driverId === driverId),
  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getDriverById: (id) => get().drivers.find((d) => d.id === id),

  updateShipmentStatus: (shipmentId, status, note) => {
    const state = get();
    const shipment = state.getShipmentById(shipmentId);
    if (!shipment) return;

    const event: StatusEvent = {
      status,
      timestamp: new Date().toISOString(),
      note,
    };

    const updated: Shipment = {
      ...shipment,
      status,
      history: [...shipment.history, event],
    };

    set({
      shipments: state.shipments.map((s) => (s.id === shipmentId ? updated : s)),
    });

    // Dispatch notifications on every enabled channel if a template exists
    const customer = state.getCustomerById(shipment.customerId);
    for (const notif of buildNotificationsFor(updated, customer, status, note)) {
      get().pushNotification(notif);
    }
  },

  rescheduleShipment: (shipmentId, newDate, instructions) => {
    const state = get();
    const shipment = state.getShipmentById(shipmentId);
    if (!shipment) return;
    set({
      shipments: state.shipments.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              scheduledDelivery: newDate,
              estimatedDelivery: newDate,
              specialInstructions: instructions ?? s.specialInstructions,
              history: [
                ...s.history,
                {
                  status: s.status,
                  timestamp: new Date().toISOString(),
                  note: `Rescheduled by customer${instructions ? `, note: ${instructions}` : ''}`,
                },
              ],
            }
          : s
      ),
    });

    // Reschedule confirmation on every enabled channel
    const customer = state.getCustomerById(shipment.customerId);
    if (customer) {
      const when = new Date(newDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      const channels: Array<'email' | 'sms'> = [];
      if (customer.notifyByEmail) channels.push('email');
      if (customer.notifyBySms) channels.push('sms');
      for (const channel of channels) {
        get().pushNotification({
          channel,
          to: channel === 'email' ? customer.email : customer.phone,
          subject: `Rescheduled: ${shipment.trackingNumber}`,
          body: `Hi ${customer.name}, your delivery has been rescheduled to ${when}.${
            instructions ? ` Delivery instructions noted: ${instructions}` : ''
          }`,
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
        });
      }
    }
  },

  createShipment: (input) => {
    const state = get();
    const customer = state.getCustomerById(input.customerId);
    if (!customer) return undefined;

    const nextNumber =
      Math.max(
        100000,
        ...state.shipments.map((s) => Number.parseInt(s.trackingNumber.split('-')[1], 10) || 0)
      ) + 1;
    const trackingNumber = `LGX-${nextNumber}`;
    const now = new Date().toISOString();

    const history: StatusEvent[] = [
      { status: 'pending', timestamp: now, note: 'Order created in dispatcher console' },
    ];
    if (input.driverId) {
      const driver = state.getDriverById(input.driverId);
      history.push({
        status: 'assigned',
        timestamp: now,
        note: `Assigned to ${driver?.name ?? input.driverId}`,
      });
    }

    const shipment: Shipment = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      trackingNumber,
      customerId: customer.id,
      driverId: input.driverId,
      status: input.driverId ? 'assigned' : 'pending',
      origin: 'Colombo Hub Warehouse',
      destination: input.destination?.trim() || customer.address,
      destinationCoords: customer.coordinates,
      scheduledDelivery: input.scheduledDelivery,
      estimatedDelivery: input.scheduledDelivery,
      specialInstructions: input.specialInstructions?.trim() || undefined,
      history,
      priority: input.priority,
      weight: input.weight,
    };

    set({ shipments: [...state.shipments, shipment] });

    // Creation confirmation on every enabled channel
    const when = new Date(input.scheduledDelivery).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const channels: Array<'email' | 'sms'> = [];
    if (customer.notifyByEmail) channels.push('email');
    if (customer.notifyBySms) channels.push('sms');
    for (const channel of channels) {
      get().pushNotification({
        channel,
        to: channel === 'email' ? customer.email : customer.phone,
        subject: `Shipment created: ${trackingNumber}`,
        body: `Hi ${customer.name}, your shipment has been booked for delivery to ${shipment.destination}, scheduled for ${when}. Track it any time in the customer portal.`,
        shipmentId: shipment.id,
        trackingNumber,
      });
    }

    return shipment;
  },

  assignShipment: (shipmentId, driverId) => {
    const state = get();
    set({
      shipments: state.shipments.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              driverId,
              status: 'assigned',
              history: [
                ...s.history,
                {
                  status: 'assigned',
                  timestamp: new Date().toISOString(),
                  note: `Assigned to driver ${driverId}`,
                },
              ],
            }
          : s
      ),
    });
  },

  pushNotification: (n) => {
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // Email goes out for real through the notification server; SMS stays a
    // simulated channel for the demo.
    const dispatchEmail = n.channel === 'email' && import.meta.env.MODE !== 'test';
    const status: AppNotification['status'] = dispatchEmail
      ? 'sending'
      : n.channel === 'sms'
      ? 'simulated'
      : n.status ?? 'sent';

    set({
      notifications: [
        ...get().notifications,
        { read: false, ...n, id, status, sentAt: new Date().toISOString() },
      ],
    });

    if (dispatchEmail) {
      void sendEmailNotification(n).then((result) => {
        get().setNotificationStatus(id, result);
      });
    }
  },

  dismissNotification: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) });
  },

  setNotificationStatus: (id, status) => {
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, status } : n)),
    });
  },

  markNotificationRead: (id) => {
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    });
  },

  markAllNotificationsRead: () => {
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
  },
}));
