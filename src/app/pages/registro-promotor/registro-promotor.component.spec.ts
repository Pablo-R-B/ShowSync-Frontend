import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPromotorComponent } from './registro-promotor.component';

describe('RegistroPromotorComponent', () => {
  let component: RegistroPromotorComponent;
  let fixture: ComponentFixture<RegistroPromotorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPromotorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPromotorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
