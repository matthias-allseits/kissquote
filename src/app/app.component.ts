import {Component, OnInit} from '@angular/core';
import {TranslationService} from './services/translation.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

    title = 'Kissquote';
    language = 'de';
    myKey: string = null;

    constructor(
        public tranService: TranslationService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
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

    public handleHomeClick(): void {
        if (this.myKey === null) {
            document.location.href = '/';
        } else {
            this.router.navigate([`my-dashboard`]);
        }
    }

}
