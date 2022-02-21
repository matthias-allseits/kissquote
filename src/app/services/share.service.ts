import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Share} from '../models/share';
import {ShareCreator} from "../creators/share-creator";
import {ApiService} from "./api-service";
import {ShareheadShareCreator} from "../creators/sharehead-share-creator";
import {ShareheadShare} from "../models/sharehead-share";


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


    public getAllShareheadShares(): Observable<ShareheadShare[]>
    {
        return this.http.get<ShareheadShare[]>(this.apiUrl + '/sharehead')
            .pipe(
                map(res => ShareheadShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
