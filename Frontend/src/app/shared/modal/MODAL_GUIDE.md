# Modal architecture

The modal system now uses a single `<dialog>` based shell (`ModalShellComponent`) that handles the backdrop, close icon, sizing and keyboard/backdrop closing. Content is provided through templates (`#appModalBody`, `#appModalFooter`, `#appModalButtons`, optional `#appModalHeader`). All visuals come from `modal-shell.component.css` so every modal shares the same window chrome.

`ModalShellComponent` inputs are configured through `ModalConfig` (title, subtitle, icon, size, ESC/backdrop behaviour) and optional `ModalButtonConfig` entries for declarative footers. Slots can be filled either with the template references above or by passing `bodyTemplate`/`footerTemplate` inputs directly.

## API highlights

- **Config**: `{ title, subtitle, icon, size, closeOnEsc?, closeOnBackdrop?, footerButtons? }`.
- **Actions**: use `buttons`/`footerButtons` to supply simple action definitions, or project a custom `#appModalButtons` template for complex layouts.
- **Accessibility**: `<dialog>` provides focus trapping and Escape closing; the shell restores focus to the opener on close and prevents backdrop clicks when `closeOnBackdrop` is `false`.

## Migration examples

### Configure your own Drink (before → after)
- **Before:** wrapped in `app-generic-modal` with bespoke header/footer markup.
- **After:**

```html
<app-modal-shell
  [config]="{ title: 'Configure your own Drink', size: 'large', closeOnBackdrop: true }"
  (closed)="closeModal()"
>
  <ng-template #appModalBody>…ingredient list & AI generate form…</ng-template>
  <ng-template #appModalFooter><p class="error" *ngIf="globalError()">{{ globalError() }}</p></ng-template>
  <ng-template #appModalButtons>
    <button class="button cancel-btn" (click)="closeModal()">Cancel</button>
    <button class="button submit-btn" (click)="submitOrder()">Order</button>
  </ng-template>
</app-modal-shell>
```

### Blue Lagoon / details (order-drink)
- **Before:** used `app-generic-modal` with static footer buttons.
- **After:** uses shared shell with a simple body template and custom buttons:

```html
<app-modal-shell [config]="{ title: selectedDrink()?.name || 'Drink', size: 'medium', closeOnBackdrop: true }" (closed)="closeModal()">
  <ng-template #appModalBody>
    <h3>Ingredients:</h3>
    <ul>
      <li *ngFor="let ing of selectedDrink()?.drinkIngredients">{{ ing.amount }}ml {{ ing.ingredientName }}</li>
    </ul>
    <label class="ice-checkbox"><input type="checkbox" [(ngModel)]="containsIce"> With ice</label>
  </ng-template>
  <ng-template #appModalButtons>
    <button class="button cancel-btn" (click)="closeModal()">Cancel</button>
    <button class="button submit-btn" (click)="submitOrder()">Order</button>
  </ng-template>
</app-modal-shell>
```

### Add/Edit Drink form
- **Before:** bespoke modal markup duplicated the shell.
- **After:** the form lives inside `#appModalBody`, errors in `#appModalFooter`, and footer actions in `#appModalButtons` while the shell keeps the same card/backdrop.

### Status alert
- **Before:** separate modal component.
- **After:**

```html
<app-modal-shell [config]="{ title: 'Status', size: 'small', closeOnBackdrop: true }" (closed)="closeModal()">
  <ng-template #appModalBody>
    <p class="status-message">{{ statusMessage() }}</p>
    <div class="progress" *ngIf="progressVisible"><div class="progress-bar" [style.width.%]="progress"></div></div>
  </ng-template>
  <ng-template #appModalButtons>
    <button class="button submit-btn" (click)="closeModal()">OK</button>
  </ng-template>
</app-modal-shell>
```

## Creating a new modal
1. Define the data you need in the hosting component (signals/form models/etc.).
2. Add an `app-modal-shell` block and fill `#appModalBody`; optional `#appModalHeader`, `#appModalFooter`, `#appModalButtons` give you custom header/footer/action areas.
3. Configure behaviour with `[config]` (size, title, backdrop/Escape settings) and use `footerButtons` when simple buttons are enough.
4. Open the modal through the existing `ModalService.openModal(ModalType.YourType, data)` or by rendering the component via `*ngIf`; handle button clicks inside the projected templates.

This setup lets complex forms, detail views, or simple alerts all share one modal shell and styling while keeping body content as lightweight templates.
