import {Component, effect, inject, Input, Signal, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {Drink, DrinkBase, DrinkService} from '../../services/drink.service';
import {ModalService} from '../../services/modal.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {subscribeOn} from 'rxjs';
import {ErrorService} from '../../services/error.service';

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
  private readonly errorService = inject(ErrorService);

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  drinkTitle = signal('');
  drinkToppings = signal('');
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);

  imageBase64: WritableSignal<string > = signal("");
  drinkAvailable = signal(true);

  isDragging = false;
  allIngredients: Ingredient[] = [];

  currentModalData: WritableSignal<Drink|null>=signal(null);
  dataloaded:boolean=false;

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
      if(!this.dataloaded){
        this.orderIngredients.set(this.currentModalData()?.drinkIngredients.map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount, status: '' })) ?? []);
        this.availableIngredients.set(this.allIngredients.filter(ing => !this.orderIngredients().some(i => i.ingredientName == ing.ingredientName)));
        this.drinkTitle.set(this.currentModalData()?.name ?? '');
        this.drinkToppings.set(this.currentModalData()?.toppings ?? '');
        this.imageBase64.set(this.currentModalData()?.imgUrl ?? "");
        this.selectIngredient()
        this.dataloaded = this.currentModalData() != null;
      }
    });
  }

  async ngOnInit() {
    this.currentModalData = this.modalService.getModalData();
  }

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : '');
  }

  deleteIngredient(index: number) {
    const ing = this.orderIngredients()[index];
    if (ing && this.currentModalData()) {
      this.currentModalData()!.drinkIngredients = this.currentModalData()!.drinkIngredients.filter(i => i.ingredientName !== ing.ingredientName);
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.ingredientName);
      this.orderIngredients.set(
        this.orderIngredients().filter((_, i) => i !== index)
      );
      if (availableIng) {
        this.availableIngredients.set([
          ...this.availableIngredients(),
          availableIng
        ]);
      }
      this.selectIngredient();
    }
  }

  addIngredient(){
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
    if(this.currentModalData()){
      this.currentModalData()!.name = this.drinkTitle();
      this.currentModalData()!.toppings = this.drinkToppings();
      this.currentModalData()!.imgUrl = this.imageBase64() ?? '';
      this.currentModalData()!.available = this.drinkAvailable();
      this.drinkService.drinks.update(d => d.map(drink => drink.id === this.currentModalData()!.id ? this.currentModalData()! : drink));
      if (this.orderIngredients().every(ing => ing.status === ''||ing.status === 'New Ingredient')) {
        const drinkData: DrinkBase = {
          name: this.drinkTitle(),
          available: this.drinkAvailable(),
          imgUrl: this.imageBase64(),
          toppings: this.drinkToppings(),
          drinkIngredients: this.orderIngredients().map(ing => ({ ingredientName: ing.ingredientName, amount: ing.amount }))
        };
        await this.drinkService.editDrink(drinkData, this.currentModalData()!.id);
      }
      this.closeModal();
    }
  }

  closeModal() {
    this.modalService.closeModal();
    this.dataloaded=false;
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

  deleteDrink() {
    this.drinkService.deleteDrink(this.currentModalData()!.id);
    this.modalService.closeModal();
  }
}
