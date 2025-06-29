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

  async loadAll() {
    await Promise.all([
      this.loadDrinkStats(),
      this.loadIngredientStats(),
      this.loadUserStats(),
      this.loadIntervalStats()
    ]);
  }

  async loadDrinkStats() {
    this.drinkStats.set(
      await firstValueFrom(this.http.get<DrinkStat[]>(`${this.apiBaseUrl}/statistics/drinks`, {headers: this.headers}))
    );
  }

  async loadIngredientStats() {
    this.ingredientStats.set(
      await firstValueFrom(this.http.get<IngredientStat[]>(`${this.apiBaseUrl}/statistics/ingredients`, {headers: this.headers}))
    );
  }

  async loadUserStats() {
    this.userStats.set(
      await firstValueFrom(this.http.get<UserStat[]>(`${this.apiBaseUrl}/statistics/users`, {headers: this.headers}))
    );
  }

  async loadIntervalStats() {
    this.intervalStats.set(
      await firstValueFrom(this.http.get<IntervalStat[]>(`${this.apiBaseUrl}/statistics/recent-orders`, {headers: this.headers}))
    );
  }
}
