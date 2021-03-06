import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContextDetailsComponent } from './context-details.component';

describe('ContextDetailsComponent', () => {
  let component: ContextDetailsComponent;
  let fixture: ComponentFixture<ContextDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
