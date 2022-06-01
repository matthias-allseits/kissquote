import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {ManualDividend} from "../models/manual-dividend";
import {ManualDividendCreator} from "../creators/manual-dividend-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class ManualDividendService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/manualDividend', http);
    }


    create(dividend: ManualDividend): Observable<ManualDividend|null> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(dividend), httpOptions)
            .pipe(
                map(() => dividend),
                // catchError(this.handleError)
            );
    }


    public delete(id: number): Observable<ManualDividend[]> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                map(res => ManualDividendCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }

}
