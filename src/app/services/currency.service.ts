import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from '../models/currency';
import {CurrencyCreator} from "../creators/currency-creator";


@Injectable({
    providedIn: 'root'
})

export class CurrencyService {

    private baseUrl = 'http://api.kissquote.local/api/currency';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.baseUrl)
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }

}
