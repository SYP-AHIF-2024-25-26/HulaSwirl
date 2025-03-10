import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';


export const liquidIngredients: Ingredient[] = [
  { name: "Water", slot: 1, remainingMl: 1000, maxMl: 1000 },       // in milliliters (ml)
  { name: "Milk", slot: 2, remainingMl: 500, maxMl: 500 },         // in milliliters (ml)
  { name: "Olive Oil", slot: 3, remainingMl: 250, maxMl: 250 },     // in milliliters (ml)
  { name: "Lemon Juice", slot: 4, remainingMl: 200, maxMl: 200 },   // in milliliters (ml)
  { name: "Soy Sauce", slot: null, remainingMl: 150, maxMl: 150 },     // in milliliters (ml)
  { name: "Vinegar", slot: 6, remainingMl: 300, maxMl: 300 },       // in milliliters (ml)
  { name: "Coconut Milk", slot: 7, remainingMl: 400, maxMl: 400 },  // in milliliters (ml)
  { name: "Honey", slot: 8, remainingMl: 350, maxMl: 350 },         // in milliliters (ml)
  { name: "Vanilla Extract", slot: 9, remainingMl: 50, maxMl: 100 }, // in milliliters (ml)
  { name: "Whipping Cream", slot: 10, remainingMl: 600, maxMl: 600 }  // in milliliters (ml)
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
