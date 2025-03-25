import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';

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
  ingredients: WritableSignal<Ingredient[]> = signal([]);
  readonly ingredientSlots = 2;

  async reloadIngredients(){
    try {
      this.ingredients.set(await firstValueFrom(this.httpClient.get<Ingredient[]>(environment.apiUrl + '/ingredients/inBottle')));
    } catch (e) {
      console.error("Using default ingredients", e);
      this.ingredients.set(liquidIngredients);
    }
    this.ingredients.update(ings => ings.map(ing => ({ ...ing, pumpSlot: ing.pumpSlot && ing.pumpSlot <= this.ingredientSlots ? ing.pumpSlot : null })));
  }

  async postOrder(ingredients: DrinkIngredient[]): Promise<void> {
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks/order", ingredients));
    await this.reloadIngredients();
  }

  async saveIngredients(ingredients:Ingredient[]){
    this.ingredients.set(ingredients);
    console.log(ingredients);
    await firstValueFrom(this.httpClient.patch(environment.apiUrl + "/ingredients/inBottle/edit", ingredients));
  }
}
