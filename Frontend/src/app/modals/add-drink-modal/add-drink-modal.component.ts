import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DrinkBase, DrinkService} from '../../services/drink.service';

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

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');
  imageBase64: string | null = null;
  isDragging = false;
  allIngredients: Ingredient[] = [];

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
    });
  }

  async ngOnInit() {
    this.availableIngredients.set(
      this.allIngredients.filter(ing => ing.pumpSlot !== null)
    );
    this.selectIngredient();
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
    if (
      avIng &&
      avIng.remainingAmount >= this.selectedAmount() &&
      this.selectedAmount() > 0 &&
      this.selectedAmount() <= 100
    ) {
      this.orderIngredients.set([
        ...this.orderIngredients(),
        { ingredientName: this.selectedIngredient(), amount: this.selectedAmount(), status: '' }
      ]);
      this.availableIngredients.set(
        this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient())
      );
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    this.orderIngredients.set(
      this.orderIngredients().map(ing => {
        const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
        if (!availableIng) {
          return { ...ing, status: 'Unbekannte Zutat' };
        }
        if (ing.amount < 0) {
          return { ...ing, status: 'Negativer Wert nicht erlaubt' };
        }
        if (ing.amount > 100) {
          return { ...ing, status: 'Maximal 100 ml pro Zutat' };
        }
        if (ing.amount > availableIng.remainingAmount) {
          return {
            ...ing,
            status: `Nur noch ${availableIng.remainingAmount}ml verfügbar`
          };
        }
        return { ...ing, status: '' };
      })
    );
  }

  async submitDrink() {
    this.validateOrder();
    if (this.orderIngredients().every(ing => ing.status === '')) {
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
  }

  closeModal() {
    this.modalService.closeModal();
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
