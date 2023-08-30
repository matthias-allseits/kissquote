import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";
import {ApiService} from "./api-service";
import {DateHelper} from "../core/datehelper";
import {PositionLog} from "../models/position-log";


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
        transaction.date = DateHelper.convertDateToMysql(transaction.date);
        if (transaction.position) {
            transaction.position.activeFrom = DateHelper.convertDateToMysql(transaction.position.activeFrom);
            if (transaction.position.activeUntil) {
                transaction.position.activeUntil = DateHelper.convertDateToMysql(transaction.position.activeUntil);
            } else {
                transaction.position.activeUntil = null;
            }
            transaction.position.transactions.forEach(trans => {
                trans.date = DateHelper.convertDateToMysql(trans.date);
            });
        }
        const url = `${this.apiUrl}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    update(transaction: Transaction): Observable<Transaction> {
        transaction.date = DateHelper.convertDateToMysql(transaction.date);
        if (transaction.position) {
            transaction.position.activeFrom = DateHelper.convertDateToMysql(transaction.position.activeFrom);
            if (transaction.position.activeUntil) {
                transaction.position.activeUntil = DateHelper.convertDateToMysql(transaction.position.activeUntil);
            } else {
                transaction.position.activeUntil = null;
            }
            transaction.position.transactions.forEach(trans => {
                trans.date = DateHelper.convertDateToMysql(trans.date);
            });
        }
        const url = `${this.apiUrl}/${transaction.id}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .put(url, JSON.stringify(transaction), httpOptions)
            .pipe(
                map(() => transaction),
                // catchError(this.handleError)
            );
    }


    replaceEntry(allTransactions: Transaction[]|undefined, entry2Replace: Transaction|undefined): Transaction[]|undefined {
        if (allTransactions && entry2Replace) {
            allTransactions.forEach((entry, index) => {
                if (entry.id === entry2Replace.id) {
                    allTransactions.splice(index, 1);
                }
            });
            allTransactions.push(entry2Replace);
        }

        return allTransactions;
    }


    removeEntry(allTransactions: Transaction[]|undefined, entry2Remove: Transaction|undefined): Transaction[]|undefined {
        if (allTransactions && entry2Remove) {
            allTransactions.forEach((entry, index) => {
                if (entry.id === entry2Remove.id) {
                    allTransactions.splice(index, 1);
                }
            });
        }

        return allTransactions;
    }


    delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }

}
