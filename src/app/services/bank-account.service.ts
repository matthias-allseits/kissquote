import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BankAccount} from '../models/bank-account';
import {ApiService} from "./api-service";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class BankAccountService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/bank-account', http);
    }


    create(bankAccount: BankAccount): Observable<BankAccount> {
        const url = `${this.apiUrl}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(bankAccount), httpOptions)
            .pipe(
                map(() => bankAccount),
                // catchError(this.handleError)
            );
    }


    update(bankAccount: BankAccount): Observable<BankAccount> {
        const url = `${this.apiUrl}/${bankAccount.id}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .put(url, JSON.stringify(bankAccount), httpOptions)
            .pipe(
                map(() => bankAccount),
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
