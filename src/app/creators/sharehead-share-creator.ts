import {ShareheadShare} from "../models/sharehead-share";
import {CurrencyCreator} from "./currency-creator";
import {ShareheadBalanceCreator} from "./sharehead-balance-creator";
import {MarketplaceCreator} from "./marketplace-creator";
import {ShareheadShareAnalysisResultsCreator} from "./sharehead-share-analysis-results-creator";
import {ShareheadPlannedDividendCreator} from "./sharehead-planned-dividend-creator";


export class ShareheadShareCreator {

    public static fromApiArray(apiArray: ShareheadShare[]): ShareheadShare[] {
        const array: ShareheadShare[] = [];

        for (const shareList of apiArray) {
            const share = this.oneFromApiArray(shareList);
            if (share instanceof ShareheadShare) {
                array.push(share);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadShare|null): ShareheadShare|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            const marketplace = MarketplaceCreator.oneFromApiArray(apiArray.marketplace);
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
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.balances ? ShareheadBalanceCreator.fromApiArray(apiArray.balances) : [],
                apiArray.estimations ? ShareheadBalanceCreator.fromApiArray(apiArray.estimations) : [],
                apiArray.analysisResults ? ShareheadShareAnalysisResultsCreator.oneFromApiArray(apiArray.analysisResults) : undefined,
                apiArray.plannedDividends ? ShareheadPlannedDividendCreator.fromApiArray(apiArray.plannedDividends) : undefined,
            );
        } else {
            return null;
        }
    }

}
