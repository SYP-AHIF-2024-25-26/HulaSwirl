import {ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import {DrinkService} from '../services/drink.service';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {ErrorHandlingComponent} from '../services/error-handling';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './ingredients.component.html',
  standalone: true,
  styleUrls: ['./ingredients.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:dragover)': 'followMouse($event)'
  }
})
export class IngredientsComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);

  readonly ingredientSlots = this.ingredientsService.ingredientSlots;
  avIngredients: WritableSignal<Ingredient[]> = signal([]);
  unIngredients: WritableSignal<Ingredient[]> = signal([]);
  private draggedIngredient: Ingredient | null = null;
  private sourceContainer: 'available' | 'unavailable' | null = null;
  private dropSuccessful = false;
  private draggedElement: HTMLElement | null = null;

  constructor() {
    super();

    effect(() => {
      const allIngredients = this.ingredientsService.ingredients();
      this.avIngredients.set(
        allIngredients
          .filter(ing => ing.pumpSlot !== null)
          .sort((a, b) => (a.pumpSlot ?? 0) - (b.pumpSlot ?? 0) || a.ingredientName.localeCompare(b.ingredientName))
      );
      this.unIngredients.set(
        allIngredients
          .filter(ing => ing.pumpSlot === null)
          .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
      );
    });
  }

  dragStart(event: DragEvent, ingredient: Ingredient, available: boolean): void {
    this.draggedIngredient = ingredient;
    this.sourceContainer = available ? 'available' : 'unavailable';
    this.dropSuccessful = false;

    const targetEl = (event.currentTarget as HTMLElement) ?? (event.target as HTMLElement);
    this.draggedElement = targetEl.cloneNode(true) as HTMLElement;
    targetEl.style.opacity = '0';
    this.draggedElement.classList.add('dragging');
    document.body.appendChild(this.draggedElement);
    this.followMouse(event);

    targetEl.addEventListener('dragend', (e: Event) => {
      this.dragEnd(e as DragEvent, targetEl).catch(err => console.error('Error in dragEnd:', err));
    }, { once: true });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', ingredient.ingredientName);
    }
  }

  followMouse = (event: MouseEvent) => {
    if (this.draggedElement) {
      const rect = this.draggedElement.getBoundingClientRect();
      this.draggedElement.style.left = `${event.pageX - rect.width / 2}px`;
      this.draggedElement.style.top = `${event.pageY - rect.height / 2}px`;
    }
  }

  async dragEnd(_event: DragEvent, sourceElement?: HTMLElement): Promise<void> {
    if (sourceElement) {
      sourceElement.style.opacity = '1';
    }

    if (this.draggedElement?.parentNode) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement.parentNode.removeChild(this.draggedElement);
    }

    this.clearDragState();
  }

  clearDragState(): void {
    this.draggedIngredient = null;
    this.sourceContainer = null;
    this.dropSuccessful = false;
    this.draggedElement = null;
  }

  dragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async availableDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    if (!this.draggedIngredient || this.draggedIngredient.pumpSlot !== null) {
      return;
    }

    await this.moveIngredient(this.draggedIngredient, true);
    this.dropSuccessful = true;
  }

  async unavailableDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    if (!this.draggedIngredient || this.draggedIngredient.pumpSlot === null) {
      return;
    }

    await this.moveIngredient(this.draggedIngredient, false);
    this.dropSuccessful = true;
  }

  async moveToUnavailable(ingredient: Ingredient): Promise<void> {
    await this.moveIngredient(ingredient, false);
  }

  async moveToAvailable(ingredient: Ingredient): Promise<void> {
    await this.moveIngredient(ingredient, true);
  }

  private async moveIngredient(ingredient: Ingredient, toAvailable: boolean): Promise<void> {
    if (!ingredient) {
      return;
    }

    if (toAvailable) {
      if (ingredient.pumpSlot !== null) {
        return;
      }

      const nextSlot = this.getNextAvailableSlot();
      if (nextSlot === null) {
        this.setGlobalError('No free machine slot is available for this ingredient.');
        return;
      }

      ingredient.pumpSlot = nextSlot;
    } else {
      if (ingredient.pumpSlot === null) {
        return;
      }
      ingredient.pumpSlot = null;
    }

    await this.saveIngredients();
  }

  async updateRemaining(ingredient: Ingredient, event: FocusEvent): Promise<void> {
    const target = event.target as HTMLInputElement;
    const newValue = Number.parseInt(target.value, 10);

    if (!this.isValidAmount(newValue)) {
      target.value = ingredient.remainingAmount.toString();
      return;
    }

    ingredient.remainingAmount = Math.min(newValue, ingredient.maxAmount);
    target.value = ingredient.remainingAmount.toString();
    await this.saveIngredients();
  }

  async updateMaxAmount(ingredient: Ingredient, event: FocusEvent): Promise<void> {
    const target = event.target as HTMLInputElement;
    const newValue = Number.parseInt(target.value, 10);

    if (!this.isValidAmount(newValue, 1)) {
      target.value = ingredient.maxAmount.toString();
      return;
    }

    ingredient.maxAmount = newValue;
    if (ingredient.remainingAmount > ingredient.maxAmount) {
      ingredient.remainingAmount = ingredient.maxAmount;
    }

    target.value = ingredient.maxAmount.toString();
    await this.saveIngredients();
  }

  getLiquidPercentage(ingredient: Ingredient): number {
    if (!ingredient.maxAmount || ingredient.maxAmount <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (ingredient.remainingAmount / ingredient.maxAmount) * 100));
  }

  getUsageCount(ingredient: Ingredient): number {
    return this.drinkService.drinks().filter(drink =>
      drink.drinkIngredients.some(drinkIngredient => drinkIngredient.ingredientName === ingredient.ingredientName)
    ).length;
  }

  isAvailable(ingredient: Ingredient): boolean {
    return ingredient.pumpSlot !== null;
  }

  trackByIngredient(_index: number, ingredient: Ingredient): string {
    return ingredient.ingredientName;
  }

  private getNextAvailableSlot(): number | null {
    const usedSlots = new Set(
      this.ingredientsService.ingredients()
        .map(ingredient => ingredient.pumpSlot)
        .filter((slot): slot is number => slot !== null)
    );

    for (let slot = 1; slot <= this.ingredientSlots; slot++) {
      if (!usedSlots.has(slot)) {
        return slot;
      }
    }

    return null;
  }

  private isValidAmount(value: number, min = 0): boolean {
    return Number.isInteger(value) && value >= min && value <= 9999;
  }

  async saveIngredients(): Promise<void> {
    this.clearGlobalError();
    try {
      await this.ingredientsService.saveIngredients([...this.avIngredients(), ...this.unIngredients()]);
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}
  clearFieldError(_f?: string): void {}
}
