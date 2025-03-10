import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrinkModalComponent } from './add-drink-modal.component';

describe('AddDrinkModalComponent', () => {
  let component: AddDrinkModalComponent;
  let fixture: ComponentFixture<AddDrinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDrinkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDrinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
