import {ShareheadEstimation} from "./sharehead-estimation";

export class ShareheadAnalysisResults {

    constructor(
        public estimationChanges: ShareheadEstimation[],
        public estimationChangesOverNext: ShareheadEstimation[],
    ) {}

}
