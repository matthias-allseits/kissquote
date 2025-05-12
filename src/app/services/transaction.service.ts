import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Transaction} from "../models/transaction";
import {TransactionCreator} from "../creators/transaction-creator";
import {ApiService} from "./api-service";
import {DateHelper} from "../core/datehelper";
import {PositionCreator} from "../creators/position-creator";
import {Position} from "../models/position";


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


    public getTransaction(id: number): Observable<Transaction|undefined>
    {
        return this.http.get<Transaction>(this.apiUrl + '/' + id)
            .pipe(
                map(res => TransactionCreator.oneFromApiArray(res))
            );
    }


    create(transaction: Transaction): Observable<Transaction|undefined> {
        transaction.date = DateHelper.convertDateToMysql(transaction.date);
        const deepCopy = structuredClone(transaction);
        if (deepCopy.position) {
            deepCopy.position.activeFrom = DateHelper.convertDateToMysql(deepCopy.position.activeFrom);
            if (deepCopy.position.activeUntil) {
                deepCopy.position.activeUntil = DateHelper.convertDateToMysql(deepCopy.position.activeUntil);
            } else {
                deepCopy.position.activeUntil = null;
            }
            deepCopy.position.transactions.forEach(trans => {
                trans.date = DateHelper.convertDateToMysql(trans.date);
            });
            if (deepCopy.position.underlying) {
                deepCopy.position.underlying = undefined;
            }
            if (deepCopy.position.markedLines) {
                deepCopy.position.markedLines = JSON.stringify(deepCopy.position.markedLines);
            }
        }
        const url = `${this.apiUrl}`;
        return this.http
            .post<Transaction>(url, JSON.stringify(deepCopy), httpOptions)
            .pipe(
                map(res => {
                    const castedTransi = TransactionCreator.oneFromApiArray(res);
                    return castedTransi;
                }),
            );
    }


    update(transaction: Transaction): Observable<Transaction|undefined> {
        transaction.date = DateHelper.convertDateToMysql(transaction.date);
        const deepCopy = structuredClone(transaction);
        if (deepCopy.position) {
            deepCopy.position.activeFrom = DateHelper.convertDateToMysql(deepCopy.position.activeFrom);
            if (deepCopy.position.activeUntil) {
                deepCopy.position.activeUntil = DateHelper.convertDateToMysql(deepCopy.position.activeUntil);
            } else {
                deepCopy.position.activeUntil = null;
            }
            if (deepCopy.position.markedLines) {
                deepCopy.position.markedLines = JSON.stringify(deepCopy.position.markedLines);
            }
            deepCopy.position.transactions.forEach(trans => {
                trans.date = DateHelper.convertDateToMysql(trans.date);
            });
        }
        const url = `${this.apiUrl}/${transaction.id}`;
        return this.http
            .put<Transaction>(url, JSON.stringify(deepCopy), httpOptions)
            .pipe(
                map(res => {
                    const castedTransi = TransactionCreator.oneFromApiArray(res);
                    return castedTransi;
                }),
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
            );
    }

}
