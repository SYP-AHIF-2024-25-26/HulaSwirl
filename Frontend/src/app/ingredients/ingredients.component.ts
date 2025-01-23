import {Component, Signal, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Ingredient} from '../ingredients.service';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule
  ],
  templateUrl: './ingredients.component.html',
  standalone: true,
  styleUrl: './ingredients.component.css'
})
export class IngredientsComponent {
  avIngredients: Signal<Ingredient[]> = signal([
    {name: 'Water', slot: 1, remainingMl: 1000},
    {name: 'Milk', slot: 2, remainingMl: 500},
    {name: 'Olive Oil', slot: 3, remainingMl: 250},
    {name: 'Lemon Juice', slot: 4, remainingMl: 200},
    {name: 'Soy Sauce', slot: 5, remainingMl: 150},
  ]);
}
