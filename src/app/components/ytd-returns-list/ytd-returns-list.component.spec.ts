import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YtdReturnsListComponent } from './ytd-returns-list.component';

describe('YtdReturnsListComponent', () => {
  let component: YtdReturnsListComponent;
  let fixture: ComponentFixture<YtdReturnsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YtdReturnsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YtdReturnsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
