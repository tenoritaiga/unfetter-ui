import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { GlobalModule } from '../global/global.module';
import { threatReducer } from './store/threat.reducers';
import { ThreatDashboardBetaComponent } from './threat-dashboard-beta.component';

xdescribe('ThreatDashboardBetaComponent', () => {
  let component: ThreatDashboardBetaComponent;
  let fixture: ComponentFixture<ThreatDashboardBetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreatDashboardBetaComponent],
      imports: [GlobalModule,
        RouterTestingModule,
        NoopAnimationsModule,
        StoreModule.forRoot(threatReducer),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreatDashboardBetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
