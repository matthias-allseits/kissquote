import {DividendProjection} from "../models/dividend-projection";

export class DividendProjectionCreator {

    public static createNewDividendProjection(): DividendProjection {
        return new DividendProjection(null, 0, '', '', '');
    }

}
