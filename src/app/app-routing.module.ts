import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LandingpageComponent} from './sites/landingpage/landingpage.component';
import {MoreInfoComponent} from './sites/more-info/more-info.component';
import {FeedbackComponent} from './sites/feedback/feedback.component';
import {SessionRestoreComponent} from './sites/session-restore/session-restore.component';
import {DemoComponent} from './sites/demo/demo.component';
import {UploadComponent} from './sites/upload/upload.component';
import {UploadExplanationComponent} from './sites/upload-explanation/upload-explanation.component';
import {FaqComponent} from './sites/faq/faq.component';
import {UploadAlternativeComponent} from './sites/upload-alternative/upload-alternative.component';
import {MyDashboardComponent} from './sites/my-dashboard/my-dashboard.component';
import {PositionFormComponent} from './sites/position-form/position-form.component';
import {PositionDetailComponent} from './sites/position-detail/position-detail.component';
import {BankAccountFormComponent} from './sites/bank-account-form/bank-account-form.component';


const routes: Routes = [
    { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
    { path: 'landingpage', component: LandingpageComponent },
    { path: 'my-dashboard', component: MyDashboardComponent },
    { path: 'more-info', component: MoreInfoComponent },
    { path: 'restore', component: SessionRestoreComponent },
    { path: 'upload', component: UploadComponent },
    { path: 'demo', component: DemoComponent },
    { path: 'upload-explanation', component: UploadExplanationComponent },
    { path: 'upload-alternative', component: UploadAlternativeComponent },
    { path: 'faq', component: FaqComponent },
    { path: 'position-detail/:id', component: PositionDetailComponent },
    { path: 'position-form/:id', component: PositionFormComponent },
    { path: 'position-form', component: PositionFormComponent },
    { path: 'bank-account-form/:id', component: BankAccountFormComponent },
    { path: 'bank-account-form', component: BankAccountFormComponent },
    { path: 'feedback', component: FeedbackComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
