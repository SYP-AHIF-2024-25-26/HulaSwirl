import {Component, computed, inject, signal} from '@angular/core';
import {Drink, DrinkService} from '../drink.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {ModalServiceService} from '../modal-service.service';

@Component({
  selector: 'app-drinks',
  imports: [
    FormsModule,
    NgForOf,
    NgIf],
  templateUrl: './drinks.component.html',
  standalone: true,
  styleUrl: './drinks.component.css'
})
export class DrinksComponent {
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalServiceService);


  filteredDrinks = signal<Drink[]>([]);

  searchQuery: string = '';
  selectedIngredient: string = '';
  D_allDrinks = signal<Drink[]>([]);
  allAvailableIngredients = signal<Ingredient[]>([]);


  D_getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.D_allDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.name));
    });
    return Array.from(ingredientsSet);
  }

  D_searchDrinks() {
    this.filteredDrinks.set(
      this.D_allDrinks().filter(drink =>
        drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }
  D_filterDrinks() {
    if (this.selectedIngredient) {
      this.filteredDrinks.set(
        this.D_allDrinks().filter(drink =>
          drink.drinkIngredients.some(ing => ing.name === this.selectedIngredient)
        )
      );
    } else {
      this.filteredDrinks.set(this.D_allDrinks());
    }
  }

  async ngOnInit(){
    this.D_allDrinks.set(await this.drinkService.getDrinks());
    this.filteredDrinks.set(await this.drinkService.getDrinks());
    this.allAvailableIngredients.set((await this.ingredientService.getAllIngredients()).filter(ing => ing.slot !== null));
    console.log(this.filteredDrinks+"help");
  }
  openModal(drink: Drink) {
this.modalService.openModal("OD",drink)
  }
}
