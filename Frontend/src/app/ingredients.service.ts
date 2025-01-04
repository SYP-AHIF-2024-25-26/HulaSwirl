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
  constructor() { }
  async getAllIngredients(): Promise<Ingredient[]> {
    return [{
      name: 'Gin',
      slot: 0,
      remaining_liquid: 200
    }, {
      name: 'Vodka',
      slot: 1,
      remaining_liquid: 200
    }, {
      name: 'Rakija',
      slot: 2,
      remaining_liquid: 200
    }, {
      name: 'Liqör',
      slot: 3,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }, {
      name: 'Apfelkuchen',
      slot: 4,
      remaining_liquid: 200
    }

    ];
  }
}
