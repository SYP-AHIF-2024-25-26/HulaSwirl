import {Component, inject, WritableSignal} from '@angular/core';
import {IncomingOrder, OrdersService} from '../services/orders.service';
import { firstValueFrom } from 'rxjs';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {ErrorService} from '../services/error.service';
import {ErrorHandlingComponent} from '../services/error-handling';



@Component({
  selector: 'app-order-terminal',
  imports: [
    DatePipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './order-terminal.component.html',
  standalone: true,
  styleUrl: './order-terminal.component.css'
})
export class OrderTerminalComponent extends ErrorHandlingComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly statusService = inject(ErrorService);
  public orders: WritableSignal<IncomingOrder[]> = this.ordersService.orders;

  ngOnInit(): void {
    this.connectWebSocket();
  }

  getIngredientColor(name: string): string {
    const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  getHeight(amount: number): number {
    return Math.min(amount / 500 * 100, 100);
  }

  getTotal(ings: { amount: number }[]): number {
    return ings.reduce((sum, i) => sum + i.amount, 0);
  }
  connectWebSocket(): void {
    this.ordersService.connectWebSocket()
  }
  async confirm(id: number) {
    try {
      const duration = await this.ordersService.confirm(id);
      this.orders.set(this.orders().map(o => {
        if (o.id === id) {
          return {...o, status: 1, orderDate: new Date(Date.now() + duration * 1000).toISOString()};
        }
        return o;
      }));
      this.statusService.showProgress(duration);
    } catch (e) {
      this.statusService.handleError(
        e,
        () => {},
        m => this.setGlobalError(m),
      );
    }
  }

  async cancel(id: number) {
    try {
      await firstValueFrom(this.ordersService.cancel(id));
      this.orders.set(this.orders().filter(o => o.id !== id));
    } catch (e) {
      this.statusService.handleError(
        e,
        () => {},
        m => this.setGlobalError(m)
      );
    }
  }

  override setGlobalError(message: string) {
    this.statusService.showMessage(message);
  }

  override setFieldError(target: string, message: string) {
    this.statusService.showMessage(message);
  }

  override clearFieldError(field: string) { }

  ngOnDestroy(): void {
    this.ordersService.disconnectWebSocket();
  }
}
