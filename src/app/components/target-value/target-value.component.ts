import {Component, Input, TemplateRef} from '@angular/core';
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
import {DateHelper} from "../../core/datehelper";
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {PositionService} from "../../services/position.service";


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

    @Input() portfolio?: Portfolio;

    public targetList: TargetSummary[] = [];
    public actualTotal = 0;
    public targetTotal = 0;
    public chance = 0;
    modalRef?: NgbModalRef;
    public selectedTargetSummary?: TargetSummary;

    deleteIcon = faTrashAlt;
    editIcon = faEdit;

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
    }


    openManualModal(template: TemplateRef<any>, entry: TargetSummary|undefined) {
        this.selectedTargetSummary = entry;
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
            let method = 'none';
            let methodShort = 'none';
            let actual = +position.actualValue();
            let target = +position.actualValue();
            let targetPrice = 0;
            const targetFromMostOptimistic = position.valueFromMostOptimisticAnalyst();
            if (position.manualTargetPrice && position.balance) {
                target = position.balance?.amount * position.manualTargetPrice;
                targetPrice = position.manualTargetPrice;
                method = `from manual entry`;
                methodShort = `from manual entry`;
            } else if (targetFromMostOptimistic && position.shareheadShare) {
                const mostOptimisticRating = position.shareheadShare.mostOptimisticRating();
                target = targetFromMostOptimistic;
                if (mostOptimisticRating?.date && mostOptimisticRating?.priceTarget) {
                    targetPrice = +mostOptimisticRating?.priceTarget;
                    method = `from analyst (${mostOptimisticRating?.analyst?.shortName}, ` + DateHelper.convertDateToGerman(mostOptimisticRating?.date) + `)`;
                    methodShort = `from ${mostOptimisticRating?.analyst?.shortName}`;
                }
            }
            const chance = +((100 / actual * target) - 100).toFixed();
            const entry = {
                position: position,
                actual: actual,
                target: target,
                targetPrice: targetPrice,
                chance: chance,
                method: method,
                methodShort: methodShort
            };
            this.actualTotal += actual;
            this.targetTotal += target;
            this.chance = +((100 / this.actualTotal * this.targetTotal) - 100).toFixed();
            this.targetList.push(entry);
        });

        this.targetList.sort((a, b) => (+a.chance < +b.chance) ? 1 : ((+b.chance < +a.chance) ? -1 : 0));
    }

}
