import {Component, effect, inject, signal, WritableSignal, Inject} from '@angular/core';
import { UniversalModalService } from '../../shared/modal/universal-modal.service';
import { MODAL_DATA, MODAL_ID } from '../../shared/modal/modal.tokens';
import {
  ChangingDrinkIngredient,
  Ingredient,
  IngredientsService,
} from '../../services/ingredients.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Drink, DrinkBase, DrinkService } from '../../services/drink.service';
import { ErrorHandlingComponent } from '../../services/error-handling';

export interface DrinkModalData {
  mode: 'add' | 'edit';
  drink?: Drink;
}

@Component({
  selector: 'app-drink-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './drink-modal.component.html',
  standalone: true,
  styleUrls: ['./drink-modal.component.css'],
})

export class DrinkModalComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modal = inject(UniversalModalService);
  private readonly modalId = inject(MODAL_ID);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  drinkIngredients: WritableSignal<ChangingDrinkIngredient[]> = signal([]);
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);

  drinkTitleError: WritableSignal<string> = signal('');
  drinkIngredientsError: WritableSignal<string> = signal('');

  imageBase64: string = '';
  drinkAvailable = signal(true);

  isDragging = false;
  allIngredients: Ingredient[] = [];

  mode: WritableSignal<'add' | 'edit'> = signal('add');
  currentDrink: WritableSignal<Drink | null> = signal(null);
  private dataloaded = false;

  constructor(@Inject(MODAL_DATA) modalData: DrinkModalData) {
    super();
    this.mode.set(modalData.mode);
    if (modalData.drink) {
      this.currentDrink.set(modalData.drink);
      this.drinkIngredients.set(
        modalData.drink.drinkIngredients.map(di => ({
          ingredientName: di.ingredientName,
          amount: di.amount,
          status: '',
          type: 'existing',
        }))
      );
      this.drinkTitle.set(modalData.drink.name);
      this.drinkToppings.set(modalData.drink.toppings);
      this.imageBase64 = modalData.drink.imgUrl;
      this.drinkAvailable.set(modalData.drink.available);
      this.dataloaded = true;
    }

    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      this.availableIngredients.set(
        this.allIngredients.filter(
          ing => !this.drinkIngredients().some(i => i.ingredientName === ing.ingredientName)
        )
      );
      this.selectIngredient();
    });
  }

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : 'newIngredient');
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
          availableIng,
        ]);
      }
      this.selectIngredient();
    }
  }

  addIngredient() {
    const avIng = this.availableIngredients().find(
      ing => ing.ingredientName === this.selectedIngredient()
    );
    this.clearFieldError('ingredients');
    if (avIng && this.selectedAmount() > 0 && this.selectedAmount() <= 500) {
      this.availableIngredients.set(
        this.availableIngredients().filter(
          ing => ing.ingredientName !== this.selectedIngredient()
        )
      );
      this.drinkIngredients.set([
        ...this.drinkIngredients(),
        {
          ingredientName: this.selectedIngredient(),
          amount: this.selectedAmount(),
          status: '',
          type: 'existing',
        },
      ]);

      this.selectIngredient();
      this.selectedAmount.set(10);
    } else {
      this.drinkIngredients.set([
        ...this.drinkIngredients(),
        {
          ingredientName: 'New Ingredient',
          amount: this.selectedAmount(),
          status: '',
          type: 'new',
        },
      ]);
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  async submitDrink() {
    this.clearGlobalError();
    this.clearFieldError();
    try {
      if (this.drinkIngredients().every(ing => ing.status === '')) {
        const drinkData: DrinkBase = {
          name: this.drinkTitle(),
          imgUrl: this.imageBase64,
          available: this.mode() === 'edit' ? this.drinkAvailable() : true,
          toppings: this.drinkToppings(),
          drinkIngredients: this.drinkIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount })),
        };
        if (this.mode() === 'add') {
          await this.drinkService.postNewDrink(drinkData);
        } else if (this.currentDrink()) {
          await this.drinkService.editDrink(drinkData, this.currentDrink()!.id);
        }
        await this.ingredientsService.loadIngredients();
        this.closeModal();
      }
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  async deleteDrink() {
    if (this.mode() === 'edit' && this.currentDrink()) {
      try {
        await this.drinkService.deleteDrink(this.currentDrink()!.id);
        await this.ingredientsService.loadIngredients();
        this.modal.close(this.modalId);
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  setFieldError(fieldName: string, message: string) {
    if (fieldName === 'name') {
      this.drinkTitleError.set(message);
      return;
    }
    if (fieldName === 'ingredients') {
      this.drinkIngredientsError.set(message);
      return;
    }
    const idx = this.drinkIngredients().toReversed().findIndex(i => i.ingredientName.toLowerCase() === fieldName.toLowerCase());
    if (idx >= 0) {
      const arr = [...this.drinkIngredients().toReversed()];
      arr[idx] = { ...arr[idx], status: message };
      this.drinkIngredients.set(arr.toReversed());
    }
  }

  clearFieldError(fieldName: string = '') {
    if (fieldName) {
      if (fieldName === 'name') {
        this.drinkTitleError.set('');
      } else {
        this.drinkIngredientsError.set('');
        const updated = this.drinkIngredients().map(i =>
          i.ingredientName === fieldName ? { ...i, status: '' } : i
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
    this.modal.close(this.modalId);
    this.drinkTitle.set('');
    this.drinkToppings.set('');
    this.drinkIngredients.set([]);
    this.availableIngredients.set([]);
    this.selectedIngredient.set('');
    this.selectedAmount.set(0);
    this.clearFieldError();
    this.clearGlobalError();
    this.imageBase64 = '';
    this.dataloaded = false;
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
