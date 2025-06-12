import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElegirChatComponent } from './elegir-chat.component';

describe('ElegirChatComponent', () => {
  let component: ElegirChatComponent;
  let fixture: ComponentFixture<ElegirChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElegirChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElegirChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
