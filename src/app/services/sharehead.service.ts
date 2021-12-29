import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Share} from '../models/share';
import {ShareCreator} from "../creators/share-creator";


@Injectable({
    providedIn: 'root'
})

export class ShareheadService {

    private baseUrl = 'http://sharehead.local/api/share';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllShares(): Observable<Share[]>
    {
        return this.http.get<Share[]>(this.baseUrl)
            .pipe(
                map(res => ShareCreator.fromApiArray(res))
            );
    }

}
