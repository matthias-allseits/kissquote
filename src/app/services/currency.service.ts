import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from '../models/currency';
import {CurrencyCreator} from "../creators/currency-creator";
import {ApiService} from "./api-service";
import {Position} from "../models/position";
import {DateHelper} from "../core/datehelper";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class CurrencyService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/currency', http);
    }


    create(currency: Currency): Observable<Currency|null> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(currency), httpOptions)
            .pipe(
                map(() => currency),
                // catchError(this.handleError)
            );
    }


    update(currency: Currency): Observable<Currency|null> {
        const url = `${this.apiUrl}/${currency.id}`;
        return this.http
            .put(url, JSON.stringify(currency), httpOptions)
            .pipe(
                map(() => currency),
                // catchError(this.handleError)
            );
    }


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.apiUrl)
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }

    public getCurrencyByName(currencies: Currency[], name: string): Currency|undefined
    {
        if (name === 'GBX') { // island apes...
            name = 'GBP';
        }
        let hit = undefined;
        currencies.forEach(currency => {
            if (currency.name == name) {
                hit = currency;
            }
        });

        return hit;
    }

}
