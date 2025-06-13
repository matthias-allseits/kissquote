import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from '../models/currency';
import {CurrencyCreator} from "../creators/currency-creator";
import {ApiService} from "./api-service";


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


    // todo: probably useless?
    create(currency: Currency): Observable<Currency|undefined> {
        const url = `${this.apiUrl}`;
        return this.http
            .post<Currency>(url, JSON.stringify(currency), httpOptions)
            .pipe(
                map(res => {
                    const castedCurrency = CurrencyCreator.oneFromApiArray(res);

                    return castedCurrency;
                }),
            );
    }


    update(currency: Currency): Observable<Currency|undefined> {
        const url = `${this.apiUrl}/${currency.id}`;
        return this.http
            .put<Currency>(url, JSON.stringify(currency), httpOptions)
            .pipe(
                map(res => {
                    const castedCurrency = CurrencyCreator.oneFromApiArray(res);

                    return castedCurrency;
                }),
            );
    }


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.apiUrl)
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }


    public getCachedCurrencyByName(name: string): Currency|undefined
    {
        let hit = undefined;
        if (name === 'GBX') { // island apes...
            name = 'GBP';
        }
        const cachedCurrencies = localStorage.getItem('currencies');
        if (cachedCurrencies) {
            const currencies: Currency[] = JSON.parse(cachedCurrencies);
            currencies.forEach(currency => {
                if (currency.name == name) {
                    hit = currency;
                }
            });
        }

        return hit;
    }


    public getUsersCurrencyByName(name: string): Observable<Currency>
    {
        return new Observable(currency => {
            let hit = undefined;
            this.getAllCurrencies().subscribe(currencies => {
                currencies.forEach(crncy => {
                    if (crncy.name === name) {
                        currency.next(crncy);
                    }
                })
            });
        });
    }

}
