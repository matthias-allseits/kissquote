import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Share} from '../models/share';
import {ShareCreator} from "../creators/share-creator";


@Injectable({
    providedIn: 'root'
})

export class ShareService {

    private baseUrl = 'http://api.kissquote.local/api/share';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllUsersShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl)
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getAllSwissquoteShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl + '/swissquote')
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
