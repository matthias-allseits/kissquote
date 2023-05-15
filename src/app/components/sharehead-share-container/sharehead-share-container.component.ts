import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";


@Component({
    selector: 'app-sharehead-share-container',
    templateUrl: './sharehead-share-container.component.html',
    styleUrls: ['./sharehead-share-container.component.scss']
})
export class ShareheadShareContainerComponent implements OnInit {

    @Input() shareheadShare?: ShareheadShare;
    @Output() removeInquiry: EventEmitter<any> = new EventEmitter();
    public timeWarpMode = false;

    externalLinkIcon = faExternalLinkAlt;

    constructor(
    ) {
    }

    ngOnInit(): void {

    }


    timeWarp(years: number): void {
        this.timeWarpMode = true;
    }


    stopTimeWarp(): void {
        this.timeWarpMode = false;
    }


    sendRemoveInquiry() {
        this.removeInquiry.emit();
    }

}
