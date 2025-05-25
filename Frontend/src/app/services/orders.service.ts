import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface OrderIngredient {
  id: number;
  drinkId: number | null;
  ingredientNameFk: string;
  amount: number;
}

export interface IncomingOrder {
  id: number;
  user: string;
  orderDate: string;
  drinkName: string;
  drinkIngredients: OrderIngredient[];
  status: 0 | 1 | 2;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  confirm(orderId: number): Observable<void> {
    return this.http.put<void>(environment.apiUrl+`/orders/confirm/${orderId}`, {});
  }

  cancel(orderId: number): Observable<void> {
    return this.http.put<void>(environment.apiUrl+`/orders/cancel/${orderId}`, {});
  }
}
