import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoArtistasComponent } from './catalogo-artistas.component';

describe('CatalogoArtistasComponent', () => {
  let component: CatalogoArtistasComponent;
  let fixture: ComponentFixture<CatalogoArtistasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoArtistasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoArtistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
