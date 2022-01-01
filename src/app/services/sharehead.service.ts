import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Share} from '../models/share';
import {ShareCreator} from "../creators/share-creator";
import {Currency} from "../models/currency";
import {CurrencyCreator} from "../creators/currency-creator";


@Injectable({
    providedIn: 'root'
})

export class ShareheadService {

    private baseUrl = 'http://sharehead.local/api';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl + '/share')
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
            );
    }


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.baseUrl + '/currency')
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }

}
