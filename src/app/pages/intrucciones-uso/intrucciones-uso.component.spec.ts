import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntruccionesUsoComponent } from './intrucciones-uso.component';

describe('IntruccionesUsoComponent', () => {
  let component: IntruccionesUsoComponent;
  let fixture: ComponentFixture<IntruccionesUsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntruccionesUsoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntruccionesUsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
