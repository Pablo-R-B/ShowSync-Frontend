import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSalaComponent } from './formulario-sala.component';

describe('FormularioSalaComponent', () => {
  let component: FormularioSalaComponent;
  let fixture: ComponentFixture<FormularioSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioSalaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
