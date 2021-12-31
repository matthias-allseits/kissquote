import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";


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

}
