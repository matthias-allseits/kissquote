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
import {Portfolio} from "../models/portfolio";
import {DateHelper} from "../core/datehelper";
import {CacheHelper} from "../helper/cache.helper";
import {SwissquoteHelper} from "../core/swissquote-helper";
import {Md5} from "ts-md5";


interface CollectionsCache {
    [key: string]: ShareheadShare[];
}

@Injectable({
    providedIn: 'root'
})

export class ShareheadService {

    private baseUrl = 'http://sharehead.dyn-o-saur.com/api';
    private cachedCollections: CollectionsCache;

    constructor(
        private http: HttpClient,
    ) {
        this.cachedCollections = {};
        if (+window.location.port === 4300) {
            this.baseUrl = 'http://sharehead.local/api';
        } else if (+window.location.port === 4500) {
            // this.baseUrl = 'http://localhost:8009/api';
            this.baseUrl = 'http://head.local/api';
            // this.baseUrl = 'http://head.om/api';
        } else if (window.location.href.indexOf('allseits.ch') > -1) {
            this.baseUrl = 'https://api.sharehead.allseits.ch/api';
        }
    }


    public getShare(id: number): Observable<ShareheadShare|undefined>
    {
        return this.http.get<ShareheadShare>(this.baseUrl + '/share/' + id)
            .pipe(
                map(res => ShareheadShareCreator.oneFromApiArray(res))
            );
    }


    public searchShare(search: string): Observable<ShareheadShare[]|undefined>
    {
        return this.http.post<ShareheadShare>(this.baseUrl + '/share/search', JSON.stringify(search))
            .pipe(
                map(res => ShareheadShareCreator.fromApiArray(res))
            );
    }


    public getTimeWarpedShare(id: number, date: Date): Observable<ShareheadShare|undefined>
    {
        return this.http.get<ShareheadShare>(this.baseUrl + '/share/' + id + '/' + DateHelper.convertDateToMysql(date))
            .pipe(
                map(res => ShareheadShareCreator.oneFromApiArray(res))
            );
    }

    public getSharesCollection(shareheadIds: number[]): Observable<ShareheadShare[]>
    {
        const idsHash = Md5.hashStr(JSON.stringify(shareheadIds));
        if (this.cachedCollections[idsHash]) {
            console.log('deliver collection from cache');
            return new Observable(cache => {
                cache.next(this.cachedCollections[idsHash]);
            });
        } else {
            console.log('deliver collection from server');
            return this.http.post(this.baseUrl + '/share/collection', JSON.stringify(shareheadIds))
                .pipe(
                    map(res => {
                        const collection = ShareheadShareCreator.fromApiArray(res);
                        this.cachedCollections[idsHash] = collection;

                        return collection;
                    }),
                );
        }
    }

    public getCachedSharesCollection(shareheadIds: number[]): ShareheadShare[]|null
    {
        const name = Md5.hashStr(JSON.stringify(shareheadIds));
        console.log(name);
        const cachedData = CacheHelper.get(name);
        if (cachedData) {
            console.log('deliver collection from cache');
            return ShareheadShareCreator.fromApiArray(cachedData);
        } else {
            return null;
        }
    }

    public getTimeWarpedSharesCollection(portfolio: Portfolio, date: Date): Observable<ShareheadShare[]>
    {
        const shareheadIds: number[] = [];
        portfolio.getActiveNonCashPositions().forEach(position => {
            if (position.shareheadId) {
                shareheadIds.push(position.shareheadId);
            }
        });
        return this.http.post(this.baseUrl + '/share/collection/' + DateHelper.convertDateToMysql(date), JSON.stringify(shareheadIds))
            .pipe(
                map(res => {
                    const collection = ShareheadShareCreator.fromApiArray(res);

                    return collection;
                }),
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

    public getNewestRatingsList(portfolio: Portfolio): Observable<AnalystRating[]>
    {
        const shareheadIds: number[] = [];
        portfolio.getActiveNonCashPositions().forEach(position => {
            if (position.shareheadId) {
                shareheadIds.push(position.shareheadId);
            }
        });
        portfolio.watchlistEntries.forEach(entry => {
            shareheadIds.push(entry.shareheadId);
        });
        return this.http.post(this.baseUrl + '/listing/newest-ratings', JSON.stringify(shareheadIds))
            .pipe(
                map(res => {
                    const ratings = AnalystRatingCreator.fromApiArray(res);
                    ratings.reverse();
                    portfolio.getActiveNonCashPositions().forEach(position => {
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

    public getNextReportsList(portfolio: Portfolio): Observable<ShareheadShare[]>
    {
        const shareheadIds: number[] = [];
        portfolio.getActiveNonCashPositions().forEach(position => {
            if (position.shareheadId) {
                shareheadIds.push(position.shareheadId);
            }
        });
        portfolio.watchlistEntries.forEach(entry => {
            shareheadIds.push(entry.shareheadId);
        });
        return this.http.post(this.baseUrl + '/listing/next-reports', JSON.stringify(shareheadIds))
            .pipe(
                map(res => {
                    const shares = ShareheadShareCreator.fromApiArray(res);
                    portfolio.getActiveNonCashPositions().forEach(position => {
                        shares.forEach(share => {
                            if (position.shareheadId === share.id) {
                                share.positionId = position.id;
                            }
                        });
                    });

                    return shares;
                }),
            );
    }

}
