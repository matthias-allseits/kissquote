import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {Label} from "../models/label";
import {LabelCreator} from "../creators/label-creator";
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

export class LabelService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/label', http);
    }


    create(label: Label): Observable<Label|null> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(label), httpOptions)
            .pipe(
                map(() => label),
                // catchError(this.handleError)
            );
    }


    update(label: Label): Observable<Label|null> {
        const url = `${this.apiUrl}/${label.id}`;
        return this.http
            .put(url, JSON.stringify(label), httpOptions)
            .pipe(
                map(() => label),
                // catchError(this.handleError)
            );
    }


    public getAllLabels(): Observable<Label[]>
    {
        return this.http.get<Label[]>(this.apiUrl)
            .pipe(
                map(res => LabelCreator.fromApiArray(res))
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
