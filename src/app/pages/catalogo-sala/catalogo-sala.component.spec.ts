import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoSalaComponent } from './catalogo-sala.component';

describe('CatalogoSalaComponent', () => {
  let component: CatalogoSalaComponent;
  let fixture: ComponentFixture<CatalogoSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoSalaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
