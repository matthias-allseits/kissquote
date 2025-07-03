import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";
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

export class TransactionService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/', http);
    }


    public getTransaction(positionId: number, transactionId: number): Observable<Transaction|undefined>
    {
        const url = `${this.apiUrl}position/${positionId}/transaction/${transactionId}`;
        return this.http.get<Transaction>(url)
            .pipe(
                map(res => TransactionCreator.oneFromApiArray(res))
            );
    }


    create(transaction: Transaction): Observable<Transaction|undefined> {
        if (transaction.position) {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
            transaction.fee = transaction.fee ? transaction.fee : null;
            const positionId = transaction.position.id;
            transaction.position = undefined;
            const url = `${this.apiUrl}position/${positionId}/transaction`;
            return this.http
                .post<Transaction>(url, JSON.stringify(transaction), httpOptions)
                .pipe(
                    map(res => {
                        const castedTransi = TransactionCreator.oneFromApiArray(res);

                        return castedTransi;
                    }),
                );
        }

        return new Observable(undefined);
    }


    update(transaction: Transaction): Observable<Transaction|undefined> {
        if (transaction.position) {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
            transaction.fee = transaction.fee ? transaction.fee : null;
            const positionId = transaction.position.id;
            transaction.position = undefined;
            const url = `${this.apiUrl}position/${positionId}/transaction/${transaction.id}`;
            return this.http
                .put<Transaction>(url, JSON.stringify(transaction), httpOptions)
                .pipe(
                    map(res => {
                        const castedTransi = TransactionCreator.oneFromApiArray(res);
                        return castedTransi;
                    }),
                );
            }

        return new Observable(undefined);
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


    delete(positionId: number, transactionId: number): Observable<Object> {
        const url = `${this.apiUrl}position/${positionId}/transaction/${transactionId}`;
        return this.http.delete(url, httpOptions)
            .pipe(
            );
    }

}
