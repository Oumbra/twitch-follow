import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';


const routes: Routes = [
    { 
        path: '', 
        pathMatch: 'full',
        redirectTo: 'main'
    },
    {
        path: 'main',
        component: MainViewComponent,
        data: {
            animation: 'MainView'
        },
    },
    {
        path: 'addition',
        component: AdditionViewComponent,
        data: {
            animation: 'AdditionView'
        },
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}