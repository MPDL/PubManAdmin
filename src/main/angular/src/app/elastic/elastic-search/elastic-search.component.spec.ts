import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ElasticSearchComponent} from './elastic-search.component';

describe('SearchComponent', () => {
  let component: ElasticSearchComponent;
  let fixture: ComponentFixture<ElasticSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ElasticSearchComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElasticSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
