import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {ShareService} from "../../services/share.service";

@Component({
    selector: 'app-sharehead-share-search',
    templateUrl: './sharehead-share-search.component.html',
    styleUrls: ['./sharehead-share-search.component.scss']
})
export class ShareheadShareSearchComponent implements OnInit {

    @Output() selectedShare: EventEmitter<any> = new EventEmitter();

    public shareheadShares: ShareheadShare[] = [];
    public selectableShares?: ShareheadShare[];
    searchInput = '';

    constructor(
        private shareService: ShareService,
    ) {
    }

    ngOnInit(): void {
        this.shareService.getAllShareheadShares()
            .subscribe(shares => {
                this.shareheadShares = shares;
            });
    }


    searchShare(event: any): void {
        this.selectableShares = [];
        if (event.target.value) {
            this.shareheadShares?.forEach(share => {
                if (share.name && share.name.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
                    this.selectableShares?.push(share);
                }
            });
        }
    }

    selectShare(shareheadShare: ShareheadShare): void {
        this.selectableShares = [];
        this.selectedShare.emit(shareheadShare);
        this.searchInput = '';
    }

}
