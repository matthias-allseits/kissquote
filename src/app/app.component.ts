import {Component, OnInit} from '@angular/core';
import {TranslationService} from './services/translation.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {Observable, of} from "rxjs";
import {filter, map} from 'rxjs/operators';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

    title = 'Kissquote';
    language: string | null = 'de';
    myKey: string | null = null;
    public showUsersMenu = false;
    // public loading$: Observable<boolean> = of(false);
    public loading: boolean = false;

    constructor(
        public tranService: TranslationService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        // this.router.events.subscribe(console.log);
        this.router.events.pipe(
                filter(
                    (e) =>
                        e instanceof NavigationStart ||
                        e instanceof NavigationEnd ||
                        e instanceof NavigationCancel ||
                        e instanceof NavigationError
                ),
                map((e) => e instanceof NavigationStart)
            )
            .subscribe(result => {
                this.loading = result;
                // console.log('spinning: ', result);
            });

        localStorage.removeItem('ultimateFilter');
        if (null !== localStorage.getItem('lang')) {
            this.language = localStorage.getItem('lang');
        }
        if (null !== localStorage.getItem('my-key')) {
            this.myKey = localStorage.getItem('my-key');
            this.router.navigate([`my-dashboard`]);
        }
    }

    public changeLanguage(lang: string): void {
        this.language = lang;
        localStorage.setItem('lang', lang);
        document.location.reload();
    }

    public logout(): void {
        localStorage.removeItem('my-key');
        document.location.href = '/';
    }

    public gotoFeedback(): void {
        this.showUsersMenu = false;
    }

    public handleHomeClick(): void {
        if (this.myKey === null) {
            document.location.href = '/';
        } else {
            this.router.navigate([`my-dashboard`]);
        }
    }

    public toggleUsersMenu(): void {
        this.showUsersMenu = !this.showUsersMenu;
    }

}
