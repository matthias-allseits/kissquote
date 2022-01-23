import {Marketplace} from "../models/marketplace";


export class MarketplaceCreator {

    public static fromApiArray(apiArray: Marketplace[]): Marketplace[] {
        const array: Marketplace[] = [];

        for (const marketplacesList of apiArray) {
            const marketplace = this.oneFromApiArray(marketplacesList);
            if (undefined !== marketplace) {
                array.push(marketplace);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Marketplace|undefined): Marketplace|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Marketplace(
                apiArray.id,
                apiArray.name,
                apiArray.place,
                apiArray.currency,
                apiArray.urlKey,
                apiArray.isinKey,
            );
        } else {
            return undefined;
        }
    }

}
