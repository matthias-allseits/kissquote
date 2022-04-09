import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {WatchlistEntry} from "../models/watchlistEntry";
import {WatchlistCreator} from "../creators/watchlist-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class WatchlistService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/watchlist', http);
    }


    public addEntry(shareheadId: number): Observable<WatchlistEntry[]>
    {
        const url = `${this.apiUrl}`;
        const body = {
            shareheadId: shareheadId
        };
        return this.http
            .post(url, JSON.stringify(body), httpOptions)
            .pipe(
                map(res => WatchlistCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }


    public removeEntry(shareheadId: number): Observable<WatchlistEntry[]> {
        const url = `${this.apiUrl}/${shareheadId}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                map(res => WatchlistCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }

}
