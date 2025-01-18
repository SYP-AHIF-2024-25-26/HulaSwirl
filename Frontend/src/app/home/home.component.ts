import {Component, inject, signal} from '@angular/core';
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
  drinks = signal<Drink[]>([]);


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

  async ngOnInit() {
    //this.allAvailableIngredients.set(await this.ingredientService.getAllIngredients());
    //this.C_newIngredients.set(await this.ingredientService.getAllIngredients());//kommt nacher weg
    this.drinks.set(await this.drinkService.getDrinks());

  }


  currentSlide = signal(1);

  nextSlide(): void {
    if (this.currentSlide() < this.drinks().length - 1) {
      this.currentSlide.set(this.currentSlide() + 1);
    }
  }

  prevSlide(): void {
    if (this.currentSlide() > 0) {
      this.currentSlide.set(this.currentSlide() - 1);
    }
  }

  getSlidePosition(index: number): string {
    const totalSlides = this.drinks().length;

    const previousIndex = (this.currentSlide() - 1 + totalSlides) % totalSlides;
    const nextIndex = (this.currentSlide() + 1) % totalSlides;

    if (index === this.currentSlide()) return 'center'; // Current active slide
    if (index === previousIndex || index === nextIndex) return 'side'; // Previous or next slide
    return 'hidden'; // All others
  }

  isPrevDisabled(): boolean {
    return this.currentSlide() === 0;
  }

  isNextDisabled(): boolean {
    return this.currentSlide() === this.drinks().length - 1;
  }
}
