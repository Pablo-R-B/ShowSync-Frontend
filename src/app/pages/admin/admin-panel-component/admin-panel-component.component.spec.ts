import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelComponentComponent } from './admin-panel-component.component';

describe('AdminPanelComponentComponent', () => {
  let component: AdminPanelComponentComponent;
  let fixture: ComponentFixture<AdminPanelComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanelComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
