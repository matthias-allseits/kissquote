import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {PositionService} from "../services/position.service";
import {Position} from "../models/position";
import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {ChartData} from "chart.js";
import {ShareheadService} from "../services/sharehead.service";
import {Label} from "../models/label";


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
                        if (position.share && position.currency) {
                            this.shareheadService.getQuotesBySwissquote(position.share, position.currency?.name)
                                .subscribe(rates => {
                                    if (rates && rates.length > 0) {
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
                        let ultimateFilter: Label[];
                        const filterFromStorage = localStorage.getItem('ultimateFilterLabel');
                        if (filterFromStorage) {
                            ultimateFilter = JSON.parse(filterFromStorage);
                            let checkedCounter = 0;
                            ultimateFilter?.forEach(lbl => {
                                if (lbl.checked) {
                                    checkedCounter++;
                                }
                            });
                            if (checkedCounter < 3) {
                                ultimateFilter?.forEach(lbl => {
                                    console.log(lbl);
                                    if (position.labels && lbl.checked) {
                                        position.labels.forEach(label => {
                                            if (lbl.id === label.id && lbl.checked) {
                                                console.log('set label as checked');
                                                label.checked = true;
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
        });
    }

    private areRatesEqual(rate1: StockRate, rate2: StockRate): boolean
    {
        return rate1.rate === rate2.rate && rate1.high === rate2.high;
    }

}
