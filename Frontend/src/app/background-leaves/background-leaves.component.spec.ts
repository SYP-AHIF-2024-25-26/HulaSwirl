import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundLeavesComponent } from './background-leaves.component';

describe('BackgroundLeavesComponent', () => {
  let component: BackgroundLeavesComponent;
  let fixture: ComponentFixture<BackgroundLeavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundLeavesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
