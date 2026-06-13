export type ShipmentStatus =
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'delayed';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: Coordinates;
  notifyByEmail: boolean;
  notifyBySms: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  currentLocation: Coordinates;
  status: 'available' | 'on_route' | 'off_duty';
}

export interface StatusEvent {
  status: ShipmentStatus;
  timestamp: string;
  note?: string;
  location?: Coordinates;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  driverId?: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  destinationCoords: Coordinates;
  scheduledDelivery: string;
  estimatedDelivery: string;
  specialInstructions?: string;
  history: StatusEvent[];
  priority: 'standard' | 'express';
  weight: number;
}

export type NotificationDeliveryStatus = 'sending' | 'sent' | 'simulated' | 'failed';

export interface AppNotification {
  id: string;
  channel: 'email' | 'sms' | 'in_app';
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  shipmentId?: string;
  trackingNumber?: string;
  /** Delivery outcome: real email send, simulated channel, or provider failure. */
  status?: NotificationDeliveryStatus;
  read?: boolean;
}

export interface PerformanceReportRow {
  driverId: string;
  driverName: string;
  deliveriesCompleted: number;
  onTimeRate: number;
  averageDurationMin: number;
  fuelCost: number;
}
