import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {ShareheadService} from "../../services/sharehead.service";


@Component({
    selector: 'app-sharehead-share-container',
    templateUrl: './sharehead-share-container.component.html',
    styleUrls: ['./sharehead-share-container.component.scss']
})
export class ShareheadShareContainerComponent implements OnInit {

    @Input() shareheadShare?: ShareheadShare;
    @Output() removeInquiry: EventEmitter<any> = new EventEmitter();
    public timeWarpMode = false;
    public timeWarpDate?: Date;
    public timeWarpedShare?: ShareheadShare;
    public timeWarpTitle = '';

    externalLinkIcon = faExternalLinkAlt;

    constructor(
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit(): void {

    }


    startTimeWarp(years: number): void {
        this.timeWarpTitle = `${years} years ago`;
        this.timeWarpDate = new Date();
        this.timeWarpDate.setFullYear(this.timeWarpDate.getFullYear() - years);
        this.timeWarpMode = true;
        if (this.shareheadShare) {
            this.shareheadService.getTimeWarpedShare(this.shareheadShare.id, this.timeWarpDate)
                .subscribe(share => {
                    this.timeWarpedShare = share;
                })
        }
    }


    stopTimeWarp(): void {
        this.timeWarpMode = false;
        this.timeWarpedShare = undefined;
    }


    sendRemoveInquiry() {
        this.removeInquiry.emit();
    }

}
