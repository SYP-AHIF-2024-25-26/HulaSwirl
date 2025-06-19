import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {ModalService, ModalType} from '../../services/modal.service';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-order-custom-drink-modal',
  imports: [FormsModule, NgForOf],
  templateUrl: './order-custom-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-custom-drink-modal.component.css'
})
export class OrderCustomDrinkModalComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly modalService = inject(ModalService);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  ingredientAmounts: WritableSignal<Record<string, number>> = signal({});

  constructor() {
    super();
    effect(() => {
      const all = this.ingredientsService.ingredients().filter(i => i.pumpSlot !== null);
      this.availableIngredients.set(all);
      for (const ing of all) {
        if (!(ing.ingredientName in this.ingredientAmounts())) {
          this.ingredientAmounts()[ing.ingredientName] = 0;
        }
      }
    });
  }

  isSelected(name: string): boolean {
    return this.orderIngredients().some(i => i.ingredientName === name);
  }

  toggleIngredient(ingredient: Ingredient, e: EventTarget) {
    this.clearGlobalError();
    this.clearFieldError(ingredient.ingredientName);
    const checked = this.isSelected(ingredient.ingredientName)
    if(e instanceof HTMLInputElement) {
      e.select()
      if(checked) return;
    }
    const name = ingredient.ingredientName;
    const amount = this.getAmount(name);
    if (!checked) {
      this.orderIngredients.set([...this.orderIngredients(), {ingredientName: name, amount, status: ''}]);
    } else {
      this.orderIngredients.set(this.orderIngredients().filter(i => i.ingredientName !== name));
    }
  }

  getAmount(name: string): number {
    return this.ingredientAmounts()[name] ?? 1;
  }

  updateAmount(name: string, value: number) {
    this.clearFieldError(name);
    this.ingredientAmounts.set({...this.ingredientAmounts(), [name]: value && value > 0 ? value < 500 ? value : 500 : 1});
    if (this.isSelected(name)) {
      this.orderIngredients.set(this.orderIngredients().map(i => i.ingredientName === name ? {...i, amount: value} : i));
    }
  }

  getStatus(name: string): string {
    const item = this.orderIngredients().find(i => i.ingredientName === name);
    return item ? item.status : '';
  }

  setFieldError(fieldName: string, message: string) {
    const idx = this.orderIngredients().findIndex(i => i.ingredientName === fieldName);
    if (idx >= 0) {
      const arr = [...this.orderIngredients()];
      arr[idx] = { ...arr[idx], status: message };
      this.orderIngredients.set(arr);
    }
  }

  async submitOrder() {
    this.clearGlobalError();
    this.clearFieldError();
    try {
      if (this.orderIngredients().every(ing => ing.status === '')) {
        await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({
          ingredientName: ing.ingredientName,
          amount: ing.amount
        })));
        this.closeModal();
      }
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  clearFieldError(fieldName: string = "") {
    if( fieldName) {
      const updatedIngredients = this.orderIngredients().map(i =>
        i.ingredientName === fieldName ? { ...i, status: '' } : i
      );
      this.orderIngredients.set(updatedIngredients);
    } else {
      this.orderIngredients.set(this.orderIngredients().map(i => ({ ...i, status: '' })));
    }
  }
  closeModal() {
    this.orderIngredients.set([]);
    this.ingredientAmounts.set({});
    this.modalService.closeModal();
  }
}
