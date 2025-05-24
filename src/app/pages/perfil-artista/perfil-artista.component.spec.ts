import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilArtistaComponent } from './perfil-artista.component';

describe('PerfilArtistaComponent', () => {
  let component: PerfilArtistaComponent;
  let fixture: ComponentFixture<PerfilArtistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilArtistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilArtistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
