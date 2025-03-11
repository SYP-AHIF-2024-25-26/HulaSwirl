import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DrinkService, NewDrinkDTO} from '../../services/drink.service';

@Component({
  selector: 'app-add-drink-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-drink-modal.component.html',
  standalone: true,
  styleUrls: ['./add-drink-modal.component.css']
})
export class AddDrinkModalComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);

  // -- Signale für die Liste der verfügbaren Zutaten und der bestellten Zutaten
  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);

  // -- Signale für den aktuell ausgewählten Namen und Menge
  selectedIngredient: WritableSignal<string> = signal('');
  selectedAmount: WritableSignal<number> = signal(10);

  // -- NEU: Signale für Title und Toppings
  drinkTitle: WritableSignal<string> = signal('');
  drinkToppings: WritableSignal<string> = signal('');

  // -- Upload-Handling
  imageBase64: string | null = null;
  isDragging = false;
  allIngredients: Ingredient[] = [];

  constructor() {
    effect(() => {
      this.allIngredients = this.ingredientsService.ingredients();
    });
  }

  async ngOnInit() {
    this.availableIngredients.set(
      this.allIngredients.filter(ing => ing.pumpSlot !== null)
    );
    this.selectIngredient();
  }

  selectIngredient() {
    const first = this.availableIngredients()[0];
    this.selectedIngredient.set(first ? first.ingredientName : '');
  }

  deleteIngredient(index: number) {
    const ing = this.orderIngredients()[index];
    if (ing) {
      // Entfernen aus orderIngredients
      this.orderIngredients.set(
        this.orderIngredients().filter((_, i) => i !== index)
      );
      // Zurück in availableIngredients
      const availableIng = this.allIngredients.find(i => i.ingredientName === ing.Name);
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
      ing => ing.ingredientName === this.selectedIngredient()
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
        this.availableIngredients().filter(ing => ing.ingredientName !== this.selectedIngredient())
      );
      this.selectIngredient();
      this.selectedAmount.set(10);
    }
  }

  validateOrder() {
    this.orderIngredients.set(
      this.orderIngredients().map(ing => {
        const availableIng = this.allIngredients.find(i => i.ingredientName === ing.Name);
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
      const drinkData: NewDrinkDTO = {
        name: this.drinkTitle(),
        img: this.imageBase64,
        toppings: this.drinkToppings(),
        ingredients: this.orderIngredients().map(ing => ({
          name: ing.Name,
          amount: ing.Amount
        }))
      };
      await this.drinkService.postNewDrink(drinkData);
      this.closeModal();
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }

  // --- Datei-Upload
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
