import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionesComponent } from './condiciones.component';

describe('CondicionesComponent', () => {
  let component: CondicionesComponent;
  let fixture: ComponentFixture<CondicionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondicionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
