import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarEventosComponent } from './confirmar-eventos.component';

describe('ConfirmarEventosComponent', () => {
  let component: ConfirmarEventosComponent;
  let fixture: ComponentFixture<ConfirmarEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
