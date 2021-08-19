import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material";
import { BasicToastComponent } from "../components/basic-toast/basic-toast.component";

type level = 'info' | 'warn' | 'success' | 'error';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    readonly DEFAULT_OPTS: any = {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        duration: 2000,
    }

    constructor(private snackbar: MatSnackBar) {}

    info(message: string, opts?: MatSnackBarConfig): void {
        this.showToast(message, 'info', opts);
    }

    warn(message: string, opts?: MatSnackBarConfig): void {
        this.showToast(message, 'warn', opts);
    }
    
    success(message: string, opts?: MatSnackBarConfig): void {
        this.showToast(message, 'success', opts);
    }
    
    error(message: string, opts?: MatSnackBarConfig): void {
        this.showToast(message, 'error', opts);
    }

    private showToast(message: string, level: level, opts: MatSnackBarConfig): void {
        ;
        this.snackbar.openFromComponent(BasicToastComponent, {
            ...this.DEFAULT_OPTS,
            data: message,
            panelClass: `mat-snack-bar-container--${level}`,
            ...opts
        });
    }

}