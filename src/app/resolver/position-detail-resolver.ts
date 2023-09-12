import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {PositionService} from "../services/position.service";
import {Position} from "../models/position";
import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {ChartData} from "chart.js";
import {ShareheadService} from "../services/sharehead.service";


export interface PositionData {
    position?: Position;
    historicRates?: StockRate[];
    costIncomeChartData?: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class PositionDetailResolver implements Resolve<PositionData>{

    constructor(
        private positionService: PositionService,
        private shareheadService: ShareheadService,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PositionData> {
        const positionId = route.params['id'];
        // console.log('positionId in resolver: ', positionId);

        return new Observable(holder => {
            let historicRates: StockRate[];
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    if (position) {
                        const data: PositionData = {
                            position: position,
                            historicRates: undefined,
                            costIncomeChartData: position.costIncomeChartdata()
                        }
                        if (position.isCash) {
                            holder.next(data);
                        }

                        // this.positionService.getOfflineStockRates(this.position.share, this.position.currency)
                        position.getStockRates()
                            .subscribe(rates => {
                                if (rates.length > 0) {
                                    this.addLatestRateToLineChart(position, rates);
                                    data.historicRates = rates;

                                    if (position.shareheadId && position.shareheadId > 0) {
                                        this.shareheadService.getShare(position.shareheadId)
                                            .subscribe(share => {
                                                if (share) {
                                                    position.shareheadShare = share;
                                                    holder.next(data);
                                                }
                                            });
                                    } else {
                                        holder.next(data);
                                    }
                                } else {
                                    data.historicRates = [];
                                    holder.next(data);
                                }
                            });

                    }
                });
        });
    }

    private addLatestRateToLineChart(position: Position, rates: StockRate[]): void
    {
        if (position?.balance) {
            if (position.balance.lastRate?.date instanceof Date) {
                if (position.balance.lastRate.date > rates[rates.length - 1].date) {
                    if (position.share?.marketplace?.currency === 'GBX') {
                        // island apes shit!
                        const ratesCopy = StockRateCreator.createNewStockRate();
                        ratesCopy.rate = position.balance.lastRate.rate * 100;
                        ratesCopy.high = position.balance.lastRate.high;
                        ratesCopy.low = position.balance.lastRate.low;
                        rates.push(ratesCopy);
                    } else {
                        if (position.share?.name && position.share?.name?.indexOf('BRC') > -1) {
                            if (position.balance.lastRate.low === 0) {
                                position.balance.lastRate.low = position.balance.lastRate.rate / 10;
                            }
                            if (position.balance.lastRate.high === 0) {
                                position.balance.lastRate.high = position.balance.lastRate.rate / 10;
                            }
                        }
                        rates.push(position.balance.lastRate);
                    }
                }
            }
        }
    }

}
