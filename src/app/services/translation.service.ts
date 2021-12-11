import {Injectable} from '@angular/core';
import {Translation} from '../models/translation';
import {Observable, of} from 'rxjs';


@Injectable({
    providedIn: 'root'
})

export class TranslationService {

    private language = 'de';

    constructor() {
    }

    public getTranslations(): Observable<Translation[]> {
        const translations = [];
        translations.push(new Translation(
            1,
            'GURKE',
            'Gurke',
            'Cucumber',
        ));
        translations.push(new Translation(
            1,
            'PRAKTIKANT',
            'Praktikant',
            'Trainee',
        ));
        translations.push(new Translation(
            1,
            'ROOKIE',
            'Anfänger',
            'Rookie',
        ));
        translations.push(new Translation(
            1,
            'HATER',
            'Hasser',
            'Hater',
        ));
        translations.push(new Translation(
            1,
            'PROFESSIONAL',
            'Profi',
            'Professional',
        ));

        return of(translations);
    }


    // public getTranslationByKey(key: string): string
    // {
    //     const allTranslations = this.getTranslations();
    //     allTranslations.forEach((translation) => {
    //         if (translation.key === key) {
    //             return translation.de;
    //         }
    //     });
    // }

}
