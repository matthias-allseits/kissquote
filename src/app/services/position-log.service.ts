import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {PositionLog} from "../models/position-log";
import {DateHelper} from "../core/datehelper";
import {PositionLogCreator} from "../creators/position-log-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PositionLogService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/position-log', http);
    }


    create(logEntry: PositionLog): Observable<PositionLog|undefined> {
        logEntry.date = DateHelper.convertDateToMysql(logEntry.date);
        const url = `${this.apiUrl}`;
        return this.http.post<PositionLog>(url, JSON.stringify(logEntry), httpOptions)
            .pipe(
                map(res => PositionLogCreator.oneFromApiArray(res)),
            //     map(() => logEntry),
            //     catchError(this.handleError)
            );
    }


    update(logEntry: PositionLog): Observable<PositionLog|undefined> {
        logEntry.date = DateHelper.convertDateToMysql(logEntry.date);
        const url = `${this.apiUrl}/${logEntry.id}`;
        return this.http.put<PositionLog>(url, JSON.stringify(logEntry), httpOptions)
            .pipe(
                map(res => PositionLogCreator.oneFromApiArray(res)),
                // catchError(this.handleError)
            );
    }


    replaceEntry(allEntries: PositionLog[]|undefined, entry2Replace: PositionLog|undefined): PositionLog[]|undefined {
        if (allEntries && entry2Replace) {
            allEntries.forEach((entry, index) => {
                if (entry.id === entry2Replace.id) {
                    allEntries.splice(index, 1);
                }
            });
            allEntries.push(entry2Replace);
        }

        return allEntries;
    }


    removeEntry(allEntries: PositionLog[]|undefined, entry2Remove: PositionLog|undefined): PositionLog[]|undefined {
        if (allEntries && entry2Remove) {
            allEntries.forEach((entry, index) => {
                if (entry.id === entry2Remove.id) {
                    allEntries.splice(index, 1);
                }
            });
        }

        return allEntries;
    }


    public delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // map(res => PositionLogCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }

}
