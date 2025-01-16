import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../environments/environment';

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
    let res = await firstValueFrom(this.httpClient.get<Ingredient[]>(environment.apiUrl + '/admin/ingredients'));
    console.log(res);
    return res;
  }

  async postOrder(ingredients: Order[]): Promise<void> {
    await firstValueFrom(this.httpClient.post(environment.apiUrl + "/drinks/order", ingredients));
  }

  async saveIngredients(ingredients:Ingredient[]){

  }
}
