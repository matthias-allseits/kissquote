import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingpageComponent} from "./sites/landingpage/landingpage.component";
import {MyDashboardComponent} from "./sites/my-dashboard/my-dashboard.component";
import {MoreInfoComponent} from "./sites/more-info/more-info.component";
import {SessionRestoreComponent} from "./sites/session-restore/session-restore.component";
import {UploadComponent} from "./sites/upload/upload.component";
import {DemoComponent} from "./sites/demo/demo.component";
import {UploadExplanationComponent} from "./sites/upload-explanation/upload-explanation.component";
import {UploadAlternativeComponent} from "./sites/upload-alternative/upload-alternative.component";
import {FaqComponent} from "./sites/faq/faq.component";
import {PositionDetailComponent} from "./sites/position-detail/position-detail.component";
import {PositionFormComponent} from "./sites/position-form/position-form.component";
import {BankAccountFormComponent} from "./sites/bank-account-form/bank-account-form.component";
import {FeedbackComponent} from "./sites/feedback/feedback.component";
import {TransactionFormComponent} from "./sites/transaction-form/transaction-form.component";
import {CashPositionFormComponent} from "./sites/cash-position-form/cash-position-form.component";


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
    { path: 'bank-account/:aid/position-form/:id', component: PositionFormComponent },
    { path: 'bank-account/:aid/position-form', component: PositionFormComponent },
    { path: 'bank-account/:aid/cash-position-form', component: CashPositionFormComponent },
    { path: 'position/:pid/transaction-form/:id', component: TransactionFormComponent },
    { path: 'position/:pid/transaction-form', component: TransactionFormComponent },
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
