# Modal system refactor

This project now ships a reusable modal infrastructure based on the native `<dialog>` element. The new shell component (`app-modal`) centralizes styling, sizing, accessibility, and keyboard/backdrop handling, while keeping modal content customizable through Angular `TemplateRef` instances.

## Architecture overview
- **`ModalComponent`** (`src/app/shared/modal/modal.component.ts`): wraps `<dialog>` and renders a reusable window with header, body, and footer regions plus configurable buttons and close behaviour.
- **`ModalHostComponent`** (`src/app/shared/modal/modal-host.component.ts`): renders every modal in the stack exposed by `ModalService` and wires template contexts (`{ data, close }`).
- **`ModalService`** (`src/app/services/modal.service.ts`): manages a stack of modal instances, supports both template-driven configs (`open`, `openMessage`) and legacy type-based calls (`openModal`, `getDisplayedModal`, `getModalData`).
- **`GenericModalComponent`** (`src/app/modals/generic-modal/generic-modal.component.ts`): now delegates layout to `app-modal`, so every modal shares the same shell styles and behaviour.

All visual styles for the shell live in `src/app/shared/modal/modal.component.css`, giving every modal the same backdrop, rounded surface, spacing, and close affordances.

## Core API
```ts
// Programmatic usage
const id = modalService.open({
  title: 'Status',
  message: 'Your drink is ready!',
  size: 'small',
  icon: 'success',
  backdropClose: true,
  buttons: [{ label: 'OK', appearance: 'primary' }],
  bodyTemplate: this.statusBody,      // TemplateRef
  footerTemplate: this.footerActions,  // TemplateRef
  data: { drink }
});

// Convenience alert
modalService.openMessage('Status', 'Saved successfully');
```

`ModalConfig` options include title/subtitle, size (`small | medium | large`), custom width, icon, message, ESC/backdrop closing flags, header/body/footer templates, and footer buttons (`appearance`, `keepOpen`, `onClick`).

The context passed into templates is `{ data, close }` so templates can access modal data and invoke `close()` without additional plumbing.

## Template-driven usage examples
Below are concise migration sketches showing how to move existing modals onto the shared shell without creating near-duplicate components.

### Configure your own drink (before → after)
**Before:** `<app-order-custom-drink-modal>` wrapped its own modal chrome via `app-generic-modal`.

**After:**
```html
<!-- In the owning component template -->
<ng-template #configureDrink let-close="close">
  <app-order-custom-drink-modal (closed)="close()"></app-order-custom-drink-modal>
</ng-template>
```
```ts
// Trigger
modalService.open({
  title: 'Configure your own Drink',
  size: 'large',
  bodyTemplate: this.configureDrink,
  data: { /* form model */ }
});
```

### Drink details ("Blue Lagoon")
```html
<ng-template #drinkDetails let-drink let-close="close">
  <div class="details-layout">
    <img [src]="drink.imgUrl" alt="{{ drink.name }}" />
    <section>
      <h3>Ingredients</h3>
      <ul>
        <li *ngFor="let ing of drink.drinkIngredients">{{ ing.ingredientName }} — {{ ing.amount }} ml</li>
      </ul>
      <h4>Toppings</h4>
      <p>{{ drink.toppings }}</p>
    </section>
  </div>
</ng-template>
```
```ts
modalService.open({
  title: drink.name,
  size: 'large',
  bodyTemplate: this.drinkDetails,
  data: drink,
  buttons: [{ label: 'Order', appearance: 'primary', onClick: () => orderDrink(drink) }]
});
```

### Add / Edit drink form
```html
<ng-template #editDrink let-data let-close="close">
  <app-drink-modal [drink]="data" (saved)="close()" (deleted)="close()"></app-drink-modal>
</ng-template>
```
```ts
modalService.open({
  title: data ? 'Edit Drink' : 'Add Drink',
  size: 'large',
  bodyTemplate: this.editDrink,
  data,
  buttons: [{ label: data ? 'Update' : 'Add', appearance: 'primary', keepOpen: true }]
});
```

### Simple status/info modal
```ts
modalService.openMessage('Status', 'Order submitted successfully', {
  size: 'small',
  icon: 'success'
});
```
A custom body/footer template can be supplied for richer messaging (progress bars, links, etc.).

## Adding a brand-new modal
1. **Define data**: create any interface or object your template needs.
2. **Write a template**: place an `ng-template` in the relevant component and design the body content. The template receives `let-data` and `let-close="close"` from the modal host.
3. **Open it**: call `modalService.open({ title, bodyTemplate: this.someTemplate, data, buttons: [...] })`.
4. **Handle results**: attach `onClick` handlers to footer buttons or call `close()` from inside the template to resolve/close.

## Notes on legacy modals
The original `ModalService` API (`openModal`, `getDisplayedModal`, `getModalData`) still works for existing components while new work should prefer `open`/`openMessage` with templates. `GenericModalComponent` now renders through the shared shell so existing modals automatically gain the unified styling.
