import {ShareheadShare} from "../models/sharehead-share";
import {CurrencyCreator} from "./currency-creator";
import {ShareheadBalanceCreator} from "./sharehead-balance-creator";
import {MarketplaceCreator} from "./marketplace-creator";
import {ShareheadShareAnalysisResultsCreator} from "./sharehead-share-analysis-results-creator";
import {ShareheadPlannedDividendCreator} from "./sharehead-planned-dividend-creator";
import {AnalystRatingCreator} from "./analyst-rating-creator";
import {ShareheadEstimationCreator} from "./sharehead-estimation-creator";
import {ShareheadTurningPointCreator} from "./sharehead-turning-point-creator";
import {StockRateCreator} from "./stock-rate-creator";
import {ShareheadHistoricDividendCreator} from "./sharehead-historic-dividend-creator";


export class ShareheadShareCreator {

    public static fromApiArray(apiArray: object): ShareheadShare[] {
        const array: ShareheadShare[] = [];

        if (Array.isArray(apiArray)) {
            for (const shareList of apiArray) {
                const share = this.oneFromApiArray(shareList);
                if (share instanceof ShareheadShare) {
                    array.push(share);
                }
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadShare|undefined): ShareheadShare|undefined
    {
        if (apiArray !== undefined) {
            const marketplace = MarketplaceCreator.oneFromApiArray(apiArray.marketplace);
            if (apiArray.balances?.length) {
                apiArray.balances.forEach((balance, index) => {
                    if (apiArray.balances && apiArray.balances[index-1]) {
                        balance.lastYearEquity = apiArray.balances[index-1].equity;
                    }
                });
            }
            return new ShareheadShare(
                apiArray.id,
                apiArray.shareheadId,
                marketplace,
                apiArray.name,
                apiArray.shortname,
                apiArray.isin,
                apiArray.symbol,
                apiArray.country,
                apiArray.sector,
                apiArray.financialYearEndDate ? new Date(apiArray.financialYearEndDate) : null,
                apiArray.nextReportDate ? new Date(apiArray.nextReportDate) : null,
                apiArray.urlFinanznet,
                apiArray.urlWikipedia,
                apiArray.urlInvesting,
                apiArray.urlFinanztreff,
                apiArray.urlDiviMax,
                apiArray.urlYahoo,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.ipoDate ? new Date(apiArray.ipoDate) : undefined,
                apiArray.balances ? ShareheadBalanceCreator.fromApiArray(apiArray.balances) : [],
                apiArray.estimations ? ShareheadEstimationCreator.fromApiArray(apiArray.estimations) : [],
                apiArray.analysisResults ? ShareheadShareAnalysisResultsCreator.oneFromApiArray(apiArray.analysisResults) : undefined,
                apiArray.plannedDividends ? ShareheadPlannedDividendCreator.fromApiArray(apiArray.plannedDividends) : undefined,
                apiArray.analystRatings ? AnalystRatingCreator.fromApiArray(apiArray.analystRatings) : undefined,
                apiArray.turningPoints ? ShareheadTurningPointCreator.fromApiArray(apiArray.turningPoints) : undefined,
                apiArray.historicDividends ? ShareheadHistoricDividendCreator.fromApiArray(apiArray.historicDividends) : undefined,
                apiArray.lastRate ? StockRateCreator.oneFromApiArray(apiArray.lastRate) : undefined,
                apiArray.boeNewsId,
                apiArray.boeNewsSummary,
            );

        } else {
            return undefined;
        }
    }

}
