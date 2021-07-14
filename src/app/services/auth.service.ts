import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import {switchMap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  user$: Observable<User>;
  user: User;

  constructor(
    private afauth: AngularFireAuth,
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private router: Router,
    private toastr: ToastController
  ) { 
    this.user$ = this.afauth.authState.pipe(
      switchMap(user=>
        {
          if(user)
          {
            return this.afs.doc('users/${user.uid}').valueChanges();
          }
          else{
            return of(null);
          }
        })
    );


  }//end of constructor

  
  async login(email,pass){
    const loading = await this.loadingCtrl.create({
      message: 'Authenticating...',
      spinner: 'crescent',
      showBackdrop: true
    });
    loading.present();
    this.afauth.signInWithEmailAndPassword(email,pass).then((data)=>{
      if(!data.user.emailVerified)
      {
        loading.dismiss();
        this.toast('Please verify your email address!','danger');
        this.logout();
        this.afauth.signOut().then(()=>{
          this.router.navigate(['/login']);
        })
      }else{
        loading.dismiss();
        this.router.navigate([`/tabs/${btoa}`])
        

      }
    }).catch((error)=>{
      loading.dismiss();
      this.toast(error.message,'danger');
      this.router.navigate(['/login']);
    })
  }//end of login
  async searchable_loading(){
    const loading = await this.loadingCtrl.create({
      message: 'Wait...',
      spinner: 'crescent',
      showBackdrop: true
    });
    loading.present();
    
  }//end of searhable_loading
  async toast(message,status){
    const toast = await this.toastr.create({
      message: message,
      position: 'top',
      color: status,
      duration: 2000
    });
    toast.present();
    //end of toast
  }

  logout(){
    this.afauth.signOut().then(()=>{
      this.router.navigate(['/login']);
    })
  }
}
