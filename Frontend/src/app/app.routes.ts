import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {DrinksComponent} from './drinks/drinks.component';
import {IngredientsComponent} from './ingredients/ingredients.component';
import {StatisticsComponent} from './statistics/statistics.component';

export const routes: Routes = [
  {path: '', pathMatch:'full',redirectTo: 'Home'},
  {path: 'Home', component: HomeComponent},
  {path: 'Admin/Drinks',component: DrinksComponent},
  {path: 'Admin/Ingredients',component: IngredientsComponent},
  {path: 'Admin/Statistics',component: StatisticsComponent},
];
