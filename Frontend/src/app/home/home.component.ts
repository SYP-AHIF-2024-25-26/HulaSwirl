import {Component, effect, ElementRef, inject, Signal, signal, ViewChild, WritableSignal} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {Ingredient, IngredientsService} from '../ingredients.service';
import {firstValueFrom, single} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Drink, DrinkService} from '../drink.service';
import {OrderCustomDrinkModalComponent} from '../order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from '../order-drink-modal/order-drink-modal.component';
import {ModalServiceService} from '../modal-service.service';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
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
  private readonly modalService = inject(ModalServiceService);

  allAvailableIngredients = signal<Ingredient[]>([]);

  K_bestDrinks = signal<Drink[]>([]);
  D_allDrinks = signal<Drink[]>([]);
  filteredDrinks = signal<Drink[]>(this.D_allDrinks());
  K_currentSlide = signal(1);
  searchQuery: string = '';
  selectedIngredient: string = '';

  async ngOnInit() {
    this.allAvailableIngredients.set((await this.ingredientService.getAllIngredients()).filter(ing => ing.slot !== null));
    this.K_bestDrinks.set((await this.drinkService.getDrinks()).slice(0, 5));
    this.D_allDrinks.set(await this.drinkService.getDrinks());
    this.filteredDrinks.set(await this.drinkService.getDrinks());
  }

  openModal(modal: "ODC" | "OD", data: any = null) {
    this.modalService.openModal(modal, data);
  }

  @ViewChild('targetElement', { static: false }) targetElement!: ElementRef;
  scrollToElement() {
    this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start',alignToTop:true });
  }

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
  D_getUniqueIngredients(): string[] {
    const ingredientsSet = new Set<string>();
    this.D_allDrinks().filter(d => d != null).forEach(drink => {
      drink.drinkIngredients.forEach(ing => ingredientsSet.add(ing.name));
    });
    return Array.from(ingredientsSet);
  }
}
