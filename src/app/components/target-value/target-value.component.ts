import {Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {PositionService} from "../../services/position.service";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


export interface TargetSummary {
    position: Position;
    actual: number;
    target: number;
    targetPrice: number;
    chance: number;
    method: string;
    methodShort: string;
}

@Component({
  selector: 'app-target-value',
  templateUrl: './target-value.component.html',
  styleUrls: ['./target-value.component.scss']
})
export class TargetValueComponent {

    @ViewChild('manualTargetPriceFormModal') targetModal?: TemplateRef<any>;

    @Input() portfolio?: Portfolio;

    public targetList: TargetSummary[] = [];
    public actualTotal = 0;
    public targetTotal = 0;
    public chance = 0;
    modalRef?: NgbModalRef;
    public selectedTargetSummary?: TargetSummary;

    public tableColumns?: GridColumn[];
    public tableContextMenu?: GridContextMenuItem[];

    manualTargetPriceForm = new FormGroup({
        targetPrice: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private positionService: PositionService,
        private modalService: NgbModal,
    ) {}

    ngOnInit() {
        this.prepareData();
        this.setTableGridOptions();
    }


    openManualModal(template: TemplateRef<any>) {
        this.manualTargetPriceForm.get('targetPrice')?.setValue(this.selectedTargetSummary?.position?.manualTargetPrice);
        this.modalRef = this.modalService.open(template);
    }

    cancelModal(): void {
        this.selectedTargetSummary = undefined;
        this.modalRef?.close();
    }

    persistManualTargetPrice(): void {
        if (this.selectedTargetSummary) {
            const positionToUpdate = this.selectedTargetSummary.position;
            positionToUpdate.manualTargetPrice = +this.manualTargetPriceForm.get('targetPrice')?.value;
            this.positionService.update(positionToUpdate)
                .subscribe(position => {
                    if (position && this.portfolio) {
                        this.portfolio.replacePosition(position);
                        this.prepareData();
                    }
                });
            this.selectedTargetSummary = undefined;
        }
        this.modalRef?.close();
    }


    prepareData() {
        this.targetList = [];
        this.actualTotal = 0;
        this.targetTotal = 0;
        this.chance = 0;
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            const targetSummary = position.getTargetSummary();
            this.actualTotal += targetSummary.actual;
            this.targetTotal += targetSummary.target;
            this.targetList.push(targetSummary);
        });
        this.chance = +((100 / this.actualTotal * this.targetTotal) - 100).toFixed();
        this.targetList.sort((a, b) => (+a.chance < +b.chance) ? 1 : ((+b.chance < +a.chance) ? -1 : 0));
    }


    selectEntry(entry: TargetSummary) {
        this.selectedTargetSummary = entry;
    }

    gridEventHandler(event: any) {
        switch(event.key) {
            case 'editTarget':
                if (this.targetModal) {
                    this.openManualModal(this.targetModal);
                }
                break;
        }
    }

    private setTableGridOptions() {
        this.tableColumns = [];
        this.tableColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'position.sector.name',
                responsive: 'md-up',
            },
            {
                title: 'Actual',
                type: 'number',
                field: 'actual',
                format: '1.0',
                alignment: 'right',
                responsive: 'md-up',
            },
            {
                title: 'Target',
                type: 'number',
                field: 'target',
                format: '1.0',
                alignment: 'right',
            },
            {
                title: 'Method',
                type: 'string',
                field: 'method',
                responsive: 'md-up',
            },
            {
                title: 'Method',
                type: 'string',
                field: 'methodShort',
                responsive: 'sm-only',
            },
            {
                title: 'TP',
                type: 'number',
                format: '1.0-2',
                field: 'targetPrice',
                alignment: 'right',
                toolTip: 'Target price',
                responsive: 'sm-up',
            },
            {
                title: 'Chance',
                type: 'percent',
                format: '1.0',
                field: 'chance',
                alignment: 'right',
            }
        );

        this.tableContextMenu = [];
        this.tableContextMenu.push(
            {
                key: 'editTarget',
                label: 'Edit target-price',
            },
        );
    }

}
