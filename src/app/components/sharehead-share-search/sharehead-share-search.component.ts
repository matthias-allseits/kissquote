import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {ShareheadService} from "../../services/sharehead.service";


@Component({
    selector: 'app-sharehead-share-search',
    templateUrl: './sharehead-share-search.component.html',
    styleUrls: ['./sharehead-share-search.component.scss']
})
export class ShareheadShareSearchComponent implements OnInit {

    @Output() selectedShare: EventEmitter<any> = new EventEmitter();

    public selectableShares?: ShareheadShare[];
    searchInput = '';

    constructor(
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit(): void {
    }

    searchShare(event: any): void {
        this.selectableShares = [];
        if (event.target.value) {
            const searchString = event.target.value.toLowerCase();
            if (searchString.length > 2) {
                this.shareheadService.searchShare(searchString).subscribe(shares => {
                    if (shares) {
                        this.selectableShares = shares;
                    }
                });
            }
        }
    }

    selectShare(shareheadShare: ShareheadShare): void {
        this.selectableShares = [];
        this.selectedShare.emit(shareheadShare);
        this.searchInput = '';
    }

}
