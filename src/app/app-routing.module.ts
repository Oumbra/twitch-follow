import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ERoute } from './enums/route.enums';
import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';
import { SettingsViewComponent } from './views/settings/settings-view.component';


const routes: Routes = [
    { 
        path: '', 
        pathMatch: 'full',
        redirectTo: ERoute.MAIN,
    },
    {
        path: ERoute.MAIN,
        component: MainViewComponent,
        data: {
            animation: 'MainView'
        },
    },
    {
        path: ERoute.ADDITION,
        component: AdditionViewComponent,
        data: {
            animation: 'AdditionView'
        },
    },
    {
        path: ERoute.SETTINGS,
        component: SettingsViewComponent,
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}