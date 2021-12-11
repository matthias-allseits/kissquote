import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LandingpageComponent} from './sites/landingpage/landingpage.component';
import {MoreInfoComponent} from './sites/more-info/more-info.component';
import {FeedbackComponent} from './sites/feedback/feedback.component';
import {SessionRestoreComponent} from './sites/session-restore/session-restore.component';


const routes: Routes = [
    { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
    { path: 'landingpage', component: LandingpageComponent },
    { path: 'more-info', component: MoreInfoComponent },
    { path: 'restore', component: SessionRestoreComponent },
    { path: 'feedback', component: FeedbackComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
