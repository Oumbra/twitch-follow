import { Component, Inject } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material";
import { AbstractComponent } from "../abstract.component";

@Component({
    selector: 'app-basic-toast',
    templateUrl: 'basic-toast.component.html',
    styleUrls  : ['./basic-toast.component.scss'],
})
export class BasicToastComponent extends AbstractComponent {

    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
                private sbRef: MatSnackBarRef<BasicToastComponent>){
        super();
    }

    close(): void {
        this.sbRef.dismiss();
    }
}