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
                            rates = SwissquoteHelper.parseRates(data, date, 1000);

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
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getPositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.apiUrl)
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getActivePositions(): Observable<Position[]>
    {
        return this.http.get<Position[]>(this.apiUrl + '/active')
            .pipe(
                map(res => PositionCreator.fromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }


    public getNonCashAndActivePositions(): Observable<Position[]>
    {
        return new Observable(psitons => {
            this.getActivePositions().subscribe(positions => {
                positions.forEach(position => {
                    if (!position.isCash) {
                        positions.push(position);
                    }
                });
                psitons.next(positions);
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
        position.transactions.forEach(transaction => {
            transaction.date = DateHelper.convertDateToMysql(transaction.date);
        });
        const url = `${this.apiUrl}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .post(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
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
                // catchError(this.handleError)
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
                // catchError(this.handleError)
            );
    }


    update(position: Position): Observable<Position|null> {
        position.activeFrom = DateHelper.convertDateToMysql(position.activeFrom);
        if (position.activeUntil) {
            position.activeUntil = DateHelper.convertDateToMysql(position.activeUntil);
        } else {
            position.activeUntil = null;
        }
        if (position.removeUnderlying && position.underlying) {
            position.underlying = undefined;
        }
        const url = `${this.apiUrl}/${position.id}`;
        // todo: cast this as we do in position-log-service
        return this.http
            .put(url, JSON.stringify(position), httpOptions)
            .pipe(
                map(() => position),
                // catchError(this.handleError)
            );
    }


    delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }


    addLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.get(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }


    deleteLabel(positionId: number, labelId: number): Observable<Object> {
        const url = `${this.apiUrl}/${positionId}/label/${labelId}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // catchError(this.handleError)
            );
    }

}
