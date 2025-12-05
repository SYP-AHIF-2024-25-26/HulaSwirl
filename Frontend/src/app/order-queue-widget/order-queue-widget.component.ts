import {Component, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {OrdersService, IncomingOrder} from '../services/orders.service';
import {OrderQueueService} from '../services/order-queue.service';
import {UserService} from '../services/user.service';

interface TimelineEntry {
  order: IncomingOrder;
  position: number;
  isUser: boolean;
}

@Component({
  selector: 'app-order-queue-widget',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass],
  templateUrl: './order-queue-widget.component.html',
  styleUrl: './order-queue-widget.component.css'
})
export class OrderQueueWidgetComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly orderQueueService = inject(OrderQueueService);
  private readonly userService = inject(UserService);

  timelineOpen = signal(false);
  position = signal<{ x: number; y: number }>({
    x: window.innerWidth - 180,
    y: window.innerHeight - 220
  });
  isDragging = signal(false);
  private dragStart = { x: 0, y: 0 };
  private dragOrigin = { x: 0, y: 0 };
  private holdTimeout?: number;
  private hasMoved = false;

  constructor() {
    effect(() => {
      if (this.orderQueueService.statusMessage()) {
        this.timelineOpen.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.ordersService.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.ordersService.disconnectWebSocket();
    window.clearTimeout(this.holdTimeout);
  }

  shouldShowBubble(): boolean {
    return !!this.orderQueueService.statusMessage() || this.getTrackedPendingOrders().length > 0;
  }

  isLocked(): boolean {
    return this.orderQueueService.messageLocked();
  }

  toggleTimeline(event?: Event) {
    event?.stopPropagation();
    if (this.orderQueueService.messageLocked()) return;
    if (this.isDragging() || this.hasMoved) return;
    this.timelineOpen.update(open => !open);
  }

  getBubbleText(): string {
    const statusMessage = this.orderQueueService.statusMessage();
    if (statusMessage) {
      return statusMessage;
    }
    const position = this.getLowestUserPosition();
    if (position !== null) {
      return `Your drink is at position ${position}`;
    }
    return 'You have no pending drinks';
  }

  get timelineEntries(): TimelineEntry[] {
    const pending = this.ordersService.orders();
    const username = this.userService.username();
    return pending.map((order, index) => ({
      order,
      position: index + 1,
      isUser: order.user === username
    }));
  }

  onPointerDown(event: PointerEvent) {
    this.holdTimeout = window.setTimeout(() => {
      this.isDragging.set(true);
    }, 180);
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.dragOrigin = { ...this.position() };
    this.hasMoved = false;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDragging()) return;
    event.preventDefault();
    const deltaX = event.clientX - this.dragStart.x;
    const deltaY = event.clientY - this.dragStart.y;
    const nextX = this.dragOrigin.x + deltaX;
    const nextY = this.dragOrigin.y + deltaY;
    this.position.set(this.keepWithinBounds(nextX, nextY));
    this.hasMoved = true;
  }

  onPointerUp() {
    window.clearTimeout(this.holdTimeout);
    if (this.isDragging()) {
      this.isDragging.set(false);
    }
  }

  trackByOrderId(index: number, entry: TimelineEntry) {
    return entry.order.id ?? index;
  }

  private getTrackedPendingOrders(): IncomingOrder[] {
    const pending = this.ordersService.orders();
    const tracked = new Set(this.orderQueueService.trackedOrderIds());
    const username = this.userService.username();
    return pending.filter(order => tracked.has(order.id) && order.user === username);
  }

  private getLowestUserPosition(): number | null {
    const pending = this.ordersService.orders();
    const userOrders = this.getTrackedPendingOrders();
    const positions = userOrders
      .map(order => pending.findIndex(o => o.id === order.id) + 1)
      .filter(pos => pos > 0);
    return positions.length > 0 ? Math.min(...positions) : null;
  }

  private keepWithinBounds(x: number, y: number): { x: number; y: number } {
    const margin = 20;
    const maxX = window.innerWidth - margin;
    const maxY = window.innerHeight - margin;
    const boundedX = Math.min(Math.max(margin, x), maxX);
    const boundedY = Math.min(Math.max(margin, y), maxY);
    return { x: boundedX, y: boundedY };
  }
}
