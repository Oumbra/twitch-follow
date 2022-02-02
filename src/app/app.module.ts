import { HttpClientModule } from '@angular/common/http';
import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatRippleModule, MatSlideToggleModule, MatSnackBarModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgPipesModule } from 'angular-pipes';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsyncImageComponent } from './components/async-image/async-image.component';
import { BasicToastComponent } from './components/basic-toast/basic-toast.component';
import { PageComponent } from './components/page/page.component';
import { StreamerComponent } from './components/streamer/streamer.component';
import { BouchonApi, IExtensionApi } from './models/local-storage';
import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';
import { SettingsViewComponent } from './views/settings/settings-view.component';

export const API_OBJECT = new InjectionToken<IExtensionApi>('ApiObject');
export const WINDOW_OPENNER = new InjectionToken<Subject<boolean>>('WindowOpenner');
export const DARK_MODE = new InjectionToken<Subject<boolean>>('DarkMode');

const MAT_MODULES = [
  MatCardModule,
  MatMenuModule,
  MatIconModule,
  MatToolbarModule,
  MatGridListModule,
  MatButtonModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatSlideToggleModule,
];

const VIEWS = [
  MainViewComponent,
  AdditionViewComponent,
  SettingsViewComponent,
];

const COMPONENTS = [
  AsyncImageComponent,
  StreamerComponent,
  BasicToastComponent,
  PageComponent,
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,    
    NgxSpinnerModule,
    NgPipesModule,
    ...MAT_MODULES,
  ],
  declarations: [
    AppComponent,
    ...VIEWS,
    ...COMPONENTS,
  ],
  entryComponents: [
    BasicToastComponent,
  ],
  providers: [
    { provide: API_OBJECT, useValue: window.hasOwnProperty('chrome') && window['chrome'].hasOwnProperty('storage') ? window['chrome']
                                    : window.hasOwnProperty('browser') ? window['browser']
                                    : new BouchonApi() },
    { provide: WINDOW_OPENNER, useValue: new BehaviorSubject(false)},
    { provide: DARK_MODE, useValue: new BehaviorSubject(false)},
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}