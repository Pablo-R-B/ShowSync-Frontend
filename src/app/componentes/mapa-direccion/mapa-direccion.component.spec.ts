import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaDireccionComponent } from './mapa-direccion.component';

describe('MapaDireccionComponent', () => {
  let component: MapaDireccionComponent;
  let fixture: ComponentFixture<MapaDireccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaDireccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaDireccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
