import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {StatusService} from './status.service';
import {UserService} from './user.service';
import {BASE_URL} from '../app.config';

export interface DrinkIngredient {
  ingredientName: string;
  amount: number;
}

export interface Ingredient {
  ingredientName: string;
  pumpSlot: number | null;
  remainingAmount: number;
  maxAmount: number;
}

export interface OrderPreparation extends DrinkIngredient {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private readonly httpClient = inject(HttpClient);
  private readonly errorService = inject(StatusService);
  private readonly userService=inject(UserService)
  private apiBaseUrl = inject(BASE_URL);
  ingredients: WritableSignal<Ingredient[]> = signal([]);
  readonly ingredientSlots = 2;

  async loadIngredients(){
    try {
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      this.ingredients.set(await firstValueFrom(this.httpClient.get<Ingredient[]>(this.apiBaseUrl + '/ingredients',{headers})));
      this.ingredients.update(ings => ings.map(ing => ({ ...ing, pumpSlot: ing.pumpSlot && ing.pumpSlot <= this.ingredientSlots ? ing.pumpSlot : null })));
    } catch (e) {
      console.error(`An error occurred while loading ingredients.`, e);
    }
  }

  async postOrder(ingredients: DrinkIngredient[]): Promise<number|null> {
    const todo="Posting an custom-drink-order"
    try{
      console.log(todo)
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      const res=await firstValueFrom(this.httpClient.post<number>(this.apiBaseUrl + "/orders/custom-drink", ingredients,{headers}));
      await this.loadIngredients();
      return res;
    }
    catch (e: unknown) {
      this.errorService.handleError(e, todo);
      return null;
    }
  }

  async saveIngredients(ingredients:Ingredient[]){
    const todo="Saving ingredient settings"
    try{
      console.log(todo);
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      this.ingredients.set(ingredients);
        await firstValueFrom(this.httpClient.patch(this.apiBaseUrl + "/ingredients", ingredients, {headers}));
    }
    catch (e: unknown) {
      this.errorService.handleError(e, todo);
    }
  }
}
