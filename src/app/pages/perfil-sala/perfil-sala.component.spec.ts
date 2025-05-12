import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilSalaComponent } from './perfil-sala.component';

describe('PerfilSalaComponent', () => {
  let component: PerfilSalaComponent;
  let fixture: ComponentFixture<PerfilSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilSalaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
