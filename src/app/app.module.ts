import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatRippleModule, MatSlideToggleModule, MatSnackBarModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsyncImageComponent } from './components/async-image/async-image.component';
import { BasicToastComponent } from './components/basic-toast/basic-toast.component';
import { PageComponent } from './components/page/page.component';
import { StreamerComponent } from './components/streamer/streamer.component';
import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';
import { SettingsViewComponent } from './views/settings/settings-view.component';


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
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
