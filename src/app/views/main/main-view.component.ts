import { Component, OnInit } from '@angular/core';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent implements OnInit {

    list: any[] = [];

    constructor() { }

    ngOnInit() { 
        this.list.push({
            name: "mistermv",
            status: true,
            logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/5c8624bb-58df-4152-bde9-158487049a5f-profile_image-70x70.png",
        });
        this.list.push({
            name: "varrgas_live",
            status: true,
            logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/5eca61fb-31b3-4815-9639-476f76ece579-profile_image-70x70.png",
        });
    }

}