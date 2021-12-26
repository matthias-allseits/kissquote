import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LandingpageComponent} from './sites/landingpage/landingpage.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { MoreInfoComponent } from './sites/more-info/more-info.component';
import { FeedbackComponent } from './sites/feedback/feedback.component';
import { SessionRestoreComponent } from './sites/session-restore/session-restore.component';
import { DemoComponent } from './sites/demo/demo.component';
import { UploadComponent } from './sites/upload/upload.component';
import { UploadExplanationComponent } from './sites/upload-explanation/upload-explanation.component';
import { FaqComponent } from './sites/faq/faq.component';
import { UploadAlternativeComponent } from './sites/upload-alternative/upload-alternative.component';
import { MyDashboardComponent } from './sites/my-dashboard/my-dashboard.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PositionFormComponent } from './sites/position-form/position-form.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PositionDetailComponent } from './sites/position-detail/position-detail.component';
import { BankAccountFormComponent } from './sites/bank-account-form/bank-account-form.component';
import {JsonWebTokenInterceptor} from './interceptor/json-web-token.interceptor';


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
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JsonWebTokenInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
