import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
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
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        NgbModule,
        FontAwesomeModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
