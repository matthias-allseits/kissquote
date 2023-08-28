import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {Sector} from "../models/sector";
import {SectorCreator} from "../creators/sector-creator";
import {Strategy} from "../models/strategy";
import {StrategyCreator} from "../creators/strategy-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class StrategyService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/strategy', http);
    }


    create(strategy: Strategy): Observable<Strategy|null> {
        const url = `${this.apiUrl}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(strategy), httpOptions)
            .pipe(
                map(() => strategy),
                // catchError(this.handleError)
            );
    }


    update(strategy: Strategy): Observable<Strategy|null> {
        const url = `${this.apiUrl}/${strategy.id}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .put(url, JSON.stringify(strategy), httpOptions)
            .pipe(
                map(() => strategy),
                // catchError(this.handleError)
            );
    }


    public getAllStrategies(): Observable<Strategy[]>
    {
        return this.http.get<Strategy[]>(this.apiUrl)
            .pipe(
                map(res => StrategyCreator.fromApiArray(res))
            );
    }


    public delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // map(res => LabelCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }

}
