import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCustomDrinkModalComponent } from './order-custom-drink-modal.component';

describe('OrderCustomDrinkModalComponent', () => {
  let component: OrderCustomDrinkModalComponent;
  let fixture: ComponentFixture<OrderCustomDrinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCustomDrinkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderCustomDrinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
