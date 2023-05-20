import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {PositionLog} from "../models/position-log";
import {DateHelper} from "../core/datehelper";


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


    create(logEntry: PositionLog): Observable<PositionLog|null> {
        logEntry.date = DateHelper.convertDateToMysql(logEntry.date);
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(logEntry), httpOptions)
            .pipe(
                map(() => logEntry),
                // catchError(this.handleError)
            );
    }


    update(logEntry: PositionLog): Observable<PositionLog|null> {
        logEntry.date = DateHelper.convertDateToMysql(logEntry.date);
        const url = `${this.apiUrl}/${logEntry.id}`;
        return this.http
            .put(url, JSON.stringify(logEntry), httpOptions)
            .pipe(
                map(() => logEntry),
                // catchError(this.handleError)
            );
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
