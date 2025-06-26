import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {DrinksComponent} from './drinks/drinks.component';
import {IngredientsComponent} from './ingredients/ingredients.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {OrderTerminalComponent} from './order-terminal/order-terminal.component';
import {UserManagementComponent} from './user-management/user-management.component';

export const routes: Routes = [
  {path: '', pathMatch:'full',redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'drinks',component: DrinksComponent},
  {path: 'ingredients',component: IngredientsComponent},
  {path: 'statistics',component: StatisticsComponent},
  {path: 'orders',component: OrderTerminalComponent},
  {path: 'users', component: UserManagementComponent},
];
