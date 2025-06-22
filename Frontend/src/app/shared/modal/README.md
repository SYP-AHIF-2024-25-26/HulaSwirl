# Universal Modal System

This directory provides a simple, reusable modal implementation for the Angular application.

## Usage

1. **Import the host component** once in `AppComponent` (or another root component):

```ts
imports: [ModalHostComponent, ...]
```

In the template add:

```html
<app-modal-host></app-modal-host>
```

2. **Open a modal** from any component by injecting `UniversalModalService` and calling `open`:

```ts
const id = modalService.open({
  title: 'Hello',
  body: 'This modal uses the universal modal system.',
  buttons: [{ label: 'Ok' }]
});
```

3. **Custom body or footer** can be provided with a `TemplateRef` or component class.
Data can be passed via the `data` property and accessed inside the component
using the `MODAL_DATA` injection token.

If your component already contains its own modal layout (e.g. `modal-form`), set
`rawBody: true` so only the backdrop is provided.

## Migrating existing modals

Existing modal components can be wrapped inside the universal modal by passing
the component type to the `body` property. Any previously used inputs can be
replaced with values provided through `data`.

```ts
modalService.open({
  title: 'Edit drink',
  body: DrinkModalComponent,
  data: { drink },
  persist: true
});
```

The old modal-specific service calls can be removed, since the `UniversalModalService`
handles stacking and cleanup.
