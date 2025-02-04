import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {ShareheadService} from "../../services/sharehead.service";
import {StockRate} from "../../models/stock-rate";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {PositionCreator} from "../../creators/position-creator";
import {ShareCreator} from "../../creators/share-creator";


@Component({
    selector: 'app-sharehead-share-info',
    templateUrl: './sharehead-share-info.component.html',
    styleUrls: ['./sharehead-share-info.component.scss']
})
export class ShareheadShareInfoComponent implements OnInit {

    @Input() shareheadShare?: ShareheadShare;
    @Input() componentTitle?: string;
    @Input() positionContext = true;
    @Input() timeWarpMode?: boolean; // todo: this is also used for compareMode. this is crap
    @Input() timeWarpDate?: Date|undefined;
    @Output() removeInquiry: EventEmitter<any> = new EventEmitter();
    public stockRate?: StockRate;
    public historicStockRates: StockRate[] = [];

    public nextEstimationYear = new Date().getFullYear() + 1;
    public overNextEstimationYear = new Date().getFullYear() + 3;

    externalLinkIcon = faExternalLinkAlt;

    constructor(
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit(): void {
        if (this.shareheadShare) {
            this.shareheadService.getShareRate(this.shareheadShare.id)
                .subscribe(rate => {
                    if (rate) {
                        this.stockRate = rate;
                    }
                });
            if (!this.positionContext || this.timeWarpMode) {
                // todo: fix this
                const position = PositionCreator.createNewPosition();
                const share = ShareCreator.createNewShare();
                share.marketplace = this.shareheadShare.marketplace;
                share.isin = this.shareheadShare.isin;
                position.currency = this.shareheadShare.currency;
                position.share = share;
                this.shareheadService.getRatesForPositionFromSwissquote(position)
                    .subscribe((rates => {
                        this.historicStockRates = rates;
                    }));
            }
        }
    }


    sendRemoveInquiry() {
        this.removeInquiry.emit();
    }

}
