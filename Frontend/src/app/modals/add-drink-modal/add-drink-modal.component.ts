import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DrinkBase, DrinkService} from '../../services/drink.service';
import {StatusService} from '../../services/status.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-drink-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-drink-modal.component.html',
  standalone: true,
  styleUrls: ['./add-drink-modal.component.css']
})
export class AddDrinkModalComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);
  private readonly errorService = inject(StatusService);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);

  imageBase64: string  = "";

  isDragging = false;
  allIngredients: Ingredient[] = [];

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      this.availableIngredients.set(
        this.allIngredients.filter(ing =>
          !this.orderIngredients().some(i => i.ingredientName === ing.ingredientName)
        )
      );

      this.selectIngredient();
    });
  }

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : '');
  }

  deleteIngredient(index: number) {
    const ing = this.orderIngredients()[index];
    if (ing) {
      this.orderIngredients.set(
        this.orderIngredients().filter((_, i) => i !== index)
      );
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
      if (availableIng) {
        this.availableIngredients.set([
          ...this.availableIngredients(),
          availableIng
        ]);
      }
      this.selectIngredient();
    }
  }

  addIngredient() {
    const avIng = this.availableIngredients().find(
      ing => ing.ingredientName === this.selectedIngredient()
    );
    if (avIng &&
      this.selectedAmount() > 0 &&
      this.selectedAmount() <= 500
    ) {
      this.availableIngredients.set(
        this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient())
      );
      this.orderIngredients.set([
        ...this.orderIngredients(),
        { ingredientName: this.selectedIngredient(), amount: this.selectedAmount(), status: '' }
      ]);

      this.selectIngredient();
      this.selectedAmount.set(10);
    }
    else{
      this.orderIngredients.set([
        ...this.orderIngredients(),
        { ingredientName: "New Ingredient", amount: this.selectedAmount(), status: 'New Ingredient' }
      ]);
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  async submitDrink() {
    try {
      if (this.orderIngredients().every(ing => ing.status === '' || ing.status === 'New Ingredient')) {
        const drinkData: DrinkBase = {
          name: this.drinkTitle(),
          imgUrl: this.imageBase64,
          available: true,
          toppings: this.drinkToppings(),
          drinkIngredients: this.orderIngredients().map(ing => ({
            ingredientName: ing.ingredientName,
            amount: ing.amount
          }))
        };
        await this.drinkService.postNewDrink(drinkData);
        this.closeModal();
      }
    } catch (e: unknown) {
      this.errorService.handleError(e);
    }
  }

  closeModal() {
    this.modalService.closeModal();
    this.drinkTitle.set('');
    this.drinkToppings.set('');
    this.orderIngredients.set([]);
    this.imageBase64 = "";
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.readFile(input.files![0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
    this.readFile(event.dataTransfer.files[0]);
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
