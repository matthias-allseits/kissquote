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
import {UploadComponent} from "./sites/upload/upload.component";
import {UploadExplanationComponent} from "./sites/upload-explanation/upload-explanation.component";
import {UploadAlternativeComponent} from "./sites/upload-alternative/upload-alternative.component";
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
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {TypeaheadModule} from "ngx-bootstrap/typeahead";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ModalModule} from "ngx-bootstrap/modal";
import {TabsModule} from "ngx-bootstrap/tabs";
import {NgChartsModule} from "ng2-charts";
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
registerLocaleData(localeCH);



@NgModule({
    declarations: [
        AppComponent,
        LandingpageComponent,
        MoreInfoComponent,
        FeedbackComponent,
        SessionRestoreComponent,
        DemoComponent,
        UploadComponent,
        UploadExplanationComponent,
        FaqComponent,
        UploadAlternativeComponent,
        MyDashboardComponent,
        PositionFormComponent,
        PositionDetailComponent,
        BankAccountFormComponent,
        PositionListComponent,
        TransactionFormComponent,
        BarChartComponent,
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
        TooltipModule.forRoot(),
        TypeaheadModule.forRoot(),
        ModalModule.forRoot(),
        TabsModule.forRoot(),
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
