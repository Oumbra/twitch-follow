import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatGridListModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatRippleModule, MatSnackBarModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsyncImageComponent } from './components/async-image/async-image.component';
import { BasicToastComponent } from './components/basic-toast/basic-toast.component';
import { StreamerComponent } from './components/streamer/streamer.component';
import { AdditionViewComponent } from './views/addition/addition-view.component';
import { MainViewComponent } from './views/main/main-view.component';



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
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,    
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    ...MAT_MODULES,
  ],
  declarations: [
    AppComponent,
    AsyncImageComponent,
    StreamerComponent,
    BasicToastComponent,
    MainViewComponent,
    AdditionViewComponent,
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
