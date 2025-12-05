import {effect, inject, Injectable, signal} from '@angular/core';
import {IncomingOrder, OrdersService} from './orders.service';
import {UserService} from './user.service';

const TRACKED_KEY = 'trackedOrders';

@Injectable({
  providedIn: 'root'
})
export class OrderQueueService {
  private readonly ordersService = inject(OrdersService);
  private readonly userService = inject(UserService);
  private readonly lastKnownStatuses = new Map<number, number>();
  private statusTimeout?: number;
  private hasReceivedSnapshot = false;

  trackedOrderIds = signal<number[]>(this.loadTrackedIds());
  statusMessage = signal<string | null>(null);
  messageLocked = signal<boolean>(false);

  constructor() {
    effect(() => {
      const username = this.userService.username();
      if (!username) {
        this.clearTrackedOrders();
        this.clearStatusMessage();
      }
    });

    effect(() => {
      const orders = this.ordersService.allOrders();
      this.updateTrackedStatuses(orders);
    });
  }

  trackOrder(order: IncomingOrder | null): void {
    if (!order) return;
    if (order.user !== this.userService.username()) return;
    const updated = Array.from(new Set([...this.trackedOrderIds(), order.id]));
    this.trackedOrderIds.set(updated);
    this.persistTrackedIds(updated);
    this.lastKnownStatuses.set(order.id, order.status);
  }

  private updateTrackedStatuses(allOrders: IncomingOrder[]): void {
    const tracked = this.trackedOrderIds();
    if (tracked.length === 0) return;

    if (!this.hasReceivedSnapshot) {
      this.hasReceivedSnapshot = true;
      if (allOrders.length === 0) return;
    }

    if (allOrders.length === 0) {
      this.clearTrackedOrders();
      return;
    }

    const pendingIds: number[] = [];
    const orderMap = new Map(allOrders.map(order => [order.id, order]));

    tracked.forEach(id => {
      const order = orderMap.get(id);
      if (!order) {
        this.lastKnownStatuses.delete(id);
        return;
      }
      const previousStatus = this.lastKnownStatuses.get(id) ?? order.status;
      if (previousStatus === 0 && order.status !== 0) {
        this.handleStatusChange(order.status);
      }
      this.lastKnownStatuses.set(id, order.status);
      if (order.status === 0) {
        pendingIds.push(id);
      }
    });

    if (pendingIds.length !== tracked.length) {
      this.trackedOrderIds.set(pendingIds);
      this.persistTrackedIds(pendingIds);
    }

    const pendingSet = new Set(pendingIds);
    this.lastKnownStatuses.forEach((_value, key) => {
      if (!pendingSet.has(key)) {
        this.lastKnownStatuses.delete(key);
      }
    });
  }

  private handleStatusChange(status: number): void {
    const message = status === 1 ? 'Your drink is being mixed' : 'Your order has been canceled';
    this.statusMessage.set(message);
    this.messageLocked.set(true);
    window.clearTimeout(this.statusTimeout);
    this.statusTimeout = window.setTimeout(() => {
      this.clearStatusMessage();
    }, 5000);
  }

  private clearStatusMessage(): void {
    this.statusMessage.set(null);
    this.messageLocked.set(false);
  }

  private clearTrackedOrders(): void {
    this.trackedOrderIds.set([]);
    this.persistTrackedIds([]);
    this.lastKnownStatuses.clear();
    this.hasReceivedSnapshot = false;
  }

  private loadTrackedIds(): number[] {
    try {
      const raw = localStorage.getItem(TRACKED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tracked orders', e);
      return [];
    }
  }

  private persistTrackedIds(ids: number[]): void {
    localStorage.setItem(TRACKED_KEY, JSON.stringify(ids));
  }
}
