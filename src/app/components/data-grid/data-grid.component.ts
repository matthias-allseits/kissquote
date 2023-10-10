import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faEdit, faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {DateHelper} from "../../core/datehelper";
import { DecimalPipe } from '@angular/common';


export interface GridColumn {
    title: string,
    type: string,
    field: string,
    format?: string,
    alignment?: string,
    toolTip?: string,
    responsive?: string,
}

export interface GridContextMenuItem {
    key: string,
    label: string,
}

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

    @Input() gridData?: any[];
    @Input() gridColumns?: GridColumn[];
    @Input() contextMenu?: GridContextMenuItem[];
    @Output() baseFunctionCall: EventEmitter<any> = new EventEmitter();
    @Output() selectedItem: EventEmitter<any> = new EventEmitter();

    protected readonly eyeIcon = faEye;
    protected readonly deleteIcon = faTrashAlt;
    protected readonly addIcon = faPlus;
    protected readonly editIcon = faEdit;
    protected readonly naviIcon = faEllipsisVertical;

    constructor(
        private _decimalPipe: DecimalPipe
    ) {
    }

    ngOnInit() {
    }


    renderCell(entry: any, column: GridColumn): string {
        let result: any;

        let fieldName = column.field;
        if (column.field.indexOf('.') > -1) {
            const fieldSplit = column.field.split('.');
            const subFields = fieldSplit.slice(1);

            const subColumn = structuredClone(column);
            subColumn.field = subFields.join('.');

            return this.renderCell(entry[fieldSplit[0]], subColumn);
        }

        if (entry.hasOwnProperty(fieldName)) {
            result = entry[fieldName];
            if (column.type === 'date' && result instanceof Date) {
                result = DateHelper.convertDateToGerman(result); // todo: develop a elaborated date-formatter
            } else if (column.type === 'number') {
                result = +result;
                if (column.format) {
                    result = this._decimalPipe.transform(result, column.format);
                }
            }
        }
        if (typeof entry[fieldName] === 'function' && column.type === 'function') {
            result = entry[fieldName]();
            if (column.format) {
                result = this._decimalPipe.transform(result, column.format);
            }
        }

        return result;
    }

    toggleMenu(entry: any): void {
        this.selectedItem.next(entry);
    }

    callFunction(entry: any): void {
        this.baseFunctionCall.next(entry);
    }

}
