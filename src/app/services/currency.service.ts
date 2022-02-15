import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from '../models/currency';
import {CurrencyCreator} from "../creators/currency-creator";
import {ShareheadShare} from "../models/sharehead-share";
import {ApiService} from "./api-service";


@Injectable({
    providedIn: 'root'
})

export class CurrencyService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/currency', http);
    }


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.apiUrl)
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }

    public getCurrencyByName(currencies: Currency[], name: string): Currency|null
    {
        let hit = null;
        currencies.forEach(currency => {
            if (currency.name == name) {
                hit = currency;
            }
        });

        return hit;
    }

}
