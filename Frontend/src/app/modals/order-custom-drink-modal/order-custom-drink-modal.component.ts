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
      this.availableIngredients.set(this.allIngredients.filter(ing => !this.orderIngredients().some(i => i.Name == ing.ingredientName)).filter(ing => ing.pumpSlot !== null));
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
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.Name);
      if(availableIng) this.availableIngredients.set([...this.availableIngredients(), availableIng!]);
      this.selectIngredient();
    }
  }

  addIngredient() {
    const avIng = this.availableIngredients().find(ing => ing.ingredientName === this.selectedIngredient());
    if(avIng && avIng!.remainingMl >= this.selectedAmount() && this.selectedAmount() > 0 && this.selectedAmount() < 100) {
      this.orderIngredients.set([...this.orderIngredients(), { Name: this.selectedIngredient(), Amount: this.selectedAmount(), Status: "" }]);
      this.availableIngredients.set(this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient()));
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    this.orderIngredients.set(this.orderIngredients().map(ing => {
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.Name);
      if(!availableIng) {
        return { ...ing, Status: "Where did that ingredient come from?" };
      }
      if(ing.Amount < 0) {
        return { ...ing, Status: "That's not how you refill the machine" };
      }
      if(ing.Amount > 100) {
        return { ...ing, Status: "You shouldn't drink more than 100ml of this" };
      }
      if(ing.Amount > availableIng!.remainingMl) {
        return {...ing, Status: `This ingredient only has ${availableIng!.remainingMl}ml left`};
      }
      return { ...ing, Status: "" };
    }));
  }

  async submitOrder() {
    this.validateOrder();
    if(this.orderIngredients().every(ing => ing.Status === "")) {
      await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({
        Name: ing.Name,
        Amount: ing.Amount
      })));
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
