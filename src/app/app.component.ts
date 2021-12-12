import {Component, OnInit} from '@angular/core';
import {Translation} from './models/translation';
import {TranslationService} from './services/translation.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

    title = 'Kissquote';
    translations: Translation[];
    language = 'de';

    constructor(
        public translationService: TranslationService
    ) {
    }

    ngOnInit(): void {
        if (null !== localStorage.getItem('lang')) {
            this.language = localStorage.getItem('lang');
        }
    }

    public changeLanguage(lang: string): void {
        this.language = lang;
        localStorage.setItem('lang', lang);
        document.location.reload();
    }

}
