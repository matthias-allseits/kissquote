import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Currency} from "../models/currency";
import {CurrencyCreator} from "../creators/currency-creator";
import {ShareheadShare} from "../models/sharehead-share";
import {ShareheadShareCreator} from "../creators/sharehead-share-creator";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {StockRate} from "../models/stock-rate";
import {AnalystRating} from "../models/analyst-rating";
import {AnalystRatingCreator} from "../creators/analyst-rating-creator";
import {WatchlistCreator} from "../creators/watchlist-creator";
import {Position} from "../models/position";


@Injectable({
    providedIn: 'root'
})

export class ShareheadService {

    private baseUrl = 'http://sharehead.dyn-o-saur.com/api';

    constructor(
        private http: HttpClient,
    ) {
        if (+window.location.port === 4300) {
            this.baseUrl = 'http://sharehead.local/api';
        } else if (+window.location.port === 4500) {
            this.baseUrl = 'http://localhost:8009/api';
        }
    }


    public getShare(id: number): Observable<ShareheadShare|undefined>
    {
        return this.http.get<ShareheadShare>(this.baseUrl + '/share/' + id)
            .pipe(
                map(res => ShareheadShareCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getShareRate(id: number): Observable<StockRate|undefined>
    {
        return this.http.get<StockRate>(this.baseUrl + '/share/' + id + '/rate')
            .pipe(
                map(res => StockRateCreator.oneFromApiArray(res))
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


    public getLastMinuteList(): Observable<ShareheadShare[]>
    {
        return this.http.get<ShareheadShare[]>(this.baseUrl + '/listing/last-minute')
            .pipe(
                map(res => ShareheadShareCreator.fromApiArray(res))
            );
    }

    public getNewestRatingsList(positions: Position[]): Observable<AnalystRating[]>
    {
        const shareheadIds: number[] = [];
        positions.forEach(position => {
            if (position.shareheadId) {
                shareheadIds.push(position.shareheadId);
            }
        });
        return this.http.post(this.baseUrl + '/listing/newest-ratings', JSON.stringify(shareheadIds))
            .pipe(
                map(res => {
                    const ratings = AnalystRatingCreator.fromApiArray(res);
                    ratings.reverse();
                    positions.forEach(position => {
                        ratings.forEach(rating => {
                            if (position.shareheadId === rating.share?.id) {
                                rating.positionId = position.id;
                            }
                        });
                    });

                    return ratings;
                }),
            );
    }

}
