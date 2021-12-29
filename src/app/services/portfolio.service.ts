import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Portfolio} from '../models/portfolio';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BankAccount} from '../models/bank-account';
import {PortfolioCreator} from "../creators/portfolio-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PortfolioService {

    private baseUrl = 'http://api.kissquote.local/api/portfolio';

    constructor(
        private http: HttpClient,
    ) {}


    public create(portfolio: Portfolio): Observable<Portfolio|null>
    {
        return this.http.post<Portfolio>(this.baseUrl, portfolio, httpOptions)
            .pipe(
                map(res => PortfolioCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public portfolioByKey(key: string|null): Observable<Portfolio|null>
    {
        const body = {
            hashKey: key
        };
        return this.http.post<Portfolio>(this.baseUrl + '/restore', JSON.stringify(body), httpOptions )
            .pipe(
                map(res => PortfolioCreator.oneFromApiArray(res)),
                catchError(this.handleError)
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getBankAccountById(bankAccountId: number): Observable<BankAccount>
    {
        return new Observable(bankAccount => {
            const myKey = localStorage.getItem('my-key');
            this.portfolioByKey(myKey)
                .subscribe(portfolio => {
                    if (null !== portfolio) {
                        portfolio.bankAccounts.forEach(account => {
                            if (account.id === bankAccountId) {
                                bankAccount.next(account);
                            }
                        });
                    }
                });
        });
    }


    // protected extractData(res: Response) {
    //     return res['data'] || {};
    // }

    private handleError(error: HttpErrorResponse) {
        console.log(error);
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(
            'Something bad happened; please try again later.');
    }

}
