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


    // todo: this is crap since it gets all shares from swissquote...
    public getAllShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl)
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
