import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilPromotoresComponent } from './perfil-promotores.component';

describe('PerfilPromotoresComponent', () => {
  let component: PerfilPromotoresComponent;
  let fixture: ComponentFixture<PerfilPromotoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPromotoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilPromotoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
