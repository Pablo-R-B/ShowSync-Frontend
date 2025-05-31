import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelGenerosComponent } from './panel-generos.component';

describe('PanelGenerosComponent', () => {
  let component: PanelGenerosComponent;
  let fixture: ComponentFixture<PanelGenerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelGenerosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelGenerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
