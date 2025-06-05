import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTerminalComponent } from './order-terminal.component';

describe('OrderTerminalComponent', () => {
  let component: OrderTerminalComponent;
  let fixture: ComponentFixture<OrderTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTerminalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
