import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Position} from '../models/position';


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
                map(res => Position.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
