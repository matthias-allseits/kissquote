import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-posi-detail-markable',
  templateUrl: './posi-detail-markable.component.html',
  styleUrls: ['./posi-detail-markable.component.scss']
})
export class PosiDetailMarkableComponent {

    @Input() key?: string;

    toggleMarking(): void
    {
        console.log('toggle ' + this.key);
    }
}
