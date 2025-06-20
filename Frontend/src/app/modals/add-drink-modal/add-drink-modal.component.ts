import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import {
  ChangingDrinkIngredient,
  Ingredient,
  IngredientsService,
  OrderPreparation
} from '../../services/ingredients.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DrinkBase, DrinkService} from '../../services/drink.service';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-drink-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-drink-modal.component.html',
  standalone: true,
  styleUrls: ['./add-drink-modal.component.css']
})
export class AddDrinkModalComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  drinkIngredients: WritableSignal<ChangingDrinkIngredient[]> = signal([]);
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');
  selectedIngredient: WritableSignal<string> = signal("");
  selectedAmount: WritableSignal<number> = signal(1);

  drinkTitleError: WritableSignal<string> = signal('');
  drinkIngredientsError: WritableSignal<string> = signal('');

  imageBase64: string  = "";

  isDragging = false;
  allIngredients: Ingredient[] = [];

  constructor() {
    super();
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      this.availableIngredients.set(
        this.allIngredients.filter(ing =>
          !this.drinkIngredients().some(i => i.ingredientName === ing.ingredientName)
        )
      );

      this.selectIngredient();
    });
  }

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : "newIngredient");
  }

  deleteIngredient(index: number) {
    const ing = this.drinkIngredients()[index];
    if (ing) {
      this.clearFieldError(ing.ingredientName);
      this.clearGlobalError();
      this.drinkIngredients.set(
        this.drinkIngredients().filter((_, i) => i !== index)
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
    this.clearFieldError("ingredients");
    if (avIng &&
      this.selectedAmount() > 0 &&
      this.selectedAmount() <= 500
    ) {
      this.availableIngredients.set(
        this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient())
      );
      this.drinkIngredients.set([
        ...this.drinkIngredients(),
        { ingredientName: this.selectedIngredient(), amount: this.selectedAmount(), status: '', type: 'existing' }
      ]);

      this.selectIngredient();
      this.selectedAmount.set(10);
    }
    else{
      this.drinkIngredients.set([
        ...this.drinkIngredients(),
        { ingredientName: "New Ingredient", amount: this.selectedAmount(), status: '', type: 'new' }
      ]);
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  async submitDrink() {
    this.clearGlobalError();
    this.drinkIngredients.set(this.drinkIngredients().map(i => ({ ...i, status: "" })));
    try {
      if (this.drinkIngredients().every(ing => ing.status === "" || ing.status === "New Ingredient")) {
        const drinkData: DrinkBase = {
          name: this.drinkTitle(),
          imgUrl: this.imageBase64,
          available: true,
          toppings: this.drinkToppings(),
          drinkIngredients: this.drinkIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount }))
        };
        await this.drinkService.postNewDrink(drinkData);
        this.closeModal();
      }
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  setFieldError(fieldName: string, message: string) {
    if(fieldName == "name") {
      this.drinkTitleError.set(message);
      return;
    }
    if(fieldName == "ingredients") {
      this.drinkIngredientsError.set(message);
      return;
    }
    const idx = this.drinkIngredients().toReversed().findIndex(i => i.ingredientName.toLowerCase() === fieldName);
    if (idx >= 0) {
      const arr = [...this.drinkIngredients().toReversed()];
      arr[idx] = { ...arr[idx], status: message };
      this.drinkIngredients.set(arr.toReversed());
    }
  }

  clearFieldError(fieldName: string = '') {
    if (fieldName) {
      if( fieldName === 'name') {
        this.drinkTitleError.set('');
      } else {
        this.drinkIngredientsError.set('');
        const updated = this.drinkIngredients().map(i =>
          i.ingredientName === fieldName ? {...i, status: ''} : i
        );
        this.drinkIngredients.set(updated);
      }
    } else {
      this.drinkIngredients.set(this.drinkIngredients().map(i => ({ ...i, status: '' })));
      this.drinkTitleError.set('');
      this.drinkIngredientsError.set('');
    }
  }

  closeModal() {
    this.modalService.closeModal();
    this.drinkTitle.set('');
    this.drinkToppings.set('');
    this.drinkIngredients.set([]);
    this.availableIngredients.set([]);
    this.selectedIngredient.set('');
    this.selectedAmount.set(0);
    this.clearFieldError();
    this.clearGlobalError();
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
