import {ShareheadAnalysisResults} from "../models/sharehead-analysis-results";
import {ShareheadEstimationCreator} from "./sharehead-estimation-creator";


export class ShareheadShareAnalysisResultsCreator {

    public static oneFromApiArray(apiArray: ShareheadAnalysisResults|null): ShareheadAnalysisResults|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new ShareheadAnalysisResults(
                apiArray.estimationChanges ? ShareheadEstimationCreator.fromApiArray(apiArray.estimationChanges) : [],
                apiArray.estimationChangesOverNext ? ShareheadEstimationCreator.fromApiArray(apiArray.estimationChangesOverNext) : [],
            );
        } else {
            return undefined;
        }
    }

}
