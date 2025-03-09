import {Component, inject, signal, WritableSignal} from '@angular/core';
import {ModalService} from '../modal.service';
import {Ingredient, IngredientsService, OrderPreparation} from '../ingredients.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-add-drink-modal',
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './add-drink-modal.component.html',
  standalone: true,
  styleUrl: './add-drink-modal.component.css'
})
export class AddDrinkModalComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly modalService = inject(ModalService);
  allIngredients: Ingredient[] = [];
  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);

  selectedIngredient: WritableSignal<string> = signal("");
  selectedAmount: WritableSignal<number> = signal(10);

  async ngOnInit() {
    this.allIngredients = await this.ingredientsService.getAllIngredients();
    this.availableIngredients.set(this.allIngredients.filter(ing => ing.slot !== null));
    this.selectIngredient()
  }
  selectIngredient() {
    const ing = this.availableIngredients()[0];
    if(ing){
      this.selectedIngredient.set(ing.name);
    } else {
      this.selectedIngredient.set("");
    }
  }

  deleteIngredient($index: number) {
    const ing = this.orderIngredients()[$index];
    if(ing) {
      this.orderIngredients.set(this.orderIngredients().filter((_, i) => i !== $index));
      const availableIng = this.allIngredients.find(i => i.name === ing.Name);
      if(availableIng) this.availableIngredients.set([...this.availableIngredients(), availableIng!]);
      this.selectIngredient();
    }
  }

  addIngredient() {
    const avIng = this.availableIngredients().find(ing => ing.name === this.selectedIngredient());
    if(avIng && avIng!.remainingMl >= this.selectedAmount() && this.selectedAmount() > 0 && this.selectedAmount() < 100) {
      this.orderIngredients.set([...this.orderIngredients(), { Name: this.selectedIngredient(), Amount: this.selectedAmount(), Status: "" }]);
      this.availableIngredients.set(this.availableIngredients().filter(ing => ing.name !== this.selectedIngredient()));
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    this.orderIngredients.set(this.orderIngredients().map(ing => {
      const availableIng = this.allIngredients.find(i => i.name === ing.Name);
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

  async submitDrink() {
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
    this.modalService.closeModal();
  }
  imageBase64: string | null = null;
  isDragging = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.readFile(input.files[0]);
  }

  // Bei Drag & Drop:
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // verhindert das Standard-Verhalten
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

  // Liest eine Datei ein und speichert den Base64-String
  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
