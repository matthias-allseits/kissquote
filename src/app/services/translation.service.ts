import {Injectable} from '@angular/core';
import {Translation} from '../models/translation';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ApiService} from "./api-service";


@Injectable({
    providedIn: 'root'
})

export class TranslationService extends ApiService {

    private translations: Translation[] = [];
    private language: string = 'de';

    constructor(
        public override http: HttpClient,
    ) {
        super('/translations', http);
        const lang = localStorage.getItem('lang');
        if (null !== lang) {
            this.language = lang;
        }
        this.getTranslations()
            .subscribe(translations => {
                this.translations = translations;
            });
    }

    public getTranslations(): Observable<Translation[]>
    {
        return this.http.get<Translation[]>(this.apiUrl + '/' + this.language);
    }

    public trans(key: string): string
    {
        let hit = 'missing: ' + key;
        if (this.translations) {
            this.translations.forEach((translation) => {
                if (translation.key === key) {
                    const trnslatn = this.translationByLang(translation, this.language);
                    if (null !== trnslatn) {
                        hit = trnslatn;
                    }
                }
            });
        }

        return hit;
    }

    private translationByLang(translation: Translation, lang: string): string|null {
        switch(lang) {
            case 'de':
                return translation.de;
            case 'en':
                return translation.en;
        }

        return null;
    }

}
