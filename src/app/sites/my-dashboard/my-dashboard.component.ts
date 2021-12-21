import {Component, OnInit} from '@angular/core';


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    public myKey: string;

    constructor() {
    }

    ngOnInit(): void {
        this.myKey = localStorage.getItem('my-key');
        document.getElementById('dashboard-anchor').innerHTML = this.myKey;
    }

}
