import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
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


    create(strategy: Strategy): Observable<Strategy|undefined> {
        const url = `${this.apiUrl}`;
        return this.http
            .post<Strategy>(url, JSON.stringify(strategy), httpOptions)
            .pipe(
                map(res => {
                    const castedStrategy = StrategyCreator.oneFromApiArray(res);

                    return castedStrategy;
                }),
            );
    }


    update(strategy: Strategy): Observable<Strategy|undefined> {
        const url = `${this.apiUrl}/${strategy.id}`;
        return this.http
            .put<Strategy>(url, JSON.stringify(strategy), httpOptions)
            .pipe(
                map(res => {
                    const castedStrategy = StrategyCreator.oneFromApiArray(res);

                    return castedStrategy;
                }),
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
