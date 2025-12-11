import { Routes } from '@angular/router';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

export const routes: Routes = [
  {path: '', pathMatch:'full',redirectTo: 'home'},
  {path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)},
  {path: 'drinks', loadComponent: () => import('./drinks/drinks.component').then(m => m.DrinksComponent)},
  {path: 'ingredients', loadComponent: () => import('./ingredients/ingredients.component').then(m => m.IngredientsComponent)},
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics.component').then(m => m.StatisticsComponent),
    providers: [provideCharts(withDefaultRegisterables())]
  },
  {path: 'orders', loadComponent: () => import('./order-terminal/order-terminal.component').then(m => m.OrderTerminalComponent)},
  {path: 'users', loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)},
];
