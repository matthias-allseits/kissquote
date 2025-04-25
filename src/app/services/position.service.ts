import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Position} from '../models/position';
import {PositionCreator} from "../creators/position-creator";
import {DateHelper} from "../core/datehelper";
import {ApiService} from "./api-service";
import {StockRate} from "../models/stock-rate";
import {SwissquoteHelper} from "../core/swissquote-helper";
import {Share} from "../models/share";
import {Currency} from "../models/currency";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class PositionService extends ApiService {

    private activePositions?: Position[];

    constructor(
        public override http: HttpClient,
    ) {
        super('/position', http);
    }


    public getOfflineStockRates(share: Share|null, currency: Currency|undefined): Observable<StockRate[]> {
        if (share && currency) {
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'text/plain',
                })
            };
            return new Observable(obsData => {
                let currencyName = currency.name;
                    if (currencyName === 'GBP') {
                        currencyName = 'GBX';
                    }
                const ratesUrl = `assets/${share.isin}_${share.marketplace?.urlKey}_${currencyName}`;
                // const ratesUrl = `assets/banana`;
                this.http.get(ratesUrl, { responseType: 'text' })
                    .subscribe(data => {
                        console.log(data);
                            let rates: StockRate[] = [];
                            const date = new Date();
                            date.setFullYear(2022);
                            rates = SwissquoteHelper.parseRates(data, currencyName === 'GBX');

                            obsData.next(rates);
                    })
            });
        }

        return new Observable<StockRate[]>();
    }


    public getPosition(id: number): Observable<Position|undefined>
    {
        return this.http.get<Position>(this.apiUrl + '/' + id)
            .pipe(
                map(res => PositionCreator.oneFromApiArray(res))
            );
    }


    public getPositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.apiUrl)
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
            );
    }


    public getActivePositions(): Observable<Position[]>
    {
        if (this.activePositions) {
            return new Observable(psitons => {
                psitons.next(this.activePositions);
            });
        } else {
            return this.http.get<Position[]>(this.apiUrl + '/active')
                .pipe(
                    map(res => {
                        const castedPosis = PositionCreator.fromApiArray(res);
                        this.activePositions = castedPosis;
                        return castedPosis;
                    })
                );
        }
    }


    public getNonCashAndActivePositions(): Observable<Position[]>
    {
        return new Observable(psitons => {
            const result: Position[] = [];
            this.getActivePositions().subscribe(positions => {
                for (const position of positions) {
                    if (!position.isCash) {
                        result.push(position);
                    }
                }
                psitons.next(result);
            });
        });
    }


    create(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        if (position.activeUntil) {
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
        } else {
            position.activeUntil = null;
        }
        if (position.manualDividendExDate) {
            position.manualDividendExDate = DateHelper.convertDateToMysql(position.manualDividendExDate);
        } else {
            position.manualDividendExDate = null;
        }
        if (position.manualDividendPayDate) {
            position.manualDividendPayDate = DateHelper.convertDateToMysql(position.manualDividendPayDate);
        } else {
            position.manualDividendPayDate = null;
        }
        if (position.manualDividendAmount === undefined) {
            position.manualDividendAmount = null;
        }
        position.transactions.forEach(transaction => {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
        });
        const url = `${this.apiUrl}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
            );
    }


    createCashPosition(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
        position.transactions.forEach(transaction => {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
        });
        const url = `${this.apiUrl}/cash`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
            );
    }


    createPositionsFromBunch(positions: Position[]): Observable<Position[]|null> {
        positions.forEach(position => {
            position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
            position.transactions.forEach(transaction => {
                transaction.date = DateHelper.convertDateToMysql(transaction.date);
            });
        })
        const url = `${this.apiUrl}/bunch`;
        console.log(JSON.stringify(positions));
        return this.http
            .post(url, JSON.stringify(positions), httpOptions)
            .pipe(
                map(() => positions),
            );
    }


    update(position: Position): Observable<Position|undefined> {
        const shareheadShare = position.shareheadShare;
        const deepCopy = structuredClone(position);
        deepCopy.activeFrom = DateHelper.convertDateToMysql(deepCopy.activeFrom);
        if (deepCopy.activeUntil) {
            deepCopy.activeUntil = DateHelper.convertDateToMysql(deepCopy.activeUntil);
        } else {
            deepCopy.activeUntil = null;
        }
        if (deepCopy.manualDividendExDate) {
            deepCopy.manualDividendExDate = DateHelper.convertDateToMysql(deepCopy.manualDividendExDate);
        } else {
            deepCopy.manualDividendExDate = null;
        }
        if (deepCopy.manualDividendPayDate) {
            deepCopy.manualDividendPayDate = DateHelper.convertDateToMysql(deepCopy.manualDividendPayDate);
        } else {
            deepCopy.manualDividendPayDate = null;
        }
        if (deepCopy.manualDividendAmount === undefined) {
            deepCopy.manualDividendAmount = null;
        }
        if (deepCopy.removeUnderlying && deepCopy.underlying) {
            deepCopy.underlying = undefined;
        }
        const url = `${this.apiUrl}/${position.id}`;
        return this.http
            .put<Position>(url, JSON.stringify(deepCopy), httpOptions)
            .pipe(
                map(res => {
                    const castedPosi = PositionCreator.oneFromApiArray(res);
                    if (castedPosi) {
                        castedPosi.shareheadShare = shareheadShare;
                    }
                    return castedPosi;
                }),
            );
    }


    delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
            );
    }


    addLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.get(url, httpOptions)
            .pipe(
            );
    }


    deleteLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.delete(url, httpOptions)
            .pipe(
            );
    }

}
