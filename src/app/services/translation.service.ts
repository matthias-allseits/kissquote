import {Injectable} from '@angular/core';
import {Translation} from '../models/translation';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})

export class TranslationService {

    private baseUrl = 'http://localhost:8000/api/translations';

    constructor(
        private http: HttpClient,
    ) {
    }

    public getTranslations(): Observable<Translation[]>
    {
        return this.http.get<Translation[]>(this.baseUrl);
    }

}
