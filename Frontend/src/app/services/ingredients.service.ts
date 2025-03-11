import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';

export const liquidIngredients: Ingredient[] = [
  {
    ingredientName: 'Apple Juice',
    pumpSlot: 1,
    remainingMl: 1000,
    maxMl: 1000
  },
  {
    ingredientName: 'Water',
    pumpSlot: 2,
    remainingMl: 2000,
    maxMl: 2000
  },
  {
    ingredientName: 'Sugar Syrup',
    pumpSlot: 3,
    remainingMl: 500,
    maxMl: 500
  },
  {
    ingredientName: 'Mint Leaves',
    pumpSlot: 4,
    remainingMl: 100,
    maxMl: 100
  }
];

export interface Ingredient {
  ingredientName: string;
  pumpSlot: number | null;
  remainingMl: number;
  maxMl: number;
}

export interface OrderPreparation {
  Name: string;
  Amount: number;
  Status: string;
}

export interface OrderDto {
  Name: string;
  Amount: number;
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

  async postOrder(ingredients: OrderDto[]): Promise<void> {
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks/order", ingredients));
    await this.reloadIngredients();
  }

  async saveIngredients(ingredients:Ingredient[]){
    this.ingredients.set(ingredients);
    await firstValueFrom(this.httpClient.patch(environment.apiUrl + "/ingredients/inBottle/edit", ingredients));
  }
}
