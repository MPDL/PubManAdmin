import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {IndexDetailComponent} from './index-detail.component';

describe('IndexDetailComponent', () => {
  let component: IndexDetailComponent;
  let fixture: ComponentFixture<IndexDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IndexDetailComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
