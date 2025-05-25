import {Component, inject, signal, WritableSignal} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

interface IncomingOrder {
  id: number;
  drinkName?: string;
  ingredients?: { ingredientName: string; amount: number }[];
  username: string;
}

@Component({
  selector: 'app-order-terminal',
  imports: [],
  templateUrl: './order-terminal.component.html',
  standalone: true,
  styleUrl: './order-terminal.component.css'
})
export class OrderTerminalComponent {
  private readonly httpClient = inject(HttpClient);
  public orders = signal<IncomingOrder[]>([]);
  private ws!: WebSocket;
  connectWebSocket(): void {
    this.ws = new WebSocket(environment.wsURL);
    this.ws.onmessage = evt => this.orders.set(JSON.parse(evt.data));
  }

}
