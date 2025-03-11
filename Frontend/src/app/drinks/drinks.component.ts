import {Component, computed, inject, signal} from '@angular/core';
import {Drink, DrinkService} from '../services/drink.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {ModalService, ModalType} from '../services/modal.service';

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
  private readonly modalService = inject(ModalService);
  protected readonly ModalType = ModalType;

  filteredDrinks = signal<Drink[]>([]);
  searchQuery: string = '';
  selectedIngredient: string = '';
  allDrinks = signal<Drink[]>([]);
  allAvailableIngredients = signal<Ingredient[]>([]);


  getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.allDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.ingredientName));
    });
    return Array.from(ingredientsSet);
  }

  searchDrinks() {
    this.filteredDrinks.set(
      this.allDrinks().filter(drink =>
        drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }
  filterDrinks() {
    if (this.selectedIngredient) {
      this.filteredDrinks.set(
        this.allDrinks().filter(drink =>
          drink.drinkIngredients.some(ing => ing.ingredientName === this.selectedIngredient)
        )
      );
    } else {
      this.filteredDrinks.set(this.allDrinks());
    }
  }

  async ngOnInit(){
    this.allDrinks.set(await this.drinkService.getDrinks());
    this.filteredDrinks.set(await this.drinkService.getDrinks());
    //this.allAvailableIngredients.set((await this.ingredientService.getAllIngredients()).filter(ing => ing.slot !== null));
    console.log(this.filteredDrinks+"help");
  }
  openModal(m:ModalType,data:any=null) {
this.modalService.openModal(m,data)
  }


}
