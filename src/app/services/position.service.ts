import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Position} from '../models/position';
import {PositionCreator} from "../creators/position-creator";
import {DateHelper} from "../core/datehelper";
import {ApiService} from "./api-service";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PositionService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/position', http);
    }


    public getPosition(id: number): Observable<Position|null>
    {
        return this.http.get<Position>(this.apiUrl + '/' + id)
            .pipe(
                map(res => PositionCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getPositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.apiUrl)
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    create(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        position.transactions.forEach(transaction => {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
        });
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
            );
    }


    createCashPosition(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        position.transactions.forEach(transaction => {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
        });
        const url = `${this.apiUrl}/cash`;
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
            );
    }


    update(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        const url = `${this.apiUrl}/${position.id}`;
        return this.http
            .put(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
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
