import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEventosComponent } from './panel-eventos.component';

describe('PanelEventosComponent', () => {
  let component: PanelEventosComponent;
  let fixture: ComponentFixture<PanelEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
