import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {PositionService} from "../services/position.service";
import {Position} from "../models/position";
import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {ChartData} from "chart.js";


export interface PositionData {
    position: Position;
    historicRates: StockRate[];
    costIncomeChartData?: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class PositionDetailResolverService implements Resolve<PositionData>{

    constructor(
        private positionService: PositionService,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PositionData> {
        const positionId = route.params['id'];
        console.log('positionId in resolver: ', positionId);

        return new Observable(holder => {
            let historicRates: StockRate[];
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    if (position) {
                        // this.positionService.getOfflineStockRates(this.position.share, this.position.currency)
                        position.getStockRates()
                            .subscribe(rates => {
                                this.addLatestRateToLineChart(position, rates);
                                historicRates = rates;
                                const data = {
                                    position: position,
                                    historicRates: historicRates,
                                    costIncomeChartData: position.costIncomeChartdata()
                                }

                                holder.next(data);
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
