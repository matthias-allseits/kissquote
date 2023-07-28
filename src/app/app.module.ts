import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {LandingpageComponent} from "./sites/landingpage/landingpage.component";
import {MoreInfoComponent} from "./sites/more-info/more-info.component";
import {FeedbackComponent} from "./sites/feedback/feedback.component";
import {SessionRestoreComponent} from "./sites/session-restore/session-restore.component";
import {DemoComponent} from "./sites/demo/demo.component";
import {ImportComponent} from "./sites/import/import.component";
import {ImportExplanationComponent} from "./sites/import-explanation/import-explanation.component";
import {ImportAlternativeComponent} from "./sites/import-alternative/import-alternative.component";
import {MyDashboardComponent} from "./sites/my-dashboard/my-dashboard.component";
import {PositionFormComponent} from "./sites/position-form/position-form.component";
import {PositionDetailComponent} from "./sites/position-detail/position-detail.component";
import {BankAccountFormComponent} from "./sites/bank-account-form/bank-account-form.component";
import {FaqComponent} from "./sites/faq/faq.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

import { registerLocaleData } from '@angular/common';
import localeCH from '@angular/common/locales/de-CH';
import { PositionListComponent } from './components/position-list/position-list.component';
import { TransactionFormComponent } from './sites/transaction-form/transaction-form.component';
import {JsonWebTokenInterceptor} from "./interceptor/json-web-token.interceptor";
import {ErrorInterceptor} from "./interceptor/error-interceptor";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgChartsModule} from "ng2-charts";
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { CashPositionFormComponent } from './sites/cash-position-form/cash-position-form.component';
import { CashTransactionFormComponent } from './sites/cash-transaction-form/cash-transaction-form.component';
import {StackedBarChartComponent} from "./components/stacked-bar-chart/stacked-bar-chart.component";
import {BarChartComponent} from "./components/bar-chart/bar-chart.component";
import { ShareheadShareInfoComponent } from './components/sharehead-share-info/sharehead-share-info.component';
import { ShareheadShareSearchComponent } from './components/sharehead-share-search/sharehead-share-search.component';
import { ShareheadShareDetailComponent } from './sites/sharehead-share-detail/sharehead-share-detail.component';
import {LineChartMultiAxisComponent} from "./components/line-chart-multi-axis/line-chart-multi-axis.component";
import { ShareChartComponent } from './components/share-chart/share-chart.component';
import { ShareBarChartComponent } from './components/share-bar-chart/share-bar-chart.component';
import {ColorPickerModule} from "ngx-color-picker";
import {PieChartComponent} from "./components/pie-chart/pie-chart.component";
import {ShareheadShareContainerComponent} from "./components/sharehead-share-container/sharehead-share-container.component";
import { DashboardBalanceComponent } from './components/dashboard-balance/dashboard-balance.component';
import { DashboardListingsComponent } from './components/dashboard-listings/dashboard-listings.component';
import { DashboardSettingsComponent } from './components/dashboard-settings/dashboard-settings.component';
import { DashboardBalanceChartsComponent } from './components/dashboard-balance-charts/dashboard-balance-charts.component';
registerLocaleData(localeCH);



@NgModule({
    declarations: [
        AppComponent,
        LandingpageComponent,
        MoreInfoComponent,
        FeedbackComponent,
        SessionRestoreComponent,
        DemoComponent,
        ImportComponent,
        ImportExplanationComponent,
        FaqComponent,
        ImportAlternativeComponent,
        MyDashboardComponent,
        PositionFormComponent,
        PositionDetailComponent,
        BankAccountFormComponent,
        PositionListComponent,
        TransactionFormComponent,
        BarChartComponent,
        StackedBarChartComponent,
        LineChartComponent,
        PieChartComponent,
        LineChartMultiAxisComponent,
        CashPositionFormComponent,
        CashTransactionFormComponent,
        ShareheadShareInfoComponent,
        ShareheadShareContainerComponent,
        ShareheadShareSearchComponent,
        ShareheadShareDetailComponent,
        ShareChartComponent,
        ShareBarChartComponent,
        DashboardBalanceComponent,
        DashboardListingsComponent,
        DashboardSettingsComponent,
        DashboardBalanceChartsComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        NgbModule,
        FontAwesomeModule,
        BrowserAnimationsModule,
        NgChartsModule,
        ColorPickerModule,
        // TooltipModule.forRoot(),
        // TypeaheadModule.forRoot(),
        // ModalModule.forRoot(),
        // TabsModule.forRoot(),
    ],
    providers: [
        {
            provide: LOCALE_ID, useValue: "de-CH"
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JsonWebTokenInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
