import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from "../models/currency";
import {CurrencyCreator} from "../creators/currency-creator";
import {ShareheadShare} from "../models/sharehead-share";
import {ShareheadShareCreator} from "../creators/sharehead-share-creator";


@Injectable({
    providedIn: 'root'
})

export class ShareheadService {

    private baseUrl = 'http://sharehead.dyn-o-saur.com/api';
    // private baseUrl = 'http://sharehead.local/api';

    constructor(
        private http: HttpClient,
    ) {}


    public getShare(id: number): Observable<ShareheadShare|null>
    {
        return this.http.get<ShareheadShare>(this.baseUrl + '/share/' + id)
            .pipe(
                map(res => ShareheadShareCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getAllShares(): Observable<ShareheadShare[]>
    {
        return this.http.get<ShareheadShare[]>(this.baseUrl + '/share')
            .pipe(
                map(res => ShareheadShareCreator.fromApiArray(res))
            );
    }


    public getAllCurrencies(): Observable<Currency[]>
    {
        return this.http.get<Currency[]>(this.baseUrl + '/currency')
            .pipe(
                map(res => CurrencyCreator.fromApiArray(res))
            );
    }

    public getShareByIsin(allShares: ShareheadShare[], isin: string): ShareheadShare|null
    {
        let hit = null;
        allShares.forEach(share => {
            if (share.isin == isin) {
                hit = share;
            }
        });

        return hit;
    }

}
