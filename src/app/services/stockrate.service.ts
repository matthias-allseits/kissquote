import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {StockRate} from "../models/stock-rate";
import {DateHelper} from "../core/datehelper";


@Injectable({
    providedIn: 'root'
})

export class StockrateService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/stockrate', http);
    }


    public getStockRate(isin: string, marketplace: number, currency: string, date: Date): Observable<StockRate|undefined>
    {
        const dateStamp = DateHelper.convertDateToMysql(date);
        return this.http.get<StockRate>(this.apiUrl + `/${isin}/${marketplace}/${currency}/${dateStamp}`)
            .pipe(
                map(res => StockRateCreator.oneFromApiArray(res))
            );
    }

}
