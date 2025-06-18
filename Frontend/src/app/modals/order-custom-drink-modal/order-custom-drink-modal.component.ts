import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {ModalService, ModalType} from '../../services/modal.service';
import {StatusService} from '../../services/status.service';

@Component({
  selector: 'app-order-custom-drink-modal',
  imports: [FormsModule],
  templateUrl: './order-custom-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-custom-drink-modal.component.css'
})
export class OrderCustomDrinkModalComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly modalService = inject(ModalService);
  private readonly errorService = inject(StatusService);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  ingredientAmounts: WritableSignal<Record<string, number>> = signal({});

  constructor() {
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
    return this.ingredientAmounts()[name] ?? 10;
  }

  updateAmount(name: string, value: number) {
    this.ingredientAmounts.set({...this.ingredientAmounts(), [name]: value});
    if (this.isSelected(name)) {
      this.orderIngredients.set(this.orderIngredients().map(i => i.ingredientName === name ? {...i, amount: value} : i));
    }
  }

  getStatus(name: string): string {
    const item = this.orderIngredients().find(i => i.ingredientName === name);
    return item ? item.status : '';
  }

  async submitOrder() {
    try {
      if (this.orderIngredients().every(ing => ing.status === '')) {
        //TODO: Add loading indicator
        await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({
          ingredientName: ing.ingredientName,
          amount: ing.amount
        })));
        this.closeModal();
        this.modalService.openModal(ModalType.Error, {message: "Successfully ordered drink!\nGo to the bar to confirm your order."});
      }
    } catch (e: unknown) {

    }
  }

  closeModal() {
    this.orderIngredients.set([]);
    this.ingredientAmounts.set({});
    this.modalService.closeModal();
  }
}
