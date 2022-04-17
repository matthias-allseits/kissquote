import {ShareheadBalance} from "./sharehead-balance";

export class ShareheadAnalysisResults {

    constructor(
        public estimationChanges: ShareheadBalance[],
        public estimationChangesOverNext: ShareheadBalance[],
    ) {}

}
