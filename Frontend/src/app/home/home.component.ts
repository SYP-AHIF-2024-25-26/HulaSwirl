import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {firstValueFrom, single} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Drink, DrinkService} from '../drink.service';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  C_isModalOpen = false;
  C_newIngredients = signal<Ingredient[]>([]);
  C_newLiquidAmount = signal('0');
  allAvailableIngredients = signal<Ingredient[]>([]);
  C_newIngredientName = signal('Choose Ingredient');
  K_bestDrinks = signal<Drink[]>([]);
  D_allDrinks = signal<Drink[]>([]);
  filteredDrinks = signal<Drink[]>(this.D_allDrinks());
  searchQuery: string = '';
  selectedIngredient: string = '';

  async ngOnInit() {
    //this.allAvailableIngredients.set(await this.ingredientService.getAllIngredients());
    //this.C_newIngredients.set(await this.ingredientService.getAllIngredients());//kommt nacher weg
    this.K_bestDrinks.set(await this.drinkService.getDrinks());
    this.D_allDrinks.set(await this.drinkService.getDrinks());
    this.filteredDrinks.set(await this.drinkService.getDrinks());
  }

  C_openModal() {
    this.C_isModalOpen = true;
  }
  C_closeModal() {
    this.C_isModalOpen = false;
  }
  C_onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.C_closeModal();
    }
  }
  C_cancel() {
    this.C_closeModal();
  }
  async C_Order() {
    try {
      await this.ingredientService.postOrder(this.C_newIngredients().map((ingredient) => {
        return {
          Name: ingredient.name,
          Amount: ingredient.remainingMl
        }
      }));
    } catch (e) {
      // console.error(e);
    }
  }

  K_currentSlide = signal(1);
  K_nextSlide(): void {
    if (this.K_currentSlide() < this.K_bestDrinks().length - 1) {
      this.K_currentSlide.set(this.K_currentSlide() + 1);
    }
  }
  K_prevSlide(): void {
    if (this.K_currentSlide() > 0) {
      this.K_currentSlide.set(this.K_currentSlide() - 1);
    }
  }
  K_getSlidePosition(index: number): string {
    const totalSlides = this.K_bestDrinks().length;
    const previousIndex = (this.K_currentSlide() - 1 + totalSlides) % totalSlides;
    const nextIndex = (this.K_currentSlide() + 1) % totalSlides;
    if (index === this.K_currentSlide()) return 'center';
    if (index === previousIndex || index === nextIndex) return 'side';
    return 'hidden'; // All others
  }
  K_isPrevDisabled(): boolean {
    return this.K_currentSlide() === 0;
  }
  K_isNextDisabled(): boolean {
    return this.K_currentSlide() === this.K_bestDrinks().length - 1;
  }

  @ViewChild('targetElement', { static: false }) targetElement!: ElementRef;

  scrollToElement() {
    this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  D_searchDrinks() {
    this.filteredDrinks.set(
      this.D_allDrinks().filter(drink =>
        drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  // Getränke nach Zutaten filtern
  D_filterDrinks() {
    if (this.selectedIngredient) {
      this.filteredDrinks.set(
        this.D_allDrinks().filter(drink =>
          drink.ingredients.some(ing => ing.name === this.selectedIngredient)
        )
      );
    } else {
      this.filteredDrinks.set(this.D_allDrinks());
    }
  }

  // Eindeutige Zutaten für Dropdown extrahieren
  D_getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.D_allDrinks().forEach(drink => {
      drink.ingredients.forEach(ing => ingredientsSet.add(ing.name));
    });
    return Array.from(ingredientsSet);
  }
}
