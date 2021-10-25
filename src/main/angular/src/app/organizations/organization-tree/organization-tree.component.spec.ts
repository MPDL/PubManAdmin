import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {OrganizationTreeComponent} from './organization-tree.component';

describe('OrganizationTreeComponent', () => {
  let component: OrganizationTreeComponent;
  let fixture: ComponentFixture<OrganizationTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationTreeComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
