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
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private apiBaseUrl = inject(BASE_URL);
  private wsUrl = inject(WS_URL);
  private readonly userService =inject(UserService);
  private ws!: WebSocket;
  public orders = signal<IncomingOrder[]>([]);

  connectWebSocket(): void {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = evt => {
      const all: IncomingOrder[] = JSON.parse(evt.data);
      this.orders.set(all.filter(o => o.status === 0));
      console.log(this.orders());
    };
    this.ws.onerror = () => console.error('WS-Error OrderTerminal');
  }
  disconnectWebSocket(): void {
    this.ws?.close();
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
