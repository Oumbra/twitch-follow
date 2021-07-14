import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { BasicToastComponent } from "../components/basic-toast/basic-toast.component";

type level = 'info' | 'warn' | 'success' | 'error';

@Injectable({
    providedIn: 'root',
})
export class ToastService {

    constructor(private snackbar: MatSnackBar) {}

    info(message: string): void {
        this.showToast(message, 'info');
    }

    warn(message: string): void {
        this.showToast(message, 'warn');
    }
    
    success(message: string): void {
        this.showToast(message, 'success');
    }
    
    error(message: string): void {
        this.showToast(message, 'error');
    }

    private showToast(message: string, level: level): void {
        this.snackbar.openFromComponent(BasicToastComponent, {
            data: message,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            duration: 5000,
            panelClass: `mat-snack-bar-container--${level}`,
        });
    }

}