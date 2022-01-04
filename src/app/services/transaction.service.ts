import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class TransactionService {

    private baseUrl = 'http://api.kissquote.local/api/transaction';

    constructor(
        private http: HttpClient,
    ) {}


    public getTransaction(id: number): Observable<Transaction|null>
    {
        return this.http.get<Transaction>(this.baseUrl + '/' + id)
            .pipe(
                map(res => TransactionCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    create(transaction: Transaction): Observable<Transaction> {
        const url = `${this.baseUrl}`;
        return this.http
            .post(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    update(transaction: Transaction): Observable<Transaction> {
        const url = `${this.baseUrl}/${transaction.id}`;
        return this.http
            .put(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    delete(id: number): Observable<Object> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }

}
