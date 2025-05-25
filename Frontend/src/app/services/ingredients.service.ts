import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {StatusService} from './status.service';
import {UserService} from './user.service';
import {BASE_URL} from '../app.config';

export const liquidIngredients: Ingredient[] = [
  {
    ingredientName: 'Apple Juice',
    pumpSlot: 1,
    remainingAmount: 1000,
    maxAmount: 1000
  },
  {
    ingredientName: 'Water',
    pumpSlot: 2,
    remainingAmount: 2000,
    maxAmount: 2000
  },
  {
    ingredientName: 'Sugar Syrup',
    pumpSlot: 3,
    remainingAmount: 500,
    maxAmount: 500
  },
  {
    ingredientName: 'Mint Leaves',
    pumpSlot: 4,
    remainingAmount: 100,
    maxAmount: 100
  }
];

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

  async reloadIngredients(){
    const todo= 'Reloading ingredients.'
    try {
      console.log(todo);
      const jwt = this.userService.getTokenFromStorage();
      const headers = {
        Authorization: `Bearer ${jwt}`
      };
      this.ingredients.set(await firstValueFrom(this.httpClient.get<Ingredient[]>(this.apiBaseUrl + '/ingredients',{headers})));
    } catch (e) {
      console.error(`An error occurred while ${todo}, placeholders will be shown.`, e);
      this.ingredients.set(liquidIngredients);
    }
    this.ingredients.update(ings => ings.map(ing => ({ ...ing, pumpSlot: ing.pumpSlot && ing.pumpSlot <= this.ingredientSlots ? ing.pumpSlot : null })));
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
      await this.reloadIngredients();
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
