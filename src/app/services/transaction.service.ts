import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";
import {ApiService} from "./api-service";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class TransactionService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/transaction', http);
    }


    public getTransaction(id: number): Observable<Transaction|null>
    {
        return this.http.get<Transaction>(this.apiUrl + '/' + id)
            .pipe(
                map(res => TransactionCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    create(transaction: Transaction): Observable<Transaction> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    update(transaction: Transaction): Observable<Transaction> {
        const url = `${this.apiUrl}/${transaction.id}`;
        return this.http
            .put(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }

}
