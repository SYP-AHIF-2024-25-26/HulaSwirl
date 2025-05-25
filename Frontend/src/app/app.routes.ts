import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {DrinksComponent} from './drinks/drinks.component';
import {IngredientsComponent} from './ingredients/ingredients.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {OrderTerminalComponent} from './order-terminal/order-terminal.component';

export const routes: Routes = [
  {path: '', pathMatch:'full',redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'admin/drinks',component: DrinksComponent},
  {path: 'admin/ingredients',component: IngredientsComponent},
  {path: 'admin/statistics',component: StatisticsComponent},
  {path: 'admin/orderTerminal',component: OrderTerminalComponent},
];
