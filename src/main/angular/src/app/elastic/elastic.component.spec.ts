import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ElasticComponent } from './elastic.component';

describe('ElasticComponent', () => {
  let component: ElasticComponent;
  let fixture: ComponentFixture<ElasticComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ElasticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElasticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
