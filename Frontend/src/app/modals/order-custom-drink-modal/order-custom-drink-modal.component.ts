import {
  Component, effect,
  EventEmitter,
  inject,
  Output,
  signal,
  WritableSignal
} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-order-custom-drink-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './order-custom-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-custom-drink-modal.component.css'
})
export class OrderCustomDrinkModalComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly modalService = inject(ModalService);

  allIngredients: Ingredient[] = [];
  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  selectedIngredient: WritableSignal<string> = signal("");
  selectedAmount: WritableSignal<number> = signal(10);

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      this.availableIngredients.set(this.allIngredients.filter(ing => !this.orderIngredients().some(i => i.ingredientName == ing.ingredientName)).filter(ing => ing.pumpSlot !== null));
      this.selectIngredient()
    });
  }

  selectIngredient() {
    const ing = this.availableIngredients()[0];
    if(ing){
      this.selectedIngredient.set(ing.ingredientName);
    } else {
      this.selectedIngredient.set("");
    }
  }

  deleteIngredient($index: number) {
    const ing = this.orderIngredients()[$index];
    if(ing) {
      this.orderIngredients.set(this.orderIngredients().filter((_, i) => i !== $index));
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
      if(availableIng) this.availableIngredients.set([...this.availableIngredients(), availableIng!]);
      this.selectIngredient();
    }
  }

  addIngredient() {
    const avIng = this.availableIngredients().find(ing => ing.ingredientName === this.selectedIngredient());
    if(avIng && avIng!.remainingAmount >= this.selectedAmount() && this.selectedAmount() > 0 && this.selectedAmount() < 100) {
      this.orderIngredients.set([...this.orderIngredients(), { ingredientName: this.selectedIngredient(), amount: this.selectedAmount(), status: "" }]);
      this.availableIngredients.set(this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient()));
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    this.orderIngredients.set(this.orderIngredients().map(ing => {
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
      if(!availableIng) {
        return { ...ing, status: "Where did that ingredient come from?" };
      }
      if(ing.amount < 0) {
        return { ...ing, status: "That's not how you refill the machine" };
      }
      if(ing.amount > 100) {
        return { ...ing, status: "You shouldn't drink more than 100ml of this" };
      }
      if(ing.amount > availableIng!.remainingAmount) {
        return {...ing, status: `This ingredient only has ${availableIng!.remainingAmount}ml left`};
      }
      return { ...ing, status: "" };
    }));
  }

  async submitOrder() {
    this.validateOrder();
    if(this.orderIngredients().every(ing => ing.status === "")) {
      await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount})));
      this.closeModal();
    }
  }

  closeModal() {
    this.orderIngredients.set([]);
    this.selectedIngredient.set("");
    this.selectedAmount.set(10);
    this.modalService.closeModal();
  }
}
