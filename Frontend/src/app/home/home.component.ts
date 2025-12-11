import {Component, effect, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {FormsModule} from '@angular/forms';
import {Drink, DrinkService} from '../services/drink.service';
import {ModalService, ModalType} from '../services/modal.service';
import {ErrorService} from '../services/error.service';

import {FpsService} from '../services/fps.service';
import {StatisticsService} from '../services/statistics.service';
import {OrderQueueComponent} from '../order-queue/order-queue.component';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    OrderQueueComponent
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
  filteredDrinks = signal<Drink[]>(this.allAvailableDrinks());
  currentSlideIdx = signal(0);
  lowEndDetected = this.fpsService.lowEndDetected;
  searchQuery: string = '';
  selectedIngredient: string = '';

  constructor() {
    effect(() => {
      this.allAvailableIngredients.set(this.ingredientService.ingredients().filter(ing => ing.pumpSlot !== null));
      this.allAvailableDrinks.set(this.drinkService.drinks().filter(drink =>
        drink.available &&
        drink.drinkIngredients.every(ing => this.allAvailableIngredients().some(availableIng => availableIng.ingredientName === ing.ingredientName))
      ));
      this.filteredDrinks.set(this.allAvailableDrinks());
      const top5drinkNames = this.statisticsService.drinkStats().slice(0, 5).map(stat => stat.drinkName);
      if(top5drinkNames.length > 0) {
        this.recommendedDrinks.set(this.allAvailableDrinks().filter(drink => top5drinkNames.includes(drink.name)));
      } else {
        this.recommendedDrinks.set(this.allAvailableDrinks().slice(0, 5));
      }
    });
  }

  openModal(modal: ModalType, data: any = null) {
    this.modalService.openModal(modal, data);
  }

  @ViewChild('targetElement', { static: false }) targetElement!: ElementRef;
  scrollToElement() {
    this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start',alignToTop:true });
  }

  nextSlide(): void {
    if(this.currentSlideIdx() < this.recommendedDrinks().length - 1) {
      this.currentSlideIdx.set(this.currentSlideIdx() + 1);
    }
  }
  prevSlide(): void {
    if (this.currentSlideIdx() > 0) {
      this.currentSlideIdx.set(this.currentSlideIdx() - 1);
    }
  }

  getSlideState(index: number): string {
    const totalSlides = this.recommendedDrinks().length;
    const previousIndex = (this.currentSlideIdx() - 1 + totalSlides) % totalSlides;
    const nextIndex = (this.currentSlideIdx() + 1) % totalSlides;
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
    return this.currentSlideIdx() === 0;
  }
  isNextDisabled(): boolean {
    return this.currentSlideIdx() >= this.recommendedDrinks().length - 1;
  }

  filterDrinksByQuery() {
    this.filteredDrinks.set(
      this.allAvailableDrinks().filter(drink =>
        drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  filterDrinksByIngredients() {
    if (this.selectedIngredient) {
      this.filteredDrinks.set(
        this.allAvailableDrinks().filter(drink =>
          drink.drinkIngredients.some(ing => ing.ingredientName === this.selectedIngredient)
        )
      );
    } else {
      this.filteredDrinks.set(this.allAvailableDrinks());
    }
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
