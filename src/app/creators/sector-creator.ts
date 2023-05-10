import {Sector} from "../models/sector";

export class SectorCreator {

    public static createNewSector(): Sector {
        return new Sector(0, '');
    }


    public static fromApiArray(apiArray: Sector[]): Sector[] {
        const array: Sector[] = [];

        for (const sectorList of apiArray) {
            const sector = this.oneFromApiArray(sectorList);
            if (sector) {
                array.push(sector);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Sector|undefined): Sector|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Sector(
                apiArray.id,
                apiArray.name,
            );
        } else {
            return undefined;
        }
    }

}
