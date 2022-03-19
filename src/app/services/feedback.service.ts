import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from '../models/currency';
import {ApiService} from "./api-service";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class FeedbackService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/feedback', http);
    }


    post(feedback: any): Observable<Currency|null> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(feedback), httpOptions)
            .pipe(
                map(() => feedback),
                // catchError(this.handleError)
            );
    }

}
