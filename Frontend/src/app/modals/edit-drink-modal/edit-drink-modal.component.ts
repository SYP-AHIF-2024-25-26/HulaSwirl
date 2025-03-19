import {Component, effect, inject, Input, Signal, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {Drink, DrinkBase, DrinkService} from '../../services/drink.service';
import {ModalService} from '../../services/modal.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-edit-drink-modal',
  imports: [[FormsModule, CommonModule]],
  templateUrl: './edit-drink-modal.component.html',
  standalone: true,
  styleUrl: './edit-drink-modal.component.css'
})
export class EditDrinkModalComponent {

  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);

  allIngredients: Ingredient[] = [];
  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);

  drinkTitle = signal('');
  drinkToppings = signal('');
  imageBase64: WritableSignal<string | null> = signal(null);
  drinkAvailable = signal(true);

  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);

  isDragging = false;
  currentModalData: WritableSignal<Drink|null>=signal(null);

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : '');
  }

  deleteIngredient(index: number) {
    const ing = this.orderIngredients()[index];
    if (ing && this.currentModalData()) {
      this.currentModalData()!.drinkIngredients = this.currentModalData()!.drinkIngredients.filter(i => i.ingredientName !== ing.ingredientName);
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
      console.log(this.orderIngredients())
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
    const avIng = this.availableIngredients().find(ing => ing.ingredientName === this.selectedIngredient());
    console.log(avIng)
    if (
      this.currentModalData() &&
      avIng &&
      avIng.remainingAmount >= this.selectedAmount() &&
      this.selectedAmount() > 0 &&
      this.selectedAmount() <= 100
    ) {
      this.currentModalData()!.drinkIngredients.push({
        ingredientName: this.selectedIngredient(),
        amount: this.selectedAmount()
      });
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
    this.validateOrder()
    console.log(this.orderIngredients())
    if(this.currentModalData()){
      this.currentModalData()!.name = this.drinkTitle();
      this.currentModalData()!.toppings = this.drinkToppings();
      this.currentModalData()!.imgUrl = this.imageBase64() ?? '';
      this.currentModalData()!.available = this.drinkAvailable();
      this.drinkService.drinks.update(d => d.map(drink => drink.id === this.currentModalData()!.id ? this.currentModalData()! : drink));
      if (this.orderIngredients().every(ing => ing.status === '')) {
        const drinkData: DrinkBase = {
          name: this.currentModalData()!.name,
          available: this.drinkAvailable(),
          imgUrl: this.imageBase64(),
          toppings: this.currentModalData()!.toppings,
          drinkIngredients: this.orderIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount }))
        };
        await this.drinkService.editDrink(drinkData, this.currentModalData()!.id);
      }
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
      this.imageBase64.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      this.orderIngredients.set(this.currentModalData()?.drinkIngredients.map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount, status: '' })) ?? []);
      this.availableIngredients.set(this.allIngredients.filter(ing => !this.orderIngredients().some(i => i.ingredientName == ing.ingredientName)).filter(ing => ing.pumpSlot !== null));
      this.drinkTitle.set(this.currentModalData()?.name ?? '');
      this.drinkToppings.set(this.currentModalData()?.toppings ?? '');
      this.imageBase64.set(this.currentModalData()?.imgUrl ?? null);
      this.selectIngredient()
    });
  }

  async ngOnInit() {
    this.currentModalData = this.modalService.getModalData();
  }

  deleteDrink() {
    this.drinkService.deleteDrink(this.currentModalData()!.id);
    this.modalService.closeModal();
  }
}
