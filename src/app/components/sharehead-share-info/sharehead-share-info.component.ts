import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {ShareheadService} from "../../services/sharehead.service";
import {StockRate} from "../../models/stock-rate";


@Component({
    selector: 'app-sharehead-share-info',
    templateUrl: './sharehead-share-info.component.html',
    styleUrls: ['./sharehead-share-info.component.scss']
})
export class ShareheadShareInfoComponent implements OnInit {

    @Input() shareheadShare?: ShareheadShare;
    @Input() componentTitle?: string;
    @Input() timeWarpMode?: boolean;
    @Input() timeWarpDate?: Date|undefined;
    @Output() removeInquiry: EventEmitter<any> = new EventEmitter();
    public stockRate?: StockRate;

    public nextEstimationYear = new Date().getFullYear() + 1;
    public overNextEstimationYear = new Date().getFullYear() + 3;

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
        }
    }


    sendRemoveInquiry() {
        this.removeInquiry.emit();
    }

}
