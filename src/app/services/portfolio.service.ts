import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Portfolio} from '../models/portfolio';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BankAccount} from '../models/bank-account';
import {PortfolioCreator} from "../creators/portfolio-creator";
import {ApiService} from "./api-service";
import {DateHelper} from "../core/datehelper";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PortfolioService extends ApiService {

    public portfolio?: Portfolio;

    constructor(
        public override http: HttpClient,
    ) {
        super('/portfolio', http);
    }


    public create(portfolio: Portfolio): Observable<Portfolio|undefined>
    {
        return this.http.post<Portfolio>(this.apiUrl, portfolio, httpOptions)
            .pipe(
                map(res => PortfolioCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public portfolioByKey(key: string|null): Observable<Portfolio|undefined>
    {
        if (this.portfolio) {
            console.log('deliver portfolio from cache');
            return new Observable(portflio => {
                portflio.next(this.portfolio);
            });
        } else {
            console.log('deliver portfolio from server');
            const body = {
                hashKey: key
            };
            return this.http.post<Portfolio>(this.apiUrl + '/restore', JSON.stringify(body), httpOptions)
                .pipe(
                    map(res => {
                        const portfolio = PortfolioCreator.oneFromApiArray(res);
                        this.portfolio = portfolio;
                        return portfolio;
                    }),
                );
        }
    }


    public portfolioByKeyAndDate(key: string|null, date: Date): Observable<Portfolio|undefined>
    {
        const body = {
            hashKey: key,
            date: DateHelper.convertDateToMysql(date)
        };
        return this.http.post<Portfolio>(this.apiUrl + '/time-warp', JSON.stringify(body), httpOptions )
            .pipe(
                map(res => PortfolioCreator.oneFromApiArray(res)),
                catchError(this.handleError)
            );
    }


    public portfolioForDemo(): Observable<Portfolio|undefined>
    {
        return this.http.get<Portfolio>(this.apiUrl + '/demo')
            .pipe(
                map(res => PortfolioCreator.oneFromApiArray(res)),
                catchError(this.handleError)
            );
    }


    public getBankAccountById(bankAccountId: number): Observable<BankAccount>
    {
        return new Observable(bankAccount => {
            const myKey = localStorage.getItem('my-key');
            this.portfolioByKey(myKey)
                .subscribe(portfolio => {
                    if (portfolio) {
                        portfolio.bankAccounts.forEach(account => {
                            if (account.id === bankAccountId) {
                                bankAccount.next(account);
                            }
                        });
                    }
                });
        });
    }


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
