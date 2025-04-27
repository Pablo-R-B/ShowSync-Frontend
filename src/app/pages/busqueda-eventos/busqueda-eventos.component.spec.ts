import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaEventosComponent } from './busqueda-eventos.component';

describe('BusquedaEventosComponent', () => {
  let component: BusquedaEventosComponent;
  let fixture: ComponentFixture<BusquedaEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
