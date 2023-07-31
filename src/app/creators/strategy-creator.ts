import {Strategy} from "../models/strategy";

export class StrategyCreator {

    public static createNewStrategy(): Strategy {
        return new Strategy(0, '');
    }


    public static fromApiArray(apiArray: Strategy[]): Strategy[] {
        const array: Strategy[] = [];

        for (const sectorList of apiArray) {
            const sector = this.oneFromApiArray(sectorList);
            if (sector) {
                array.push(sector);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Strategy|undefined): Strategy|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Strategy(
                apiArray.id,
                apiArray.name,
            );
        } else {
            return undefined;
        }
    }

}
