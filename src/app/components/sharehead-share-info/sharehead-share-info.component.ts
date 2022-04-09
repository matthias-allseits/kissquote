import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";


@Component({
    selector: 'app-sharehead-share-info',
    templateUrl: './sharehead-share-info.component.html',
    styleUrls: ['./sharehead-share-info.component.scss']
})
export class ShareheadShareInfoComponent implements OnInit {

    @Input() shareheadShare?: ShareheadShare;
    @Output() removeInquiry: EventEmitter<any> = new EventEmitter();

    externalLinkIcon = faExternalLinkAlt;

    public nextEstimationYear = new Date().getFullYear() + 1;

    constructor() {
    }

    ngOnInit(): void {
    }


    sendRemoveInquiry() {
        this.removeInquiry.emit();
    }

}
