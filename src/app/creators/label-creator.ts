import {Label} from "../models/label";

export class LabelCreator {

    public static createNewLabel(): Label {
        return new Label(0, '', '');
    }


    public static fromApiArray(apiArray: Label[]): Label[] {
        const array: Label[] = [];

        for (const labelList of apiArray) {
            const label = this.oneFromApiArray(labelList);
            if (label) {
                array.push(label);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Label|undefined): Label|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Label(
                apiArray.id,
                apiArray.name,
                apiArray.color,
            );
        } else {
            return undefined;
        }
    }

}
