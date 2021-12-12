import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LandingpageComponent} from './sites/landingpage/landingpage.component';
import {HttpClientModule} from '@angular/common/http';
import { MoreInfoComponent } from './sites/more-info/more-info.component';
import { FeedbackComponent } from './sites/feedback/feedback.component';
import { SessionRestoreComponent } from './sites/session-restore/session-restore.component';
import { DemoComponent } from './sites/demo/demo.component';


@NgModule({
    declarations: [
        AppComponent,
        LandingpageComponent,
        MoreInfoComponent,
        FeedbackComponent,
        SessionRestoreComponent,
        DemoComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})

export class AppModule {
}
