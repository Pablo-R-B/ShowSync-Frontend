import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSalasComponent } from './panel-salas.component';

describe('PanelSalasComponent', () => {
  let component: PanelSalasComponent;
  let fixture: ComponentFixture<PanelSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelSalasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
