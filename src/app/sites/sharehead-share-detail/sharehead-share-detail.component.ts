import {Component, OnInit} from '@angular/core';
import {ShareheadShare} from "../../models/sharehead-share";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ShareheadService} from "../../services/sharehead.service";
import {WatchlistService} from "../../services/watchlist.service";
import {faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {StockRate} from "../../models/stock-rate";


@Component({
    selector: 'app-sharehead-share-detail',
    templateUrl: './sharehead-share-detail.component.html',
    styleUrls: ['./sharehead-share-detail.component.scss']
})
export class ShareheadShareDetailComponent implements OnInit {

    public shareheadShare?: ShareheadShare;
    public positionTab = 'sharehead';

    naviForwardIcon = faChevronRight;
    naviBackIcon = faChevronLeft;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private shareheadService: ShareheadService,
        private watchlistService: WatchlistService,
    ) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const id = +params['id'];
            if (id) {
                this.loadData(id);
            }
        });
    }


    changeTab(selectedTab: string): void {
        this.positionTab = selectedTab;
    }


    navigateCross(direction: string): void {
        let positionIndex: number = -1;
        this.watchlistService.getAllEntries()
            .subscribe(entries => {
                entries.forEach((entry, index) => {
                    if (this.shareheadShare) {
                        if (entry.shareheadId === this.shareheadShare.id) {
                            positionIndex = index;
                        }
                    }
                });
                let nextIndex = -1;
                if (direction === 'forward') {
                    nextIndex = positionIndex + 1;
                    if (nextIndex > entries.length - 1) {
                        nextIndex = 0;
                    }
                } else {
                    nextIndex = positionIndex - 1;
                    if (nextIndex < 0) {
                        nextIndex = entries.length - 1;
                    }
                }
                const nextPosition = entries[nextIndex];
                this.shareheadShare = undefined;
                this.router.navigate(['/sharehead-share-detail/' + nextPosition.shareheadId]);
                this.loadData(nextPosition.shareheadId);
            });
    }


    private loadData(id: number) {
        this.shareheadService.getShare(id)
            .subscribe(share => {
                if (share) {
                    this.shareheadShare = share;
                }
            });
    }

}
