import { describe, expect, it, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset the store between tests by reloading the module's initial state
    useAppStore.setState((state) => ({
      ...state,
      notifications: [],
    }));
  });

  it('looks up shipments by tracking number case-insensitively', () => {
    const s = useAppStore.getState().getShipmentByTracking('lgx-100001');
    expect(s).toBeDefined();
    expect(s?.trackingNumber).toBe('LGX-100001');
  });

  it('updates shipment status and appends a history event', () => {
    const { updateShipmentStatus, getShipmentById } = useAppStore.getState();
    const before = getShipmentById('s2');
    expect(before?.status).not.toBe('delivered');
    const beforeLen = before?.history.length ?? 0;

    updateShipmentStatus('s2', 'delivered', 'Signed for by customer');

    const after = useAppStore.getState().getShipmentById('s2');
    expect(after?.status).toBe('delivered');
    expect(after?.history.length).toBe(beforeLen + 1);
    expect(after?.history.at(-1)?.note).toBe('Signed for by customer');
  });

  it('sends a notification when status transitions to out_for_delivery', () => {
    const { updateShipmentStatus } = useAppStore.getState();
    const before = useAppStore.getState().notifications.length;

    updateShipmentStatus('s4', 'out_for_delivery');

    const after = useAppStore.getState().notifications.length;
    expect(after).toBeGreaterThan(before);
    const latest = useAppStore.getState().notifications.at(-1);
    expect(latest?.subject).toContain('out for delivery');
  });

  it('reschedules a shipment and records the change in history', () => {
    const { rescheduleShipment, getShipmentById } = useAppStore.getState();
    const newDate = new Date(Date.now() + 48 * 3600_000).toISOString();

    rescheduleShipment('s5', newDate, 'Leave with doorman');

    const after = getShipmentById('s5');
    expect(after?.scheduledDelivery).toBe(newDate);
    expect(after?.specialInstructions).toBe('Leave with doorman');
    expect(after?.history.at(-1)?.note).toContain('Rescheduled');
  });

  it('assigns a shipment to a driver and marks it assigned', () => {
    const { assignShipment, getShipmentById } = useAppStore.getState();

    assignShipment('s5', 'd3');

    const after = getShipmentById('s5');
    expect(after?.driverId).toBe('d3');
    expect(after?.status).toBe('assigned');
  });

  it('returns undefined for unknown shipment IDs and tracking numbers', () => {
    const { getShipmentById, getShipmentByTracking } = useAppStore.getState();
    expect(getShipmentById('does-not-exist')).toBeUndefined();
    expect(getShipmentByTracking('LGX-NOPE')).toBeUndefined();
  });

  it('returns only the shipments assigned to a given driver', () => {
    const { getShipmentsByDriver } = useAppStore.getState();
    const mine = getShipmentsByDriver('d1');
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((s) => s.driverId === 'd1')).toBe(true);
  });

  it('respects customer notification opt-out (no SMS when notifyBySms is false)', () => {
    const { updateShipmentStatus, notifications } = useAppStore.getState();
    const before = notifications.length;

    // Customer c2 has notifyByEmail = true, notifyBySms = false
    updateShipmentStatus('s2', 'delivered');

    const after = useAppStore.getState().notifications;
    expect(after.length).toBeGreaterThan(before);
    // The dispatched notification should have used email, not SMS
    expect(after.at(-1)?.channel).toBe('email');
  });

  it('does nothing when asked to update a shipment that does not exist', () => {
    const beforeShipments = useAppStore.getState().shipments;
    useAppStore.getState().updateShipmentStatus('not-a-real-id', 'delivered');
    const afterShipments = useAppStore.getState().shipments;
    expect(afterShipments).toEqual(beforeShipments);
  });

  it('notifies on both channels when the customer opted into email and SMS', () => {
    // Customer c1 (shipment s1) has notifyByEmail = true and notifyBySms = true
    useAppStore.getState().updateShipmentStatus('s1', 'out_for_delivery');

    const sent = useAppStore.getState().notifications;
    expect(sent.map((n) => n.channel).sort()).toEqual(['email', 'sms']);
    expect(sent.every((n) => n.trackingNumber)).toBe(true);
  });

  it('sends a reschedule confirmation gated by notification preferences', () => {
    const newDate = new Date(Date.now() + 24 * 3600_000).toISOString();

    // Customer c2 (shipment s2) is email-only
    useAppStore.getState().rescheduleShipment('s2', newDate, 'Leave at reception');

    const sent = useAppStore.getState().notifications;
    expect(sent).toHaveLength(1);
    expect(sent[0].channel).toBe('email');
    expect(sent[0].subject).toContain('Rescheduled');
    expect(sent[0].body).toContain('Leave at reception');
  });

  it('starts notifications unread and supports marking them read', () => {
    useAppStore.getState().pushNotification({
      channel: 'email',
      to: 'someone@example.com',
      subject: 'Test',
      body: 'Body',
    });
    const n = useAppStore.getState().notifications.at(-1);
    expect(n?.read).toBe(false);

    useAppStore.getState().markAllNotificationsRead();
    expect(useAppStore.getState().notifications.every((x) => x.read)).toBe(true);
  });

  it('creates a shipment with the next tracking number and notifies the customer', () => {
    const before = useAppStore.getState().shipments;
    const maxTn = Math.max(
      ...before.map((s) => Number.parseInt(s.trackingNumber.split('-')[1], 10))
    );

    const created = useAppStore.getState().createShipment({
      customerId: 'c2',
      priority: 'express',
      weight: 2.5,
      scheduledDelivery: new Date(Date.now() + 24 * 3600_000).toISOString(),
    });

    expect(created).toBeDefined();
    expect(created?.trackingNumber).toBe(`LGX-${maxTn + 1}`);
    expect(created?.status).toBe('pending');
    // Destination falls back to the customer's address on file
    expect(created?.destination).toBe('15 Duplication Rd, Colombo 04');
    expect(useAppStore.getState().shipments).toHaveLength(before.length + 1);

    // c2 is email-only, so exactly one creation notification goes out
    const sent = useAppStore.getState().notifications;
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toContain('Shipment created');
  });

  it('creates an assigned shipment when a driver is chosen', () => {
    const created = useAppStore.getState().createShipment({
      customerId: 'c1',
      priority: 'standard',
      weight: 1,
      scheduledDelivery: new Date(Date.now() + 24 * 3600_000).toISOString(),
      driverId: 'd2',
    });

    expect(created?.status).toBe('assigned');
    expect(created?.driverId).toBe('d2');
    expect(created?.history.map((h) => h.status)).toEqual(['pending', 'assigned']);
  });

  it('refuses to create a shipment for an unknown customer', () => {
    const before = useAppStore.getState().shipments.length;
    const created = useAppStore.getState().createShipment({
      customerId: 'nope',
      priority: 'standard',
      weight: 1,
      scheduledDelivery: new Date().toISOString(),
    });
    expect(created).toBeUndefined();
    expect(useAppStore.getState().shipments).toHaveLength(before);
  });

  it('preserves existing special instructions when rescheduling without new ones', () => {
    const before = useAppStore.getState().getShipmentById('s3');
    const existingInstructions = before?.specialInstructions;
    const newDate = new Date(Date.now() + 12 * 3600_000).toISOString();

    useAppStore.getState().rescheduleShipment('s3', newDate);

    const after = useAppStore.getState().getShipmentById('s3');
    expect(after?.scheduledDelivery).toBe(newDate);
    expect(after?.specialInstructions).toBe(existingInstructions);
  });
});
