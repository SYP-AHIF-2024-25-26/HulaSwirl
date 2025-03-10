import {Component, inject, Input, Signal, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {Drink, DrinkService, EditDrinkDTO, NewDrinkDTO} from '../../services/drink.service';
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

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');
  imageBase64: string | null = null;
  isDragging = false;
  allIngredients: Ingredient[] = [];
  currentModalData:Signal<Drink|null>=signal(null);
  drinkAvailability:WritableSignal<string> = signal("Available");

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.name : '');
  }

  deleteIngredient(index: number) {
    const ing = this.orderIngredients()[index];
    if (ing) {
      this.orderIngredients.set(
        this.orderIngredients().filter((_, i) => i !== index)
      );
      const availableIng = this.allIngredients.find(i => i.name === ing.Name);
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
      ing => ing.name === this.selectedIngredient()
    );
    if (
      avIng &&
      avIng.remainingMl >= this.selectedAmount() &&
      this.selectedAmount() > 0 &&
      this.selectedAmount() <= 100
    ) {
      this.orderIngredients.set([
        ...this.orderIngredients(),
        { Name: this.selectedIngredient(), Amount: this.selectedAmount(), Status: '' }
      ]);
      this.availableIngredients.set(
        this.availableIngredients().filter(ing => ing.name !== this.selectedIngredient())
      );
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    console.log(this.orderIngredients());
    console.log(this.allIngredients)
    this.orderIngredients.set(
      this.orderIngredients().map(ing => {
        const availableIng = this.allIngredients.find(i => i.name === ing.Name);
        if (!availableIng) {
          return { ...ing, Status: 'Unbekannte Zutat' };
        }
        if (ing.Amount < 0) {
          return { ...ing, Status: 'Negativer Wert nicht erlaubt' };
        }
        if (ing.Amount > 100) {
          return { ...ing, Status: 'Maximal 100 ml pro Zutat' };
        }
        if (ing.Amount > availableIng.remainingMl) {
          return {
            ...ing,
            Status: `Nur noch ${availableIng.remainingMl}ml verfügbar`
          };
        }
        return { ...ing, Status: '' };
      })
    );
  }

  async submitDrink() {
    this.validateOrder();
    if (this.orderIngredients().every(ing => ing.Status === '')) {
      const drinkData: EditDrinkDTO = {
        id:this.currentModalData()!.id,
        name: this.drinkTitle(),
        available: this.drinkAvailability() !== "Available",
        img: this.imageBase64,
        toppings: this.drinkToppings()
      };
      await this.drinkService.editDrink(drinkData)
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
  @Input() visible = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.onShow();
    }
  }

  async onShow() {
    this.allIngredients = await this.ingredientsService.getAllIngredients();
    this.availableIngredients.set(
      this.allIngredients.filter(ing => ing.slot !== null)
    );
    this.selectIngredient();
    this.currentModalData = this.modalService.getModalData();
    this.drinkTitle.set(this.currentModalData()!.name);
    this.drinkToppings.set(this.currentModalData()!.toppings);
    this.imageBase64 = this.currentModalData()?.img ?? null;
    this.orderIngredients.set(
      this.currentModalData()!.drinkIngredients.map(ing => ({
        Name: ing.name,
        Amount: ing.amount,
        Status: ''
      }))
    );
  }

  toggleDrinkAvailability() {
    if(this.drinkAvailability()=="Available"){
      this.drinkAvailability.set("Not Available");
    }
    else{
      this.drinkAvailability.set("Available");
    }
  }

  deleteDrink() {
    this.drinkService.deleteDrink(this.currentModalData()!.id);
    this.modalService.closeModal();

  }
}
