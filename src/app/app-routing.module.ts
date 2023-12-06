import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingpageComponent} from "./sites/landingpage/landingpage.component";
import {MyDashboardComponent} from "./sites/my-dashboard/my-dashboard.component";
import {MoreInfoComponent} from "./sites/more-info/more-info.component";
import {SessionRestoreComponent} from "./sites/session-restore/session-restore.component";
import {ImportComponent} from "./sites/import/import.component";
import {DemoComponent} from "./sites/demo/demo.component";
import {ImportExplanationComponent} from "./sites/import-explanation/import-explanation.component";
import {ImportAlternativeComponent} from "./sites/import-alternative/import-alternative.component";
import {FaqComponent} from "./sites/faq/faq.component";
import {PositionDetailComponent} from "./sites/position-detail/position-detail.component";
import {PositionFormComponent} from "./sites/position-form/position-form.component";
import {BankAccountFormComponent} from "./sites/bank-account-form/bank-account-form.component";
import {FeedbackComponent} from "./sites/feedback/feedback.component";
import {TransactionFormComponent} from "./sites/transaction-form/transaction-form.component";
import {CashPositionFormComponent} from "./sites/cash-position-form/cash-position-form.component";
import {CashTransactionFormComponent} from "./sites/cash-transaction-form/cash-transaction-form.component";
import {ShareheadShareDetailComponent} from "./sites/sharehead-share-detail/sharehead-share-detail.component";
import {PositionDetailResolver} from "./resolver/position-detail-resolver";
import {MyDashboardResolver} from "./resolver/my-dashboard-resolver";
import {LandingpageOpensourceComponent} from "./sites/landingpage-opensource/landingpage-opensource.component";


const routes: Routes = [
    { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
    { path: 'landingpage', component: LandingpageOpensourceComponent },
    {
        path: 'my-dashboard',
        component: MyDashboardComponent,
        resolve: {
            portfolio: MyDashboardResolver
        }
    },
    { path: 'more-info', component: MoreInfoComponent },
    { path: 'restore', component: SessionRestoreComponent },
    { path: 'import', component: ImportComponent },
    { path: 'demo', component: DemoComponent },
    { path: 'import-explanation', component: ImportExplanationComponent },
    { path: 'import-alternative', component: ImportAlternativeComponent },
    { path: 'faq', component: FaqComponent },
    {
        path: 'position-detail/:id',
        component: PositionDetailComponent,
        resolve: {
            positionData: PositionDetailResolver
        }
    },
    { path: 'sharehead-share-detail/:id', component: ShareheadShareDetailComponent },
    { path: 'bank-account/:aid/position-form/:id', component: PositionFormComponent },
    { path: 'bank-account/:aid/position-form', component: PositionFormComponent },
    { path: 'position/:pid/position-form', component: PositionFormComponent },
    { path: 'bank-account/:aid/cash-position-form', component: CashPositionFormComponent },
    { path: 'position/:pid/transaction-form/:id', component: TransactionFormComponent },
    { path: 'position/:pid/transaction-form', component: TransactionFormComponent },
    { path: 'position/:pid/cash-transaction-form/:id', component: CashTransactionFormComponent },
    { path: 'position/:pid/cash-transaction-form', component: CashTransactionFormComponent },
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
