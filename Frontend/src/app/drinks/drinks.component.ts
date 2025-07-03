import {Component, computed, effect, inject, signal, WritableSignal} from '@angular/core';
import {Drink, DrinkService} from '../services/drink.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {ModalService, ModalType} from '../services/modal.service';
import {ErrorService} from '../services/error.service';

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
  private readonly errorService = inject(ErrorService);
  protected readonly ModalType = ModalType;

  filteredDrinks = signal<Drink[]>([]);
  searchQuery: string = '';
  selectedIngredient: string = '';
  allDrinks = signal<Drink[]>([]);
  allAvailableIngredients = signal<Ingredient[]>([]);
  imageLoading: WritableSignal<Record<number, boolean>> = signal({});

  getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.allDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.ingredientName));
    });
    return Array.from(ingredientsSet);
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
    if(this.searchQuery) {
      this.filteredDrinks.set(
        this.filteredDrinks().filter(drink =>
          drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      );
    }
  }

  constructor(){
    effect(() => {
      const allDrinks = this.drinkService.drinks();
      this.allAvailableIngredients.set(this.ingredientService.ingredients().filter(ing => ing.pumpSlot !== null));
      this.allDrinks.set(allDrinks);
      const loadingMap: Record<number, boolean> = {};
      allDrinks.forEach(d => loadingMap[d.id] = true);
      this.imageLoading.set(loadingMap);
      this.filterDrinks();
    });
  }
  onImageLoad(id: number) {
    const map = {...this.imageLoading()};
    map[id] = false;
    this.imageLoading.set(map);
  }
  openModal(m:ModalType,data:any=null) {
    this.modalService.openModal(m,data)
  }
}
