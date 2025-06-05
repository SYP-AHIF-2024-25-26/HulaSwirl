import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusModalComponent } from './status-modal.component';

describe('ErrorModalComponent', () => {
  let component: StatusModalComponent;
  let fixture: ComponentFixture<StatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
