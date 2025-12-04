import {Component, effect, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {FormsModule} from '@angular/forms';
import {Drink, DrinkService} from '../services/drink.service';
import {ModalService, ModalType} from '../services/modal.service';
import {NgForOf} from '@angular/common';
import {FpsService} from '../services/fps.service';
import {StatisticsService} from '../services/statistics.service';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);
  private readonly fpsService = inject(FpsService);
  private readonly statisticsService = inject(StatisticsService);

  allAvailableDrinks = signal<Drink[]>([]);
  allAvailableIngredients = signal<Ingredient[]>([]);
  recommendedDrinks = signal<Drink[]>([]);
  filteredDrinks = signal<Drink[]>([]);
  currentSlideIdx = signal(0);
  lowEndDetected = this.fpsService.lowEndDetected;
  searchQuery: string = '';
  selectedIngredient: string = '';

  constructor() {
    effect(() => {
      const availableIngredients = this.ingredientService.ingredients().filter(ing => ing.pumpSlot !== null);
      this.allAvailableIngredients.set(availableIngredients);

      const availableDrinks = this.drinkService.drinks().filter(drink =>
        drink.available &&
        drink.drinkIngredients.every(ing =>
          this.allAvailableIngredients().some(availableIng => availableIng.ingredientName === ing.ingredientName)
        )
      );

      this.allAvailableDrinks.set(availableDrinks);
      this.applyFilters();

      const top5drinkNames = this.statisticsService.drinkStats().slice(0, 5).map(stat => stat.drinkName);
      if (top5drinkNames.length > 0) {
        this.recommendedDrinks.set(this.allAvailableDrinks().filter(drink => top5drinkNames.includes(drink.name)));
      } else {
        this.recommendedDrinks.set(this.allAvailableDrinks().slice(0, 5));
      }

      this.currentSlideIdx.set(0);
    });
  }

  openModal(modal: ModalType, data: any = null) {
    this.modalService.openModal(modal, data);
  }

  @ViewChild('targetElement', { static: false }) targetElement!: ElementRef;
  scrollToElement() {
    this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', alignToTop: true });
  }

  nextSlide(): void {
    if(this.recommendedDrinks().length < 2) return;
    if(this.currentSlideIdx() < this.recommendedDrinks().length - 1) {
      this.currentSlideIdx.set(this.currentSlideIdx() + 1);
    }
  }
  prevSlide(): void {
    if(this.recommendedDrinks().length < 2) return;
    if (this.currentSlideIdx() > 0) {
      this.currentSlideIdx.set(this.currentSlideIdx() - 1);
    }
  }

  getSlideState(index: number): string {
    const totalSlides = this.recommendedDrinks().length;
    const previousIndex = (this.currentSlideIdx() - 1 + totalSlides) % totalSlides;
    const nextIndex = (this.currentSlideIdx() + 1) % totalSlides;
    if (totalSlides === 0) return 'hidden';
    if (index === this.currentSlideIdx()) return 'focus';
    if (
      this.currentSlideIdx() > 0 && this.currentSlideIdx() < totalSlides - 1 &&
      (index === previousIndex || index === nextIndex) ||
      (this.currentSlideIdx() === 0 && (index === nextIndex + 1 || index === nextIndex)) ||
      (this.currentSlideIdx() === totalSlides - 1 && (index === previousIndex - 1 || index === previousIndex))
    ) return 'neighbour';
    return 'hidden';
  }

  isPrevDisabled(): boolean {
    return this.currentSlideIdx() === 0 || this.recommendedDrinks().length < 2;
  }
  isNextDisabled(): boolean {
    return this.recommendedDrinks().length < 2 || this.currentSlideIdx() >= this.recommendedDrinks().length - 1;
  }

  applyFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    const selected = this.selectedIngredient;

    const filtered = this.allAvailableDrinks().filter(drink => {
      const matchesQuery = !query || drink.name.toLowerCase().includes(query);
      const matchesIngredient = !selected || drink.drinkIngredients.some(ing => ing.ingredientName === selected);
      return matchesQuery && matchesIngredient;
    });

    this.filteredDrinks.set(filtered);
  }

  getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.allAvailableDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.ingredientName));
    });
    return Array.from(ingredientsSet);
  }

  protected readonly ModalType = ModalType;
}
