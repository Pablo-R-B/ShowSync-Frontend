import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiesAcceptedComponent } from './cookies-accepted.component';

describe('CookiesAcceptedComponent', () => {
  let component: CookiesAcceptedComponent;
  let fixture: ComponentFixture<CookiesAcceptedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesAcceptedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookiesAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
