import {Component, Input, OnInit} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {TranslationService} from "../../services/translation.service";


@Component({
  selector: 'app-dashboard-logbook',
  templateUrl: './dashboard-logbook.component.html',
  styleUrls: ['./dashboard-logbook.component.scss']
})
export class DashboardLogbookComponent implements OnInit {

    @Input() portfolio?: Portfolio;

    public logBook: any[] = [];
    public transactionsOnly = false;

    constructor(
        public tranService: TranslationService
    ) {
    }

    ngOnInit() {
        this.refreshLogbook();
    }

    getColspan(): number {
        if (screen.width < 400) {
            return 3;
        } else {
            return 4;
        }
    }

    toggleFilter(): void {
        this.transactionsOnly = !this.transactionsOnly;
        this.refreshLogbook();
    }

    private refreshLogbook(): void {
        this.logBook = [];
        if (this.portfolio) {
            let relevantPositions = this.portfolio.getActiveNonCashPositions();
            relevantPositions = relevantPositions.concat(this.portfolio?.getClosedNonCashPositions());
            relevantPositions?.forEach(position => {
                if (!this.transactionsOnly) {
                    position.logEntries.forEach(entry => {
                        entry.positionId = position.id;
                        if (position.share && position.share.shortname && position.share.name) {
                            if (screen.width < 400) {
                                entry.assetName = position.share.shortname;
                            } else {
                                entry.assetName = position.share.name;
                            }
                        }
                    });
                    this.logBook = this.logBook.concat(position.logEntries);
                }
                position.transactions.forEach(entry => {
                    entry.positionId = position.id;
                    if (position.share && position.share.shortname && position.share.name) {
                        if (screen.width < 400) {
                            entry.assetName = position.share.shortname;
                        } else {
                            entry.assetName = position.share.name;
                        }
                    }
                });
                this.logBook = this.logBook.concat(position.transactions);
            });
            this.logBook.sort((a, b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0));
            if (!this.transactionsOnly) {
                this.logBook = this.logBook.slice(0, 100);
            } else {
                this.logBook = this.logBook.slice(0, 50);
            }
            console.log(this.logBook);
        }
    }

}
