import {Component, HostListener, Signal, signal, WritableSignal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import {Ingredient} from '../ingredients.service';

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
  ingredientSlots = 9;
  activeSlots: boolean[] = new Array(this.ingredientSlots).fill(true);

  avIngredients: WritableSignal<Ingredient[]> = signal([
    { name: 'Water', slot: 1, remainingMl: 1000, maxMl: 1000 },
    { name: 'Milk', slot: 2, remainingMl: 500, maxMl: 500 },
    { name: 'Olive Oil', slot: 3, remainingMl: 250, maxMl: 250 },
    { name: 'Lemon Juice', slot: 5, remainingMl: 200, maxMl: 200 },
    { name: 'Soy Sauce', slot: 7, remainingMl: 150, maxMl: 150 }
  ]);

  unIngredients = signal([
    { name: 'Vinegar', slot: 6, remainingMl: 300, maxMl: 300 },
    { name: 'Coconut Milk', slot: 7, remainingMl: 400, maxMl: 400 },
    { name: 'Honey', slot: 8, remainingMl: 350, maxMl: 350 },
    { name: 'Vanilla Extract', slot: 9, remainingMl: 100, maxMl: 100 },
    { name: 'Whipping Cream', slot: 10, remainingMl: 600, maxMl: 600 },
  ]);

  draggedIngredient: Ingredient | null = null;
  sourceContainer: 'available' | 'unavailable' | null = null;
  sourceIndex: number | null = null;
  dropSuccessful: boolean = false;

  private draggedElement: HTMLElement | null = null;

  dragStart(event: DragEvent, index: number, available: boolean = true) {
    const ingredient = available ? this.getIngredientByIndex(index) : this.unIngredients()[index];
    if (!ingredient) return;
    this.draggedIngredient = ingredient;
    this.sourceContainer = available ? 'available' : 'unavailable';
    this.sourceIndex = index;
    this.dropSuccessful = false;

    if(available) {
      this.avIngredients.update(ings => {
        return ings.filter(ing => ing?.slot !== ingredient.slot);
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
        this.draggedIngredient!.slot = ingByIndex.slot;
        if (this.sourceContainer === 'available' && this.sourceIndex !== null) {
          ingByIndex.slot = this.sourceIndex + 1;
        } else if (this.sourceContainer === 'unavailable') {
          this.unIngredients.update(uings => [...uings, ingByIndex]);
          newArr = newArr.filter(ing => ing.slot !== ingByIndex.slot);
        }
      } else {
        this.draggedIngredient!.slot = slotIndex + 1;
      }
      newArr.push(this.draggedIngredient!);
      return newArr;
    });
    this.dropSuccessful = true;
  }

  unavailableDrop(event: DragEvent) {
    if (!this.draggedIngredient) return;
    this.unIngredients.update(ings => [...ings, this.draggedIngredient!]);
    this.dropSuccessful = true;
  }

  updateRemaining(event: FocusEvent, index: number) {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value);
    console.log(newValue);
    if (newValue < 0 || newValue > 9999 || isNaN(newValue)) {
      const ing = this.avIngredients()[index];
      if (ing) target.value = ing.remainingMl.toString();
      return;
    }
    this.avIngredients.update(ings => {
      const newArr = [...ings];
      const ingByIndex = this.getIngredientByIndex(index);
      if (ingByIndex) {
        if (newValue > ingByIndex.maxMl) {
          ingByIndex.maxMl = newValue;
        }
        ingByIndex.remainingMl = newValue;
      }
      return newArr;
    });
  }

  toggleSlot(index: number) {
    this.activeSlots[index] = !this.activeSlots[index];
  }

  getLiquidPercentage(ingredient: Ingredient): number {
    return (ingredient.remainingMl / ingredient.maxMl) * 100 + 0.5;
  }

  getIngredientByIndex(idx: number): Ingredient | null {
    return this.avIngredients().find(ing => ing != null && ing.slot === idx + 1) || null;
  }
}
