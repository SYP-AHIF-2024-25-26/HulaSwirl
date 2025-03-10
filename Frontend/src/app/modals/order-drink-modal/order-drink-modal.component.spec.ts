import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDrinkModalComponent } from './order-drink-modal.component';

describe('OrderDrinkModalComponent', () => {
  let component: OrderDrinkModalComponent;
  let fixture: ComponentFixture<OrderDrinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDrinkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDrinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
