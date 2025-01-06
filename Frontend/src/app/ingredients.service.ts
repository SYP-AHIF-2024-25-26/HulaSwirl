import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface Ingredient  {
  name:string,
  slot:number,
  remaining_liquid:number
}


@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private readonly httpClient = inject(HttpClient);
  constructor() {
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    let res = await firstValueFrom(this.httpClient.get<Ingredient[]>('https://localhost:7212/api/admin/ingredients'));
    console.log(res);
    return res;
  }
  async saveIngredients(ingredients:Ingredient[]){

  }
}
