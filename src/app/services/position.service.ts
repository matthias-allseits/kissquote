import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Position} from '../models/position';
import {PositionCreator} from "../creators/position-creator";
import {DateHelper} from "../core/datehelper";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PositionService {

    private baseUrl = 'http://api.kissquote.local/api/position';

    constructor(
        private http: HttpClient,
    ) {}


    public getPosition(id: number): Observable<Position|null>
    {
        return this.http.get<Position>(this.baseUrl + '/' + id)
            .pipe(
                map(res => PositionCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getPositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.baseUrl)
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    create(position: Position): Observable<Position|null> {
        const url = `${this.baseUrl}`;
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
            );
    }


    update(position: Position): Observable<Position> {
        const url = `${this.baseUrl}/${position.id}`;
        return this.http
            .put(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
            );
    }

}
