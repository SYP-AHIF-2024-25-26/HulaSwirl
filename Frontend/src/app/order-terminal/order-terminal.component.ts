import {Component, inject, signal, WritableSignal} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {IncomingOrder, OrdersService} from '../services/orders.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {UserService} from '../services/user.service';



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
  private ws!: WebSocket;
  public orders: WritableSignal<IncomingOrder[]> = signal([]);

  ngOnInit(): void {
    this.connectWebSocket();
  }
  connectWebSocket(): void {
    const token = this.userService.getTokenFromStorage();
    if (!token) {
      console.error('kein JWT im Storage – WS nicht verbunden');
      return;
    }
    const wsUrl = `${environment.wsURL}`;
    this.ws = new WebSocket(wsUrl,      [`Bearer ${token}`]);
    this.ws.onmessage = evt => {
      const all: IncomingOrder[] = JSON.parse(evt.data);
      this.orders.set(all.filter(o => o.status === 0));
    };
    this.ws.onerror = () => console.error('WS-Error OrderTerminal');
  }
  confirm(id: number) {
    this.ordersService.confirm(id).subscribe(() => {
      // lokal wegfiltern
      this.orders.set(this.orders().filter(o => o.id !== id));
    });
  }

  cancel(id: number) {
    this.ordersService.cancel(id).subscribe(() => {
      this.orders.set(this.orders().filter(o => o.id !== id));
    });
  }

  ngOnDestroy(): void {
    this.ws.close();
  }

}
