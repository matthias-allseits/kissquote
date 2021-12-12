import {Injectable} from '@angular/core';
import {Translation} from '../models/translation';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})

export class TranslationService {

    private baseUrl = 'http://localhost:8000/api/translations';
    translations: Translation[];

    constructor(
        private http: HttpClient,
    ) {
        this.getTranslations()
            .subscribe(translations => {
                this.translations = translations;
            });
    }

    public getTranslations(): Observable<Translation[]>
    {
        return this.http.get<Translation[]>(this.baseUrl);
    }

    public getTranslationByKey(key: string): string
    {
        const language = localStorage.getItem('lang');
        let hit = 'missing: ' + key;
        if (this.translations) {
            this.translations.forEach((translation) => {
                if (translation.key === key) {

                    hit = translation[language];
                }
            });
        }

        return hit;
    }

}
