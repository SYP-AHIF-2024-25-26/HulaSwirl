import {Component, computed, effect, inject, signal, untracked, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Ingredient, IngredientsService, OrderPreparation} from '../../services/ingredients.service';
import {ModalService} from '../../services/modal.service';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {GenericModalComponent} from '../generic-modal/generic-modal.component';

export type CustomOrderModalData =
  | null
  | {
      mode?: 'reorder';
      drinkName?: string;
      containsIce?: boolean;
      ingredients?: { ingredientName: string; amount: number }[];
    };

@Component({
  selector: 'app-order-custom-drink-modal',
  imports: [FormsModule, GenericModalComponent],
  templateUrl: './order-custom-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-custom-drink-modal.component.css'
})
export class OrderCustomDrinkModalComponent extends ErrorHandlingComponent {
  private readonly ingredientsService = inject(IngredientsService);
  private readonly modalService = inject(ModalService);

  protected readonly modalData = this.modalService.getModalData();

  availableIngredients: WritableSignal<Ingredient[]> = signal([]);
  orderIngredients: WritableSignal<OrderPreparation[]> = signal([]);
  ingredientAmounts: WritableSignal<Record<string, number>> = signal({});

  protected title = signal<string>('Configure your own Drink');

  prompt = signal<string>('');
  aiGenerating = signal<boolean>(false);
  protected canSubmit = computed(() => this.orderIngredients().length > 0 && !this.globalError());

  /** Prevents re-applying the same reorder payload repeatedly (which can cause reactive loops). */
  private lastAppliedReorderKey = '';

  constructor() {
    super();
    effect(() => {
      const all = this.ingredientsService.ingredients().filter(i => i.pumpSlot !== null);
      this.availableIngredients.set(all);

      // Avoid tracking ingredientAmounts() inside this effect.
      const currentAmounts = untracked(() => this.ingredientAmounts());
      const next: Record<string, number> = { ...currentAmounts };
      let changed = false;
      for (const ing of all) {
        if (!(ing.ingredientName in next)) {
          next[ing.ingredientName] = 0;
          changed = true;
        }
      }
      if (changed) this.ingredientAmounts.set(next);
    });

    // Prefill from modal data when opened for reorder.
    effect(() => {
      const data = this.modalData() as CustomOrderModalData;
      const isReorder = !!data && data.mode === 'reorder';

      if (!isReorder) {
        // If we were previously in reorder mode, reset idempotency so the next reorder applies.
        this.lastAppliedReorderKey = '';
        this.title.set('Configure your own Drink');
        return;
      }

      // Build a stable key for this reorder payload.
      const items = (data.ingredients ?? [])
        .filter(i => !!i.ingredientName)
        .map(i => ({ ingredientName: i.ingredientName, amount: i.amount }))
        .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

      const key = JSON.stringify({
        drinkName: data.drinkName ?? '',
        items
      });

      if (key === this.lastAppliedReorderKey) {
        return; // already applied
      }
      this.lastAppliedReorderKey = key;

      this.title.set(data.drinkName?.trim() ? `Reorder: ${data.drinkName}` : 'Reorder');
      this.prompt.set('');

      // Start from current amounts without tracking to avoid feedback loops.
      const baseAmounts = untracked(() => this.ingredientAmounts());
      const nextAmounts: Record<string, number> = { ...baseAmounts };
      const nextSelected: OrderPreparation[] = [];

      for (const i of items) {
        const amt = i.amount && i.amount > 0 ? i.amount : 0;
        nextAmounts[i.ingredientName] = amt;
        nextSelected.push({ ingredientName: i.ingredientName, amount: amt, status: '' });
      }

      this.ingredientAmounts.set(nextAmounts);
      this.orderIngredients.set(nextSelected);
    });
  }

  isSelected(name: string): boolean {
    return this.orderIngredients().some(i => i.ingredientName === name);
  }

