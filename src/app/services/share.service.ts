import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Share} from '../models/share';
import {ShareCreator} from "../creators/share-creator";
import {ApiService} from "./api-service";


@Injectable({
    providedIn: 'root'
})

export class ShareService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/share', http);
    }


    public getAllUsersShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.apiUrl)
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getAllSwissquoteShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.apiUrl + '/swissquote')
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
