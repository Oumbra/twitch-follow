import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AsyncImageComponent } from './components/async-image/async-image.component';
import { StreamerComponent } from './components/streamer/streamer.component';

import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';
import { NgxSpinnerModule } from 'ngx-spinner';

const MAT_MODULES = [
  MatCardModule,
  MatMenuModule,
  MatIconModule,
  MatToolbarModule,
  MatGridListModule,
  MatButtonModule,
  MatInputModule,
  MatProgressSpinnerModule,
];

@NgModule({
  declarations: [
    AppComponent,
    AsyncImageComponent,
    StreamerComponent,
    MainViewComponent,
    AdditionViewComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,    
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    ...MAT_MODULES,
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }