import {Component, inject, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IncomingOrder, OrdersService} from '../services/orders.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {UserService} from '../services/user.service';
import {BASE_URL} from '../app.config';
import {StatusService} from '../services/status.service';



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
export class OrderTerminalComponent {
  private readonly userService   = inject(UserService);
  private readonly ordersService = inject(OrdersService);
  private readonly statusService = inject(StatusService);
  private apiBaseUrl = inject(BASE_URL);
  public orders: WritableSignal<IncomingOrder[]> = this.ordersService.orders;

  ngOnInit(): void {
    this.connectWebSocket();
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
      this.statusService.handleError(e);
    }
  }

  cancel(id: number) {
    this.ordersService.cancel(id).subscribe(() => {
      this.orders.set(this.orders().filter(o => o.id !== id));
    });
  }

  ngOnDestroy(): void {
    this.ordersService.disconnectWebSocket();
  }

}
