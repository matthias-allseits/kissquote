import {Component, EventEmitter, Input, OnInit, Output, Type, ViewChild, ViewEncapsulation} from '@angular/core';
import {faEdit, faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {DateHelper} from "../../core/datehelper";
import { DecimalPipe } from '@angular/common';
import {CellRendererInterface} from "../cell-renderer/cell-renderer.interface";
import {Position} from "../../models/position";
import {PositionCreator} from "../../creators/position-creator";


export interface GridColumn {
    title: string,
    type: string,
    field: string,
    format?: string,
    alignment?: string,
    resultColoring?: boolean,
    toolTip?: string,
    responsive?: string,
    width?: string,
    renderer?: string,
    // renderer?: Type<CellRendererInterface>,
}

export interface GridContextMenuItem {
    key: string,
    label: string,
    toolTip?: string,
}

@Component({
    selector: 'app-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DataGridComponent implements OnInit {

    @Input() gridData?: any[];
    @Input() gridColumns?: GridColumn[];
    @Input() contextMenu?: GridContextMenuItem[];
    @Output() baseFunctionCall: EventEmitter<any> = new EventEmitter();
    @Output() selectedItem: EventEmitter<any> = new EventEmitter();

    // @ViewChild(CellRendererDirective, {static: true}) cell2Render!: CellRendererDirective;

    protected readonly eyeIcon = faEye;
    protected readonly deleteIcon = faTrashAlt;
    protected readonly addIcon = faPlus;
    protected readonly editIcon = faEdit;
    protected readonly naviIcon = faEllipsisVertical;

    constructor(
        private _decimalPipe: DecimalPipe
    ) {
    }

    // todo: develop a elaborated date-formatter
    ngOnInit() {
        // setTimeout(() => {
        //     this.renderCells();
        // }, 1000);
    }


    setPositionAchor(entry: any, column: GridColumn): boolean {
        if (entry instanceof Position && column.field === 'share.name') {
            return true;
        }
        if (entry.hasOwnProperty('position') && entry.position instanceof Position && column.field === 'position.share.name') {
            return true;
        }

        return false;
    }

    getPosition(entry: any, column: GridColumn): Position {
        if (entry instanceof Position && column.field === 'share.name') {
            return entry
        } else if (entry.hasOwnProperty('position') && entry.position instanceof Position && column.field === 'position.share.name') {
            return entry.position;
        }

        return PositionCreator.createNewPosition();
    }

    checkForRedColoring(entry: any): boolean {
        return entry instanceof Position && entry.active && entry.stopLossBroken();
    }

    checkForGreenColoring(entry: any): boolean {
        return entry instanceof Position && entry.active && entry.hasReachedTargetPrice();
    }

    checkForVisibility(entry: any): string {
        let visibility = 'table-row';
        if (entry instanceof Position && entry.visible === false) {
            visibility = 'none';
        }

        return visibility;
    }

    renderContent(entry: any, column: GridColumn): string {
        let result: any;

        let fieldName = column.field;
        if (column.field.indexOf('.') > -1) {
            const fieldSplit = column.field.split('.');
            const firstField = fieldSplit[0];
            const secondField = fieldSplit[1];
            const followingFields = fieldSplit.slice(1);

            if (typeof entry[firstField] === 'function') {
                const firstResult = entry[firstField]();
                result = firstResult[secondField];
                if (column.format) {
                    result = this._decimalPipe.transform(result, column.format);
                }

                return result;
            }

            const subColumn = structuredClone(column);
            subColumn.field = followingFields.join('.');

            return this.renderContent(entry[fieldSplit[0]], subColumn);
        }

        if (entry) {
            if (entry.hasOwnProperty(fieldName)) {
                result = entry[fieldName];
                if (column.type === 'date' && result instanceof Date) {
                    result = DateHelper.convertDateToGerman(result); // todo: develop a elaborated date-formatter
                } else if (column.type === 'number' || column.type === 'percent') {
                    result = +result;
                    if (isNaN(result)) {
                        return '';
                    }
                    if (column.format) {
                        result = this._decimalPipe.transform(result, column.format);
                    }
                    if (column.type === 'percent') {
                        result += '%';
                    }
                }
            }
            if (typeof entry[fieldName] === 'function' && column.type === 'function') {
                result = entry[fieldName]();
                if (column.format) {
                    result = this._decimalPipe.transform(result, column.format);
                }
            }
        }

        return result;
    }


    // renderCells(): void {
    //     if (this.gridData && this.gridColumns) {
    //         for (const entry of this.gridData) {
    //             for (const column of this.gridColumns) {
    //                 let fieldName = column.field;
    //                 if (column.type === 'renderer' && column.renderer) {
    //                     console.log('type is renderer');
    //                     const viewContainerRef = this.cell2Render.viewContainerRef;
    //                     // viewContainerRef.clear();
    //                     const componentRef = viewContainerRef.createComponent<LabelsCellRendererComponent>(column.renderer);
    //                     componentRef.instance.data = entry[fieldName];
    //                 }
    //             }
    //         }
    //     }
    // }

    toggleMenu(entry: any): void {
        this.selectedItem.next(entry);
    }

    callFunction(contextEntry: GridContextMenuItem, entry?: any): void {
        if (entry) {
            this.selectedItem.next(entry);
        }
        this.baseFunctionCall.next(contextEntry);
    }

}
