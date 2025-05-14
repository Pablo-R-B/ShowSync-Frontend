import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaPromotoresComponent } from './busqueda-promotores.component';

describe('BusquedaPromotoresComponent', () => {
  let component: BusquedaPromotoresComponent;
  let fixture: ComponentFixture<BusquedaPromotoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaPromotoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaPromotoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
