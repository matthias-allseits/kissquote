import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Position} from '../models/position';
import {Share} from '../models/share';
import {Translation} from '../models/translation';


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class ShareService {

    private baseUrl = 'http://api.kissquote.local/api/share';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl)
            .pipe(
                map(res => Share.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
