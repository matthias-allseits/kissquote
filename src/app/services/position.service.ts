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


    public getActivePositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.apiUrl + '/active')
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getNonCashAndActivePositions(): Observable<Position[]>
    {
        return new Observable(psitons => {
            this.getActivePositions().subscribe(positions => {
                positions.forEach(position => {
                    if (!position.isCash) {
                        positions.push(position);
                    }
                });
                psitons.next(positions);
            });
        });
    }


    create(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        if (position.activeUntil) {
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
        } else {
            position.activeUntil = null;
        }
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
        position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
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


    createPositionsFromBunch(positions: Position[]): Observable<Position[]|null> {
        positions.forEach(position => {
            position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
            position.transactions.forEach(transaction => {
                transaction.date = DateHelper.convertDateToMysql(transaction.date);
            });
        })
        const url = `${this.apiUrl}/bunch`;
        console.log(JSON.stringify(positions));
        return this.http
            .post(url, JSON.stringify(positions), httpOptions)
            .pipe(
                map(() => positions),
                // catchError(this.handleError)
            );
    }


    update(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        if (position.activeUntil) {
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
        } else {
            position.activeUntil = null;
        }
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


    addLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.get(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }


    deleteLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }

}
