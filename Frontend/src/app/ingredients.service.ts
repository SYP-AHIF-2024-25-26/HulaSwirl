import {Injectable} from '@angular/core';

export interface Ingredient  {
  name:string,
  slot:number,
  remaining_liquid:number
}


@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private testIngredients:Ingredient[];
  constructor() {
    let testIngredients: Ingredient[];
    this.testIngredients = [
      {name: 'Gin', slot: 1, remaining_liquid: 200},
      {name: 'Vodka', slot: 2, remaining_liquid: 200},
      {name: 'Rakija', slot: 3, remaining_liquid: 200},
      {name: 'Liqör', slot: 4, remaining_liquid: 200},
    ];
/*      {name: 'Wasser', slot: 5, remaining_liquid: 200},
      {name: 'Apfelsaft', slot: 0, remaining_liquid: 200},*/
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return Array.from(this.testIngredients);
  }
  async saveIngredients(ingredients:Ingredient[]){
    this.testIngredients = Array.from(ingredients);
  }
}
