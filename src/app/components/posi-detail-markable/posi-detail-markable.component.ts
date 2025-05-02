import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-posi-detail-markable',
  templateUrl: './posi-detail-markable.component.html',
  styleUrls: ['./posi-detail-markable.component.scss']
})
export class PosiDetailMarkableComponent implements OnInit, OnChanges {

    @Input() key?: string;
    @Input() markedLines?: string[];

    public marked = false;

    ngOnInit(): void {
        if (this.key && this.markedLines && this.markedLines.indexOf(this.key) > -1) {
            this.marked = true;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changed: ', this.key);
        console.log('changed: ', this.markedLines);
        if (this.key && this.markedLines && this.markedLines.indexOf(this.key) > -1) {
            this.marked = true;
        }
    }

    toggleMarking(): void
    {
        console.log('toggle ' + this.key);
    }
}
