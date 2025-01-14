import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface Ingredient  {
  name:string,
  slot:number,
  remainingMl:number
}

export interface Order {
  Name: string;
  Amount: number;
}


@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private readonly httpClient = inject(HttpClient);
  constructor() {
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    let res = await firstValueFrom(this.httpClient.get<Ingredient[]>('http://172.18.4.108:5000/api/admin/ingredients'));
    console.log(res);
    return res;
  }

  async postOrder(ingredients: Order[]): Promise<void> {
    console.log(ingredients);
    await firstValueFrom(this.httpClient.post('http://172.18.4.108:5000/api/drinks/order', ingredients));
  }

  async saveIngredients(ingredients:Ingredient[]){

  }
}
