import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {File,FileEntry} from "@ionic-native/file/ngx";
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { DatePicker } from '@ionic-native/date-picker/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import {AuthService} from './services/auth.service';
import {environment} from '../environments/environment.prod';
import {AuthGuard} from './guards/auth.guard';
import { HttpClientModule } from "@angular/common/http";
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {OAuth2Client} from '@byteowls/capacitor-oauth2';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,IonicSelectableModule, AngularFireAuthModule,HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),AngularFireStorageModule,
    AngularFirestoreModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [AuthService,  DatePicker,  AuthGuard,GooglePlus,File, InAppBrowser,Camera,
    { provide: RouteReuseStrategy,useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
