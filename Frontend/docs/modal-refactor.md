# Unified modal system

This project now uses a single `<dialog>`-powered shell (`app-generic-modal`) and a service-driven API (`ModalService`) to render every modal with consistent chrome, behavior, and accessibility.

## Architecture overview
- **Modal shell (`app-generic-modal`)** – owns the `<dialog>` element, header (title/subtitle/icon), close affordances (X button, ESC, optional backdrop click), scrollable body, and footer/button area. Supports projected content or `TemplateRef`-driven bodies/footers and emits `closed` when the dialog is dismissed.
- **Modal host (`app-modal-host`)** – listens to the modal service and paints dynamic dialogs from configuration objects (title, message, template refs, button configs). It is mounted once in `app.component.html`.
- **Modal service (`ModalService`)** – still exposes the legacy `openModal/closeModal` API for `ModalType` screens, and also adds a template-friendly `open(config)` method that accepts title/size/icon, `TemplateRef` content, footer button definitions, and backdrop/ESC flags. Focus is preserved when opening/closing, and the body is locked whenever any modal is active.

## Core code
### Modal shell (TypeScript)
```ts
// src/app/modals/generic-modal/generic-modal.component.ts
@Input() title = '';
@Input() subtitle?: string;
@Input() icon?: ModalIcon;
@Input() size: ModalSize = 'medium';
@Input() closeOnEsc = true;
@Input() closeOnBackdrop = true;
@Input() bodyTemplate?: TemplateRef<GenericModalTemplateContext>;
@Input() footerTemplate?: TemplateRef<GenericModalTemplateContext>;
@Input() data: unknown = null;
@Input() footerButtons: GenericModalButton[] = [];
@Output() closed = new EventEmitter<void>();
// Opens the native <dialog>, manages focus, handles ESC/backdrop, emits closed
```

### Modal shell (template)
```html
<!-- src/app/modals/generic-modal/generic-modal.component.html -->
<dialog #dialog class="modal-dialog" ...>
  <div class="modal-card">
    <header class="modal-head"> ... close button ... </header>
    <section class="modal-body">
      <ng-container *ngIf="bodyTemplate; else projectedBody"
                    [ngTemplateOutlet]="bodyTemplate"
                    [ngTemplateOutletContext]="{ data: data, close: requestClose.bind(this) }">
      </ng-container>
      <ng-template #projectedBody>
        <ng-content select="[modal-body]"></ng-content>
      </ng-template>
    </section>
    <footer class="modal-footer">
      <ng-container *ngIf="footerTemplate; else projectedFooter" ...></ng-container>
      <ng-template #projectedFooter>
        <ng-content select="[modal-footer]"></ng-content>
        <div class="modal-buttons">
          <ng-content select="[modal-buttons]"></ng-content>
          <button *ngFor="let btn of footerButtons" ... (click)="handleButtonClick(btn)">{{ btn.label }}</button>
        </div>
      </ng-template>
    </footer>
  </div>
</dialog>
```

### Modal service API
```ts
// src/app/services/modal.service.ts
open<T>(config: ModalConfig<T>) {
  const id = config.id ?? (globalThis.crypto?.randomUUID?.() ?? fallbackId);
  const modal: ActiveModal<T> = {
    id,
    config: { size: 'medium', closeOnBackdrop: true, closeOnEsc: true, ...config },
    restoreFocus: document.activeElement as HTMLElement | null,
  };
  this.dynamicModals.set([...this.dynamicModals(), modal]);
  return { id, close: () => this.closeDynamic(id) };
}
```
`ModalConfig` accepts `title`, `subtitle`, `icon`, `size`, `message`, `data`, `TemplateRef` body/footer, `footerButtons`, `closeOnEsc`, and `closeOnBackdrop`.

### Modal host
```html
<!-- src/app/modals/modal-host/modal-host.component.html -->
@for (modal of modals(); track modal.id) {
  <app-generic-modal [title]="modal.config.title || 'Modal'" ... (closed)="modalService.closeDynamic(modal.id)">
    <div modal-body *ngIf="!modal.config.bodyTemplate && modal.config.message" class="modal-message">
      {{ modal.config.message }}
    </div>
  </app-generic-modal>
}
```
Mount the host once in `app.component.html` (`<app-modal-host></app-modal-host>`).

## Migration examples
### Configure your own Drink (before → after)
- **Before:** A bespoke modal frame in `order-custom-drink-modal.component.html` wrapped the form and buttons.
- **After:** The same body lives inside the shared shell—only the inner form remains:
```html
<app-generic-modal title="Configure your own Drink" [size]="'large'" (closed)="closeModal()">
  <div id="ingredient-list" modal-body> ... </div>
  <div modal-footer> ... </div>
  <div modal-buttons class="order-buttons"> ... </div>
</app-generic-modal>
```

### Blue Lagoon details
```html
<app-generic-modal [title]="selectedDrink()?.name" [size]="'medium'" (closed)="closeModal()">
  <div modal-body>
    <div id="drink-overview"> <!-- image + ingredient list --> </div>
    <div id="toppings"> ... </div>
  </div>
  <div modal-buttons>
    <button class="button submit-btn" (click)="submitOrder()">Order</button>
  </div>
</app-generic-modal>
```

### Add/Edit Drink form
```html
<app-generic-modal [title]="getTitle()" [size]="'large'" (closed)="closeModal()">
  <div modal-body>
    <div class="modal-content"> <!-- upload + form fields + ingredient rows --> </div>
  </div>
  <div modal-buttons>
    <button class="button cancel-btn" (click)="closeModal()">Cancel</button>
    <button class="button submit-btn" (click)="save()">{{ saveLabel }}</button>
  </div>
</app-generic-modal>
```

### Simple Status alert
```ts
// Anywhere in a component
const ref = this.modalService.open({
  title: 'Status',
  icon: 'info',
  message: 'Your drink is queued!',
  footerButtons: [{ label: 'OK', variant: 'primary' }]
});
```
The modal host renders this using the shared shell automatically.

## Adding a new modal (step-by-step)
1. **Define any data model** you need in the calling component.
2. **Create the body template** (if not just a message):
   ```html
   <ng-template #newDrinkTemplate let-data let-close="close">
     <form (ngSubmit)="save(close)"> ... </form>
   </ng-template>
   ```
3. **Open the modal via the service:**
   ```ts
   this.modalService.open({
     title: 'Create Drink',
     size: 'large',
     bodyTemplate: this.newDrinkTemplate,
     data: formModel,
     footerButtons: [{ label: 'Cancel' }, { label: 'Save', variant: 'primary', action: () => this.save() }],
   });
   ```
4. **Handle results/buttons:** use the `action` callbacks on `footerButtons` or call the `close` function provided in the template context.

