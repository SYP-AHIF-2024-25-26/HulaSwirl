import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';


export const liquidIngredients: Ingredient[] = [
  {
    name: 'Apple Juice',
    slot: 1,
    remainingMl: 1000,
    maxMl: 1000
  },
  {
    name: 'Water',
    slot: 2,
    remainingMl: 2000,
    maxMl: 2000
  },
  {
    name: 'Sugar Syrup',
    slot: 3,
    remainingMl: 500,
    maxMl: 500
  },
  {
    name: 'Mint Leaves',
    slot: 4,
    remainingMl: 100,
    maxMl: 100
  }
];


export interface Ingredient {
  name: string;
  slot: number | null;
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
    this.ingredients.set(liquidIngredients);
    /*
    try {
      this.ingredients.set(await firstValueFrom(this.httpClient.get<Ingredient[]>(environment.apiUrl + '/admin/ingredients')));
    } catch (e) {
      console.error("Using default ingredients", e);
      this.ingredients.set(liquidIngredients);
    }
     */
    this.ingredients.update(ings => ings.map(ing => ({ ...ing, slot: ing.slot && ing.slot <= this.ingredientSlots ? ing.slot : null })));
  }

  async postOrder(ingredients: OrderDto[]): Promise<void> {
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks/order", ingredients));
    await this.reloadIngredients();
  }

  async saveIngredients(ingredients:Ingredient[]){
    this.ingredients.set(ingredients);
    await firstValueFrom(this.httpClient.put(environment.apiUrl + "/admin/ingredients", ingredients));
  }
}
