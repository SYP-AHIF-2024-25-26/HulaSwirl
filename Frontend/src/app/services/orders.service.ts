import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  isOperator(): Promise<boolean> {
    return firstValueFrom(this.http.get<boolean>('/api/v1/users/is-operator'));
  }

  confirm(orderId: number): Promise<void> {
    return firstValueFrom(this.http.put<void>(`/api/v1/orders/confirm/${orderId}`, {}));
  }

  cancel(orderId: number): Promise<void> {
    return firstValueFrom(this.http.put<void>(`/api/v1/orders/cancel/${orderId}`, {}));
  }
}
