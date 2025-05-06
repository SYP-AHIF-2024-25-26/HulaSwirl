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
import {ErrorService} from '../../services/error.service';

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
  private readonly errorService = inject(ErrorService);
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
    if(avIng && avIng!.remainingAmount >= this.selectedAmount() && this.selectedAmount() > 0 && this.selectedAmount() <= 500) {
      this.orderIngredients.set([...this.orderIngredients(), { ingredientName: this.selectedIngredient(), amount: this.selectedAmount(), status: "" }]);
      this.availableIngredients.set(this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient()));
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }


  async submitOrder() {
    var res:number|null=null;
    if(this.orderIngredients().every(ing => ing.status === "")) {
       res=await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount})));
    }

    if(res!=null){
      this.closeModal();
      this.errorService.startProgress(res);
    }
  }

  closeModal() {
    this.orderIngredients.set([]);
    this.selectedIngredient.set("");
    this.selectedAmount.set(10);
    this.modalService.closeModal();
  }
}
