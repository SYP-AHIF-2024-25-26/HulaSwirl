import {Component, effect, ElementRef, inject, Signal, signal, ViewChild, WritableSignal} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {FormsModule} from '@angular/forms';
import {Drink, DrinkService} from '../services/drink.service';
import {ModalService, ModalType} from '../services/modal.service';

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

  allDrinks = signal<Drink[]>([]);
  allAvailableIngredients = signal<Ingredient[]>([]);

  recommendedDrinks = signal<Drink[]>([]);
  filteredDrinks = signal<Drink[]>(this.allDrinks());
  currentSlideIdx = signal(1);
  searchQuery: string = '';
  selectedIngredient: string = '';

  constructor() {
    effect(() => {
      this.allAvailableIngredients.set(this.ingredientService.ingredients().filter(ing => ing.slot !== null));
    });
  }

  async ngOnInit() {
    this.recommendedDrinks.set((await this.drinkService.getDrinks()).slice(0, 5));
    this.allDrinks.set(await this.drinkService.getDrinks());
    this.filteredDrinks.set(await this.drinkService.getDrinks());
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
    if (index === previousIndex || index === nextIndex) return 'neighbour';
    return 'hidden';
  }

  isPrevDisabled(): boolean {
    return this.currentSlideIdx() === 0;
  }
  isNextDisabled(): boolean {
    return this.currentSlideIdx() === this.recommendedDrinks().length - 1;
  }

  filterDrinksByQuery() {
    this.filteredDrinks.set(
      this.allDrinks().filter(drink =>
        drink.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  filterDrinksByIngredients() {
    if (this.selectedIngredient) {
      this.filteredDrinks.set(
        this.allDrinks().filter(drink =>
          drink.drinkIngredients.some(ing => ing.name === this.selectedIngredient)
        )
      );
    } else {
      this.filteredDrinks.set(this.allDrinks());
    }
  }

  getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.allDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.name));
    });
    return Array.from(ingredientsSet);
  }

  protected readonly ModalType = ModalType;
}
