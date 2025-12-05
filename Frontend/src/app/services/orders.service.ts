import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {BASE_URL, WS_URL} from '../app.config';
import {UserService} from './user.service';

export interface OrderIngredient {
  ingredientName: string;
  amount: number;
}

export interface IncomingOrder {
  drinkName: string;
  id: number;
  orderDate: string;
  orderIngredients: OrderIngredient[];
  status: 0 | 1 | 2;
  user: string;
  containsIce: boolean;
  totalAmount: number | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private apiBaseUrl = inject(BASE_URL);
  private wsUrl = inject(WS_URL);
  private readonly userService =inject(UserService);
  private ws?: WebSocket;
  private connectionCounter = 0;
  public orders = signal<IncomingOrder[]>([]);
  public allOrders = signal<IncomingOrder[]>([]);

  connectWebSocket(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.connectionCounter++;
      return;
    }

    this.connectionCounter++;
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = evt => {
      const all: IncomingOrder[] = JSON.parse(evt.data);
      all.forEach(order => {
        order.totalAmount = order.orderIngredients.reduce((sum, ingredient) => {
          return sum + (ingredient.amount || 0);
        }, 0);
      });
      const sortedOrders = all.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
      this.allOrders.set(sortedOrders);
      this.orders.set(sortedOrders.filter(o => o.status === 0));
    };
    this.ws.onclose = () => {
      this.connectionCounter = 0;
      this.allOrders.set([]);
      this.orders.set([]);
    };
    this.ws.onerror = () => console.error('WS-Error OrderTerminal');
  }
  disconnectWebSocket(): void {
    if (this.connectionCounter > 0) {
      this.connectionCounter--;
    }
    if (this.connectionCounter === 0) {
      this.ws?.close();
      this.ws = undefined;
    }
  }

  async confirm(orderId: number) {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    return await firstValueFrom(this.http.put<number>(this.apiBaseUrl+`/orders/confirm/${orderId}`, {},{headers}));
  }

  cancel(orderId: number): Observable<void> {
    const jwt = this.userService.getTokenFromStorage();
    const headers = {
      Authorization: `Bearer ${jwt}`
    };
    return this.http.put<void>(this.apiBaseUrl+`/orders/cancel/${orderId}`, {},{headers});
  }
}
