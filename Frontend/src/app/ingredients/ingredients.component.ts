import {ChangeDetectionStrategy, Component, computed, effect, inject, signal, WritableSignal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import {DrinkService} from '../services/drink.service';
import {Ingredient, IngredientsService} from '../services/ingredients.service';
import {ErrorHandlingComponent} from '../services/error-handling';

export interface SlotEntry {
  slotNumber: number;
  ingredient: IngredientViewModel | null;
}

export interface IngredientViewModel extends Ingredient {
  renderKey: string;
}

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
    '(document:dragover)': 'followMouse($event)',
    '(document:touchmove)': 'onTouchMove($event)',
    '(document:touchend)': 'onTouchEnd($event)',
    '(document:touchcancel)': 'onTouchEnd($event)'
  }
})
export class IngredientsComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);

  readonly ingredientSlots = this.ingredientsService.ingredientSlots;
  avIngredients: WritableSignal<IngredientViewModel[]> = signal([]);
  unIngredients: WritableSignal<IngredientViewModel[]> = signal([]);

  /** Currently dragged ingredient (signal so template can react) */
  draggedIng = signal<IngredientViewModel | null>(null);

  slotGrid = computed<SlotEntry[]>(() => {
    const available = this.avIngredients();
    const dragged = this.draggedIng();
    const slots: SlotEntry[] = [];
    for (let i = 1; i <= this.ingredientSlots; i++) {
      const ing = available.find(a => a.pumpSlot === i) ?? null;
      // If this ingredient is currently being dragged, show slot as "being moved"
      slots.push({
        slotNumber: i,
        ingredient: (ing && dragged && ing.ingredientName === dragged.ingredientName) ? null : ing
      });
    }
    return slots;
  });

  /** Helper: all slot numbers for the select dropdown */
  allSlotNumbers = computed(() => Array.from({length: this.ingredientSlots}, (_, i) => i + 1));

  private sourceContainer: 'available' | 'unavailable' | null = null;
  private dropSuccessful = false;
  private draggedElement: HTMLElement | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  constructor() {
    super();

    effect(() => {
      this.setLocalLists(this.ingredientsService.ingredients());
    });
  }


  getSlotLabel(slotNumber: number): string {
    //const occupant = this.avIngredients().find(ing => ing.pumpSlot === slotNumber);
    //return occupant ? `Slot ${slotNumber} – ${occupant.ingredientName}` : `Slot ${slotNumber} – Empty`;
    return `Slot ${slotNumber}`;
  }

  async onSlotChangeByValue(ingredient: IngredientViewModel, newValue: number | null): Promise<void> {
    const allIngredients = this.getAllIngredients();
    const ingredientToMove = allIngredients.find(ing => ing.ingredientName === ingredient.ingredientName);
    if (!ingredientToMove) {
      return;
    }

    if (newValue === null) {
      if (ingredientToMove.pumpSlot === null) return;
      this.applyIngredientUpdates([
        {...ingredientToMove, pumpSlot: null}
      ]);
      await this.saveIngredients();
      return;
    }

    const targetSlot = newValue;
    if (ingredientToMove.pumpSlot === targetSlot) return;

    this.swapIngredientIntoSlot(ingredientToMove.ingredientName, targetSlot);
    await this.saveIngredients();
  }

  private setLocalLists(allIngredients: Ingredient[]): void {
    this.avIngredients.set(
      allIngredients
        .filter(ing => ing.pumpSlot !== null)
        .map(ing => this.toViewModel(ing))
        .sort((a, b) => (a.pumpSlot ?? 0) - (b.pumpSlot ?? 0) || a.ingredientName.localeCompare(b.ingredientName))
    );
    this.unIngredients.set(
      allIngredients
        .filter(ing => ing.pumpSlot === null)
        .map(ing => this.toViewModel(ing))
        .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
    );
  }

  private toViewModel(ingredient: Ingredient): IngredientViewModel {
    return {
      ...ingredient,
      renderKey: `${ingredient.ingredientName}-${ingredient.pumpSlot ?? 'offline'}`
    };
  }

  private getAllIngredients(): Ingredient[] {
    return [...this.avIngredients(), ...this.unIngredients()].map(({renderKey, ...ingredient}) => ingredient);
  }

  private applyIngredientUpdates(updatedIngredients: Ingredient[]): void {
    const updatesByName = new Map(updatedIngredients.map(ingredient => [ingredient.ingredientName, ingredient]));
    const mergedIngredients = this.getAllIngredients().map(ingredient => updatesByName.get(ingredient.ingredientName) ?? ingredient);
    this.setLocalLists(mergedIngredients);
  }

  public getIngredientRenderKey(ingredient: Ingredient): string {
    const viewModel = ingredient as IngredientViewModel;
    return viewModel.renderKey ?? `${ingredient.ingredientName}-${ingredient.pumpSlot ?? 'offline'}`;
  }

  private swapIngredientIntoSlot(ingredientName: string, slotNumber: number): void {
    const allIngredients = this.getAllIngredients();
    const ingredientToMove = allIngredients.find(ing => ing.ingredientName === ingredientName);
    if (!ingredientToMove || ingredientToMove.pumpSlot === slotNumber) {
      return;
    }

    const previousSlot = ingredientToMove.pumpSlot;
    const occupant = allIngredients.find(ing => ing.pumpSlot === slotNumber && ing.ingredientName !== ingredientName);
    const updates: Ingredient[] = [
      {...ingredientToMove, pumpSlot: slotNumber}
    ];

    if (occupant) {
      updates.push({...occupant, pumpSlot: previousSlot});
    }

    this.applyIngredientUpdates(updates);
  }

  // ── Drag & Drop ────────────────────────────────────────────────

  dragStart(event: DragEvent, ingredient: IngredientViewModel, available: boolean): void {
    // Don't start drag when interacting with input/select elements
    const origin = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    if (origin?.closest('input, select, textarea')) {
      event.preventDefault();
      return;
    }

    this.draggedIng.set(ingredient);
    this.sourceContainer = available ? 'available' : 'unavailable';
    this.dropSuccessful = false;

    const targetEl = (event.currentTarget as HTMLElement) ?? (event.target as HTMLElement);

    // Capture original size before cloning
    const originalRect = targetEl.getBoundingClientRect();

    // Store offset from cursor to top-left corner of the card
    this.dragOffsetX = event.clientX - originalRect.left;
    this.dragOffsetY = event.clientY - originalRect.top;

    this.draggedElement = targetEl.cloneNode(true) as HTMLElement;
    // Fix clone size to match original card exactly
    this.draggedElement.style.width = `${originalRect.width}px`;
    this.draggedElement.classList.add('dragging');

    // Preserve select values in the clone (cloneNode doesn't copy dynamic select state)
    const originalSelects = targetEl.querySelectorAll('select');
    const clonedSelects = this.draggedElement.querySelectorAll('select');
    originalSelects.forEach((sel, i) => {
      if (clonedSelects[i]) {
        clonedSelects[i].value = sel.value;
      }
    });

    // Position immediately at the correct spot
    this.draggedElement.style.left = `${event.clientX - this.dragOffsetX}px`;
    this.draggedElement.style.top = `${event.clientY - this.dragOffsetY}px`;
    document.body.appendChild(this.draggedElement);

    targetEl.addEventListener('dragend', (e: Event) => {
      this.dragEnd(e as DragEvent).catch(err => console.error('Error in dragEnd:', err));
    }, { once: true });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', ingredient.ingredientName);
      // Use transparent 1x1 image as default drag image (we render our own)
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      event.dataTransfer.setDragImage(img, 0, 0);
    }
  }

  followMouse = (event: MouseEvent) => {
    if (this.draggedElement) {
      this.draggedElement.style.left = `${event.clientX - this.dragOffsetX}px`;
      this.draggedElement.style.top = `${event.clientY - this.dragOffsetY}px`;
    }
  }

  async dragEnd(_event: DragEvent): Promise<void> {
    if (this.draggedElement?.parentNode) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement.parentNode.removeChild(this.draggedElement);
    }

    this.clearDragState();
  }

  clearDragState(): void {
    this.draggedIng.set(null);
    this.sourceContainer = null;
    this.dropSuccessful = false;
    this.draggedElement = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }

  private touchStartTimer: ReturnType<typeof setTimeout> | null = null;
  private touchActive = false;

  touchStart(event: TouchEvent, ingredient: IngredientViewModel, available: boolean): void {
    // Don't start drag when interacting with input/select elements
    const origin = event.target as HTMLElement;
    if (origin?.closest('input, select, textarea')) {
      return;
    }

    const touch = event.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    this.touchStartTimer = setTimeout(() => {
      this.touchActive = true;
      const targetEl = (event.target as HTMLElement).closest('.ingredient-card') as HTMLElement;
      if (!targetEl) return;

      this.draggedIng.set(ingredient);
      this.sourceContainer = available ? 'available' : 'unavailable';
      this.dropSuccessful = false;

      const rect = targetEl.getBoundingClientRect();
      this.dragOffsetX = startX - rect.left;
      this.dragOffsetY = startY - rect.top;

      this.draggedElement = targetEl.cloneNode(true) as HTMLElement;
      this.draggedElement.style.width = `${rect.width}px`;
      this.draggedElement.classList.add('dragging');
      this.draggedElement.style.left = `${startX - this.dragOffsetX}px`;
      this.draggedElement.style.top = `${startY - this.dragOffsetY}px`;
      document.body.appendChild(this.draggedElement);
    }, 250);
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.touchActive || !this.draggedElement) {
      // If moved before long-press triggers, cancel it
      if (this.touchStartTimer) {
        clearTimeout(this.touchStartTimer);
        this.touchStartTimer = null;
      }
      return;
    }

    event.preventDefault();
    const touch = event.touches[0];
    this.draggedElement.style.left = `${touch.clientX - this.dragOffsetX}px`;
    this.draggedElement.style.top = `${touch.clientY - this.dragOffsetY}px`;
  }

  async onTouchEnd(event: TouchEvent): Promise<void> {
    if (this.touchStartTimer) {
      clearTimeout(this.touchStartTimer);
      this.touchStartTimer = null;
    }

    if (!this.touchActive || !this.draggedElement) {
      this.touchActive = false;
      return;
    }

    const touch = event.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (dropTarget) {
      const dragged = this.draggedIng();

      // Check if dropped on a slot
      const slotEl = dropTarget.closest('.slot-empty, .ingredient-card.available');
      const availableSection = dropTarget.closest('#available-ingredients');
      const unavailableSection = dropTarget.closest('#unavailable-ingredients');

      if (dragged && slotEl) {
        // Find the slot number from the grid
        const slotGrid = slotEl.closest('.slot-grid');
        if (slotGrid) {
          const slots = Array.from(slotGrid.children);
          const idx = slots.indexOf(slotEl as Element);
          if (idx >= 0) {
            const slotNumber = idx + 1;
            if (dragged.pumpSlot !== slotNumber) {
              this.swapIngredientIntoSlot(dragged.ingredientName, slotNumber);
              await this.saveIngredients();
            }
          }
        }
      } else if (dragged && unavailableSection && dragged.pumpSlot !== null) {
        await this.moveIngredient(dragged, false);
      } else if (dragged && availableSection && dragged.pumpSlot === null) {
        await this.moveIngredient(dragged, true);
      }
    }

    // Cleanup
    if (this.draggedElement?.parentNode) {
      this.draggedElement.parentNode.removeChild(this.draggedElement);
    }
    this.touchActive = false;
    this.clearDragState();
  }

  dragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async availableDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const dragged = this.draggedIng();
    if (!dragged || dragged.pumpSlot !== null) {
      return;
    }

    await this.moveIngredient(dragged, true);
    this.dropSuccessful = true;
  }

  async slotDrop(event: DragEvent, slotNumber: number): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const dragged = this.draggedIng();
    if (!dragged) {
      return;
    }

    // If dropping back on its own slot, do nothing
    if (dragged.pumpSlot === slotNumber) {
      return;
    }

    this.swapIngredientIntoSlot(dragged.ingredientName, slotNumber);
    this.dropSuccessful = true;
    await this.saveIngredients();
  }

  async unavailableDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const dragged = this.draggedIng();
    if (!dragged || dragged.pumpSlot === null) {
      return;
    }

    await this.moveIngredient(dragged, false);
    this.dropSuccessful = true;
  }

  async moveToUnavailable(ingredient: Ingredient): Promise<void> {
    await this.moveIngredient(ingredient, false);
  }

  async moveToAvailable(ingredient: Ingredient): Promise<void> {
    await this.moveIngredient(ingredient, true);
  }

  private async moveIngredient(ingredient: Ingredient, toAvailable: boolean): Promise<void> {
    const allIngredients = this.getAllIngredients();
    const currentIngredient = allIngredients.find(ing => ing.ingredientName === ingredient.ingredientName);
    if (!currentIngredient) {
      return;
    }

    if (toAvailable) {
      if (currentIngredient.pumpSlot !== null) {
        return;
      }

      const nextSlot = this.getNextAvailableSlot();
      if (nextSlot === null) {
        this.setGlobalError('No free machine slot is available for this ingredient.');
        return;
      }

      this.applyIngredientUpdates([{...currentIngredient, pumpSlot: nextSlot}]);
    } else {
      if (currentIngredient.pumpSlot === null) {
        return;
      }
      this.applyIngredientUpdates([{...currentIngredient, pumpSlot: null}]);
    }

    await this.saveIngredients();
  }

  async updateRemaining(ingredient: Ingredient, event: FocusEvent): Promise<void> {
    const target = event.target as HTMLInputElement;
    const newValue = Number.parseInt(target.value, 10);
    const currentIngredient = this.getAllIngredients().find(ing => ing.ingredientName === ingredient.ingredientName);

    if (!currentIngredient) {
      return;
    }

    if (!this.isValidAmount(newValue)) {
      target.value = currentIngredient.remainingAmount.toString();
      return;
    }

    if (newValue === currentIngredient.remainingAmount) {
      return;
    }

    const updatedIngredient: Ingredient = {
      ...currentIngredient,
      remainingAmount: newValue,
      maxAmount: Math.max(newValue, currentIngredient.maxAmount)
    };

    target.value = updatedIngredient.remainingAmount.toString();
    this.applyIngredientUpdates([updatedIngredient]);
    await this.saveIngredients();
  }

  async updateMaxAmount(ingredient: Ingredient, event: FocusEvent): Promise<void> {
    const target = event.target as HTMLInputElement;
    const newValue = Number.parseInt(target.value, 10);
    const currentIngredient = this.getAllIngredients().find(ing => ing.ingredientName === ingredient.ingredientName);

    if (!currentIngredient) {
      return;
    }

    if (!this.isValidAmount(newValue, 1)) {
      target.value = currentIngredient.maxAmount.toString();
      return;
    }

    if (newValue === currentIngredient.maxAmount) {
      return;
    }

    const updatedIngredient: Ingredient = {
      ...currentIngredient,
      maxAmount: newValue,
      remainingAmount: Math.min(currentIngredient.remainingAmount, newValue)
    };

    target.value = updatedIngredient.maxAmount.toString();
    this.applyIngredientUpdates([updatedIngredient]);
    await this.saveIngredients();
  }

  getLiquidPercentage(ingredient: Ingredient): number {
    if (!ingredient.maxAmount || ingredient.maxAmount <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (ingredient.remainingAmount / ingredient.maxAmount) * 100));
  }

  getLiquidClass(ingredient: Ingredient): string {
    const pct = this.getLiquidPercentage(ingredient);
    if (pct > 75) return 'liquid-green';
    if (pct > 30) return 'liquid-orange';
    return 'liquid-red';
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
    return this.getIngredientRenderKey(ingredient);
  }

  private getNextAvailableSlot(): number | null {
    const usedSlots = new Set(
      this.getAllIngredients()
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
      await this.ingredientsService.saveIngredients(this.getAllIngredients());
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}
  clearFieldError(_f?: string): void {}
}
