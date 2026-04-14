import {Component, effect, inject, signal, untracked, WritableSignal} from '@angular/core';
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

  /** Holds per-ingredient validation/status messages (kept separate to avoid reactive write loops). */
  private readonly ingredientStatus = signal<Record<string, string>>({});

  protected title = signal<string>('Configure your own Drink');

  prompt = signal<string>('');
  aiGenerating = signal<boolean>(false);

  /** Prevents re-applying the same reorder payload repeatedly (which can cause reactive loops). */
  private lastAppliedReorderKey = '';

  /** Step size in ml for the +/- controls and keyboard adjustments. */
  readonly step = 10;
  /** Maximum allowed amount per ingredient (ml). */
  readonly maxAmount = 500;

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
        this.lastAppliedReorderKey = '';
        this.title.set('Configure your own Drink');
        return;
      }

      const items = (data.ingredients ?? [])
        .filter(i => !!i.ingredientName)
        .map(i => ({ ingredientName: i.ingredientName, amount: i.amount }))
        .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

      const key = JSON.stringify({
        drinkName: data.drinkName ?? '',
        items
      });

      if (key === this.lastAppliedReorderKey) return;
      this.lastAppliedReorderKey = key;

      this.title.set(data.drinkName?.trim() ? `Reorder: ${data.drinkName}` : 'Reorder');
      this.prompt.set('');

      const baseAmounts = untracked(() => this.ingredientAmounts());
      const nextAmounts: Record<string, number> = { ...baseAmounts };

      // Reset all to 0 first (better mental model when reordering)
      for (const name of Object.keys(nextAmounts)) nextAmounts[name] = 0;

      for (const i of items) {
        const amt = this.clampToStep(i.amount ?? 0);
        nextAmounts[i.ingredientName] = amt;
      }

      this.ingredientAmounts.set(nextAmounts);
    });
  }

  /** Derive the backend payload from current amounts (amount>0 = active). */
  private buildOrderPayload(): OrderPreparation[] {
    const amounts = this.ingredientAmounts();
    const status = this.ingredientStatus();

    const next: OrderPreparation[] = [];
    for (const [ingredientName, amount] of Object.entries(amounts)) {
      if ((amount ?? 0) > 0) {
        next.push({ ingredientName, amount, status: status[ingredientName] ?? '' });
      }
    }

    next.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    return next;
  }

  isSelected(name: string): boolean {
    return this.getAmount(name) > 0;
  }

  /** Ensure amount is between 0..max and aligned to step (10ml). */
  private clampToStep(value: number): number {
    const v = Number.isFinite(value) ? value : 0;
    const clamped = Math.max(0, Math.min(this.maxAmount, v));
    return Math.round(clamped / this.step) * this.step;
  }

  setAmount(name: string, value: number) {
    this.clearGlobalError();
    this.clearFieldError(name);

    const nextValue = this.clampToStep(value);
    this.ingredientAmounts.set({ ...this.ingredientAmounts(), [name]: nextValue });

    // If the user sets an ingredient back to 0, clear any lingering status.
    if (nextValue === 0) {
      const statuses = { ...this.ingredientStatus() };
      delete statuses[name];
      this.ingredientStatus.set(statuses);
    }
  }

  increment(name: string) {
    this.setAmount(name, this.getAmount(name) + this.step);
  }

  decrement(name: string) {
    this.setAmount(name, this.getAmount(name) - this.step);
  }

  /** Keyboard: ArrowUp/ArrowDown adjust by 10ml; Home/End jump to min/max. */
  onAmountKeyDown(name: string, ev: KeyboardEvent) {
    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault();
        this.increment(name);
        break;
      case 'ArrowDown':
        ev.preventDefault();
        this.decrement(name);
        break;
      case 'Home':
        ev.preventDefault();
        this.setAmount(name, 0);
        break;
      case 'End':
        ev.preventDefault();
        this.setAmount(name, this.maxAmount);
        break;
    }
  }

  getAmount(name: string): number {
    return this.ingredientAmounts()[name] ?? 0;
  }

  getTotalAmount(): number {
    return Object.values(this.ingredientAmounts()).reduce((sum, v) => sum + (v ?? 0), 0);
  }

  get canSubmit(): boolean {
    return this.getTotalAmount() > 0;
  }

  // updateAmount stays as the single entry point from input bindings
  updateAmount(name: string, value: number) {
    this.setAmount(name, value);
  }

  async submitOrder() {
    this.clearGlobalError();
    // don't auto-clear field errors here; server might respond with them

    const payload = this.buildOrderPayload();
    try {
      if (payload.every(ing => ing.status === '')) {
        await this.ingredientsService.postOrder(payload.map(ing => ({
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
      const statuses = { ...this.ingredientStatus() };
      delete statuses[fieldName];
      this.ingredientStatus.set(statuses);
    } else {
      this.ingredientStatus.set({});
    }
  }

  getStatus(name: string): string {
    return this.ingredientStatus()[name] ?? '';
  }

  setFieldError(fieldName: string, message: string) {
    if (fieldName === 'ingredients') {
      this.setGlobalError(message);
      return;
    }

    // Map API-provided fieldName to the actual ingredient name (case-insensitive)
    const available = this.availableIngredients();
    const matchedName = available.find(i => i.ingredientName.toLowerCase() === fieldName.toLowerCase())?.ingredientName;
    const key = matchedName ?? fieldName;

    const statuses = { ...this.ingredientStatus(), [key]: message };
    this.ingredientStatus.set(statuses);
  }

  closeModal() {
    this.clearGlobalError();
    this.clearFieldError();
    this.orderIngredients.set([]);
    this.ingredientAmounts.set({});
    this.ingredientStatus.set({});
    this.prompt.set('');
    this.title.set('Configure your own Drink');
    this.lastAppliedReorderKey = '';
    this.modalService.closeModal();
  }
}
