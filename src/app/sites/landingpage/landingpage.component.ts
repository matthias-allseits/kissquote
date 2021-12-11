import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {Translation} from '../../models/translation';


@Component({
    selector: 'app-landingpage',
    templateUrl: './landingpage.component.html',
    styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {

    language = 'de';
    translations: Translation[];

    constructor(
        public translationService: TranslationService
    ) {
    }

    ngOnInit(): void {
        this.translationService.getTranslations()
            .subscribe(translations => {
                this.translations = translations;
            });
    }

    public getTranslationByKey(key: string): string
    {
        let hit = 'missing: ' + key;
        if (this.translations) {
            this.translations.forEach((translation) => {
                if (translation.key === key) {

                    hit = translation[this.language];
                }
            });
        }

        return hit;
    }

    public changeLanguage(lang: string): void
    {
        this.language = lang;
    }

}
