import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {BASE_URL} from '../app.config';
import {UserService} from './user.service';

export interface DrinkStat {
  drinkName: string;
  count: number;
  totalAmount: number;
}

export interface IngredientStat {
  ingredientName: string;
  usageCount: number;
  totalAmount: number;
}

export interface UserDrinkCount {
  drinkName: string;
  count: number;
}

export interface UserStat {
  user: string;
  totalOrders: number;
  drinks: UserDrinkCount[];
}

export interface IntervalStat {
  intervalStart: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private apiBaseUrl = inject(BASE_URL);

  drinkStats: WritableSignal<DrinkStat[]> = signal([]);
  ingredientStats: WritableSignal<IngredientStat[]> = signal([]);
  userStats: WritableSignal<UserStat[]> = signal([]);
  intervalStats: WritableSignal<IntervalStat[]> = signal([]);

  private get headers() {
    const jwt = this.userService.getTokenFromStorage();
    return { Authorization: `Bearer ${jwt}` };
  }

  async loadAll(start?: string, end?: string) {
    await Promise.all([
      this.loadDrinkStats(start, end),
      this.loadIngredientStats(start, end),
      this.loadUserStats(start, end),
      this.loadIntervalStats(start, end)
    ]);
  }

  private rangeParams(start?: string, end?: string) {
    const params: any = {};
    if (start) params.start = start;
    if (end) params.end = end;
    return params;
  }

  async loadDrinkStats(start?: string, end?: string) {
    this.drinkStats.set(
      await firstValueFrom(this.http.get<DrinkStat[]>(`${this.apiBaseUrl}/statistics/drinks`, {
        headers: this.headers,
        params: this.rangeParams(start, end)
      }))
    );
  }

  async loadIngredientStats(start?: string, end?: string) {
    this.ingredientStats.set(
      await firstValueFrom(this.http.get<IngredientStat[]>(`${this.apiBaseUrl}/statistics/ingredients`, {
        headers: this.headers,
        params: this.rangeParams(start, end)
      }))
    );
  }

  async loadUserStats(start?: string, end?: string) {
    this.userStats.set(
      await firstValueFrom(this.http.get<UserStat[]>(`${this.apiBaseUrl}/statistics/users`, {
        headers: this.headers,
        params: this.rangeParams(start, end)
      }))
    );
  }

  async loadIntervalStats(start?: string, end?: string) {
    this.intervalStats.set(
      await firstValueFrom(this.http.get<IntervalStat[]>(`${this.apiBaseUrl}/statistics/recent-orders`, {
        headers: this.headers,
        params: this.rangeParams(start, end)
      }))
    );
  }
}
