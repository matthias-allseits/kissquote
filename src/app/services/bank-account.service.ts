import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BankAccount} from '../models/bank-account';


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class BankAccountService {

    private baseUrl = 'http://api.kissquote.local/api/bank-account';

    constructor(
        private http: HttpClient,
    ) {}


    create(bankAccount: BankAccount): Observable<BankAccount> {
        const url = `${this.baseUrl}`;
        return this.http
            .post(url, JSON.stringify(bankAccount), httpOptions)
            .pipe(
                map(() => bankAccount),
                // catchError(this.handleError)
            );
    }


    update(bankAccount: BankAccount): Observable<BankAccount> {
        const url = `${this.baseUrl}/${bankAccount.id}`;
        return this.http
            .put(url, JSON.stringify(bankAccount), httpOptions)
            .pipe(
                map(() => bankAccount),
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
