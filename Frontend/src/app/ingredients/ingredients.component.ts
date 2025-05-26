import {Component, effect, HostListener, inject, Signal, signal, WritableSignal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {StatusService} from '../services/status.service';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './ingredients.component.html',
  standalone: true,
  styleUrls: ['./ingredients.component.css']
})
export class IngredientsComponent {
  private readonly ingredientsService = inject(IngredientsService)
  private readonly errorService = inject(StatusService);
  readonly ingredientSlots = this.ingredientsService.ingredientSlots;
  activeSlots: boolean[] = new Array(this.ingredientSlots).fill(true);
  avIngredients: WritableSignal<Ingredient[]> = signal([]);
  unIngredients: WritableSignal<Ingredient[]> = signal([]);
  private draggedIngredient: Ingredient | null = null;
  private sourceContainer: 'available' | 'unavailable' | null = null;
  private sourceIndex: number | null = null;
  private dropSuccessful: boolean = false;
  private draggedElement: HTMLElement | null = null;

  constructor() {
    effect(async () => {
      await this.ingredientsService.loadIngredients();
      const allIngredients = this.ingredientsService.ingredients();
      this.avIngredients.set(allIngredients.filter(ing => ing.pumpSlot !== null));
      this.unIngredients.set(allIngredients.filter(ing => ing.pumpSlot === null));
    });
  }

  dragStart(event: DragEvent, index: number, available: boolean = true) {
    const ingredient = available ? this.getIngredientByIndex(index) : this.unIngredients()[index];
    if (!ingredient) return;
    this.draggedIngredient = ingredient;
    this.sourceContainer = available ? 'available' : 'unavailable';
    this.sourceIndex = index;
    this.dropSuccessful = false;
    if(available) {
      this.avIngredients.update(ings => {
        return ings.filter(ing => ing?.pumpSlot !== ingredient.pumpSlot);
      })
    } else {
      this.unIngredients.update(ings => {
        const newArr = [...ings];
        newArr.splice(index, 1);
        return newArr;
      });
    }
    const targetEl = (event.target as HTMLElement);
    this.draggedElement = targetEl.cloneNode(true) as HTMLElement;
    targetEl.style.opacity = '0';
    this.draggedElement.classList.add('dragging');
    document.body.appendChild(this.draggedElement);
    this.followMouse(event);
    event.target?.addEventListener('dragend', this.dragEnd.bind(this) as EventListener);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  @HostListener('document:dragover', ['$event'])
  followMouse = (event: MouseEvent) => {
    if (this.draggedElement) {
      const rect = this.draggedElement.getBoundingClientRect();
      this.draggedElement.style.left = `${event.pageX - rect.width / 2}px`;
      this.draggedElement.style.top = `${event.pageY - rect.height / 2}px`;
    }
  }

  dragEnd(event: DragEvent): void {
    if (!this.dropSuccessful && this.draggedIngredient) {
      if (this.sourceContainer === 'available' && this.sourceIndex !== null) {
        this.avIngredients.update(ings => {
          return [...ings, this.draggedIngredient!];
        });
      } else if (this.sourceContainer === 'unavailable') {
        this.unIngredients.update(ings => [...ings, this.draggedIngredient!]);
      }
    }
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      document.body.removeChild(this.draggedElement);
    }
    this.clearDragState();
  }

  clearDragState() {
    this.draggedIngredient = null;
    this.sourceContainer = null;
    this.sourceIndex = null;
    this.dropSuccessful = false;
    this.draggedElement = null;
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  availableDrop(event: DragEvent, slotIndex: number) {
    if (!this.draggedIngredient) return;
    this.avIngredients.update(ings => {
      let newArr = [...ings];
      const ingByIndex = this.getIngredientByIndex(slotIndex);
      if (ingByIndex) {
        this.draggedIngredient!.pumpSlot = ingByIndex.pumpSlot;
        if (this.sourceContainer === 'available' && this.sourceIndex !== null) {
          ingByIndex.pumpSlot = this.sourceIndex + 1;
        } else if (this.sourceContainer === 'unavailable') {
          this.unIngredients.update(uings => [...uings, ingByIndex]);
          newArr = newArr.filter(ing => ing.pumpSlot !== ingByIndex.pumpSlot);
          ingByIndex.pumpSlot = null;
        }
      } else {
        this.draggedIngredient!.pumpSlot = slotIndex + 1;
      }
      newArr.push(this.draggedIngredient!);
      return newArr;
    });
    this.dropSuccessful = true;
  }

  unavailableDrop(event: DragEvent) {
    if (!this.draggedIngredient) return;
    this.draggedIngredient.maxAmount = this.draggedIngredient.remainingAmount;
    this.draggedIngredient.pumpSlot = null;
    this.unIngredients.update(ings => [...ings, this.draggedIngredient!]);
    this.dropSuccessful = true;
  }

  updateRemaining(event: FocusEvent, index: number) {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value);
    if (newValue < 0 || newValue > 9999 || isNaN(newValue)) {
      const ing = this.avIngredients()[index];
      if (ing) target.value = ing.remainingAmount.toString();
      return;
    }
    this.avIngredients.update(ings => {
      const newArr = [...ings];
      const ingByIndex = this.getIngredientByIndex(index);
      if (ingByIndex) {
        if (newValue > ingByIndex.maxAmount) {
          ingByIndex.maxAmount = newValue;
        }
        ingByIndex.remainingAmount = newValue;
      }
      return newArr;
    });
  }

  toggleSlot(index: number) {
    this.activeSlots[index] = !this.activeSlots[index];
  }

  getLiquidPercentage(ingredient: Ingredient): number {
    return (ingredient.remainingAmount / ingredient.maxAmount) * 100 + 0.5;
  }

  getIngredientByIndex(idx: number): Ingredient | null {
    return this.avIngredients().find(ing => ing != null && ing.pumpSlot === idx + 1) || null;
  }

  async saveIngredients() {
    try {
      await this.ingredientsService.saveIngredients([...this.avIngredients(), ...this.unIngredients()]);
    } catch (e: unknown) {
      this.errorService.handleError(e);
    }
  }
}