  toggleIngredient(ingredient: Ingredient) {
    this.clearGlobalError();
    this.clearFieldError(ingredient.ingredientName);
    const checked = this.isSelected(ingredient.ingredientName);
    const name = ingredient.ingredientName;
    const amount = this.getAmount(name);
    if (!checked) {
      this.orderIngredients.set([...this.orderIngredients(), {ingredientName: name, amount, status: ''}]);
    } else {
      this.orderIngredients.set(this.orderIngredients().filter(i => i.ingredientName !== name));
    }
  }

  getAmount(name: string): number {
    return this.ingredientAmounts()[name] ?? 0;
  }

  updateAmount(name: string, value: number) {
    this.clearFieldError(name);
    const nextValue = value && value > 0 ? value < 500 ? value : 500 : 1;
    this.ingredientAmounts.set({...this.ingredientAmounts(), [name]: nextValue});
    if (this.isSelected(name)) {
      this.orderIngredients.set(this.orderIngredients().map(i => i.ingredientName === name ? {...i, amount: nextValue} : i));
    }
  }

  adjustAmount(name: string, delta: number) {
    const current = this.getAmount(name) || 1;
    const next = Math.min(500, Math.max(1, current + delta));
    this.updateAmount(name, next);
    if (!this.isSelected(name)) {
      this.orderIngredients.set([...this.orderIngredients(), {ingredientName: name, amount: next, status: ''}]);
    }
  }

  getStatus(name: string): string {
    const item = this.orderIngredients().find(i => i.ingredientName === name);
    return item ? item.status : '';
  }

  setFieldError(fieldName: string, message: string) {
    if(fieldName == "ingredients") {
      this.setGlobalError(message);
      return;
    }
    const idx = this.orderIngredients().findIndex(i => i.ingredientName.toLowerCase() === fieldName.toLowerCase());
    if (idx >= 0) {
      const arr = [...this.orderIngredients()];
      arr[idx] = { ...arr[idx], status: message };
      this.orderIngredients.set(arr);
    }
  }

  async submitOrder() {
    this.clearGlobalError();
    this.clearFieldError();
    try {
      if (this.orderIngredients().every(ing => ing.status === '')) {
        await this.ingredientsService.postOrder(this.orderIngredients().map(ing => ({
          ingredientName: ing.ingredientName,
          amount: ing.amount
        })));
        this.closeModal();
      }
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  async aiGenerate() {
    this.clearGlobalError();
    this.clearFieldError();
    this.aiGenerating.set(true);
    try {
      const result = await this.ingredientsService.generateOrder(this.prompt());

      const required = new Map<string, number>();
      for (const di of result) {
        required.set(di.ingredientName, di.amount);
      }

      const available = this.availableIngredients();
      const currentSelected = new Set(this.orderIngredients().map(i => i.ingredientName));
      const nextSelected: OrderPreparation[] = [];

      for (const ing of available) {
        const name = ing.ingredientName;
        if (required.has(name)) {
          const amount = required.get(name)!;
          this.ingredientAmounts.set({
            ...this.ingredientAmounts(),
            [name]: amount
          });
          nextSelected.push({ingredientName: name, amount, status: ''});
        } else if (currentSelected.has(name)) {
          this.ingredientAmounts.set({
            ...this.ingredientAmounts(),
            [name]: 0
          });
        }
      }

      this.orderIngredients.set(nextSelected);
    } catch (e) {
      this.handleError(e);
    } finally {
      this.aiGenerating.set(false);
    }
  }

  clearFieldError(fieldName: string = "") {
    if( fieldName) {
      const updatedIngredients = this.orderIngredients().map(i =>
        i.ingredientName === fieldName ? { ...i, status: '' } : i
      );
      this.orderIngredients.set(updatedIngredients);
    } else {
      this.orderIngredients.set(this.orderIngredients().map(i => ({ ...i, status: '' })));
    }
  }

  closeModal() {
    this.clearGlobalError();
    this.clearFieldError();
    this.orderIngredients.set([]);
    this.ingredientAmounts.set({});
    this.prompt.set('');
    this.title.set('Configure your own Drink');
    this.lastAppliedReorderKey = '';
    this.modalService.closeModal();
  }
}
