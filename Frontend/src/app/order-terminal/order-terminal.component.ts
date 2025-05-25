import {Component, inject, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IncomingOrder, OrdersService} from '../services/orders.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {UserService} from '../services/user.service';
import {BASE_URL} from '../app.config';



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
  private apiBaseUrl = inject(BASE_URL);
  public orders: WritableSignal<IncomingOrder[]> = this.ordersService.orders;

  ngOnInit(): void {
    this.connectWebSocket();
  }
  connectWebSocket(): void {
    this.ordersService.connectWebSocket()
  }
  confirm(id: number) {
    this.ordersService.confirm(id).subscribe(() => {
      this.orders.set(this.orders().filter(o => o.id !== id));
    });
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
