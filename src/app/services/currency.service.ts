import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Position} from '../models/position';
import {Share} from '../models/share';
import {Currency} from '../models/currency';


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

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
                map(res => Currency.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
