import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {IncomingOrder, OrdersService} from '../services/orders.service';
import {UserService} from '../services/user.service';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-order-queue',
  standalone: true,
  imports: [],
  templateUrl: './order-queue.component.html',
  styleUrl: './order-queue.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderQueueComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly userService = inject(UserService);

  protected readonly orderedPending = computed(() =>
    this.ordersService
      .orders()
      .slice()
      .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
  );

  protected readonly username = computed(() => this.userService.username());
  protected readonly userPendingOrders = computed(() =>
    this.orderedPending().filter(order => order.user === this.username())
  );

  protected readonly lowestUserPosition = computed(() => {
    const all = this.orderedPending();
    const userOrders = this.userPendingOrders();
    if (!this.username() || userOrders.length === 0) {
      return null;
    }
    const positions = userOrders
      .map(order => all.findIndex(o => o.id === order.id))
      .filter(idx => idx >= 0)
      .map(idx => idx + 1);
    return positions.length > 0 ? Math.min(...positions) : null;
  });

  protected readonly bubbleHasContent = computed(() =>
    this.statusMessage() !== null || this.lowestUserPosition() !== null
  );

  protected readonly isTimelineOpen = signal(false);
  protected readonly isDragging = signal(false);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly lockInteraction = signal(false);
  protected readonly trackedOrderIds = signal<number[]>([]);

  protected readonly bubblePosition = signal<Position>({x: 20, y: 80});

  private dragStart?: Position;
  private elementStart?: Position;
  private dragPointerId?: number;
  // Threshold in Pixeln, ab wann eine Bewegung als Drag gilt
  private readonly DRAG_THRESHOLD = 5;
  private hasMovedBeyondThreshold = false;

  private trackedStatuses = new Map<number, number>();
  private statusTimeout?: number;

  constructor() {
    this.ordersService.connectWebSocket();
    effect(() => {
      this.handleStatusUpdates(this.ordersService.allOrders());
    });
  }

  // Diese Methode wird jetzt programmgesteuert aufgerufen, nicht mehr direkt im HTML click
  protected toggleTimeline() {
    if (this.lockInteraction()) {
      return;
    }

    this.isTimelineOpen.update(v => !v);
  }

  protected isUserOrder(order: IncomingOrder): boolean {
    return !!this.username() && order.user === this.username();
  }

  protected onPointerDown(event: PointerEvent) {
    // Verhindert Standard-Drag-Verhalten von Browsern (z.B. bei Bildern)
    event.preventDefault();
    this.dragPointerId = event.pointerId;
    this.dragStart = {x: event.clientX, y: event.clientY};
    this.elementStart = {...this.bubblePosition()};
    this.hasMovedBeyondThreshold = false;

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(this.dragPointerId);
  }

  protected onPointerMove(event: PointerEvent) {
    if (this.dragPointerId !== event.pointerId || !this.dragStart || !this.elementStart) {
      return;
    }

    const deltaX = event.clientX - this.dragStart.x;
    const deltaY = Math.max(event.clientY, 160) - this.dragStart.y;

    // Prüfen, ob wir die Schwelle überschritten haben
    if (!this.hasMovedBeyondThreshold) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > this.DRAG_THRESHOLD) {
        this.hasMovedBeyondThreshold = true;
        this.isDragging.set(true);
      }
    }

    // Position nur aktualisieren, wenn wir wirklich draggen
    if (this.hasMovedBeyondThreshold) {
      this.bubblePosition.set({
        x: this.elementStart.x + deltaX,
        y: this.elementStart.y + deltaY
      });
    }
  }

  protected onPointerUp(event: PointerEvent) {
    if (this.dragPointerId !== event.pointerId) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    target.releasePointerCapture(event.pointerId);

    // Wenn wir nicht gedragged haben (also nur kurz gedrückt), ist es ein Klick
    if (!this.hasMovedBeyondThreshold && !this.isDragging()) {
      this.toggleTimeline();
    }

    this.isDragging.set(false);
    this.dragPointerId = undefined;
    this.dragStart = undefined;
    this.elementStart = undefined;
    this.hasMovedBeyondThreshold = false;
  }

  private handleStatusUpdates(allOrders: IncomingOrder[]) {
    // ... Logik bleibt identisch ...
    const username = this.username();
    if (!username) {
      this.trackedStatuses.clear();
      this.trackedOrderIds.set([]);
      this.statusMessage.set(null);
      this.lockInteraction.set(false);
      this.isTimelineOpen.set(false);
      return;
    }

    const userOrders = allOrders.filter(order => order.user === username);
    const orderStatusMap = new Map<number, number>();
    userOrders.forEach(order => orderStatusMap.set(order.id, order.status));

    userOrders.forEach(order => {
      const previousStatus = this.trackedStatuses.get(order.id);
      if (order.status === 0) {
        this.trackedStatuses.set(order.id, 0);
      } else if (previousStatus === 0) {
        this.showStatusMessage(order.status);
        this.trackedStatuses.delete(order.id);
      }
    });

    for (const trackedId of Array.from(this.trackedStatuses.keys())) {
      if (!orderStatusMap.has(trackedId)) {
        this.trackedStatuses.delete(trackedId);
      }
    }

    this.trackedOrderIds.set(Array.from(this.trackedStatuses.keys()));
  }

  private showStatusMessage(status: number) {
    if (this.statusTimeout) {
      window.clearTimeout(this.statusTimeout);
    }
    const text = status === 1 ? '✔' : '❌';
    this.statusMessage.set(text);
    this.lockInteraction.set(true);
    this.isTimelineOpen.set(false);

    this.statusTimeout = window.setTimeout(() => {
      this.statusMessage.set(null);
      this.lockInteraction.set(false);
    }, 5000);
  }

  protected shrinkName(name: string, length: number = 12): string {
    const maxLength = length;
    if (name.length <= maxLength) {
      return name;
    }
    return name.slice(0, maxLength - 3) + '...';
  }
}
