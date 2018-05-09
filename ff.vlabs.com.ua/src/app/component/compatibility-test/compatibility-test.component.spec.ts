import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompatibilityTestComponent } from './compatibility-test.component';

describe('CompatibilityTestComponent', () => {
  let component: CompatibilityTestComponent;
  let fixture: ComponentFixture<CompatibilityTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompatibilityTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompatibilityTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
