import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule, MatTabsModule, MatCardModule, MatSliderModule, MatTableModule, MatSelectModule } from '@angular/material';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { GlobalModule } from '../../global/global.module';

import { SummaryComponent } from './summary/summary.component';
import { FullComponent } from './full/full.component';
import { ResultHeaderComponent } from './result-header/result-header.component';
import { SummaryHeaderComponent } from './summary/summary-header/summary-header.component';
import { SummaryReportComponent } from './summary/summary-report/summary-report.component';
import { AssessmentsSummaryComponent } from '../../assessments/assessments-summary/assessments-summary.component';
import { SummaryEffects } from './store/summary.effects';
import { summaryReducer } from './store/summary.reducers';
import { FullResultEffects } from './store/full-result.effects';
import { fullAssessmentResultReducer } from './store/full-result.reducers';
import { AssessGroupComponent } from './full/group/assessments-group.component';
import { AddAssessedObjectComponent } from './full/group/add-assessed-object/add-assessed-object.component';

const materialModules = [
  MatCardModule,
  MatProgressSpinnerModule,
  MatSliderModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
];

const moduleComponents = [
  AssessGroupComponent,
  AddAssessedObjectComponent,
  SummaryComponent,
  FullComponent,
  ResultHeaderComponent,
  SummaryHeaderComponent,
  SummaryReportComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...materialModules,
    GlobalModule,
    StoreModule.forFeature('summary', summaryReducer),
    StoreModule.forFeature('fullAssessment', fullAssessmentResultReducer),
    EffectsModule.forFeature([SummaryEffects, FullResultEffects]),
  ],
  declarations: [
    ...moduleComponents,
  ],
})
export class ResultModule { }