import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoadChildren, Router } from '@angular/router';
import { LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  email:string;

  constructor(
    private afauth: AngularFireAuth,
    private toastr: ToastController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private navCrtl: NavController, private menu: MenuController


  ) {    this.menu.enable(false);
  }

  ngOnInit() {
  }

  async resetPassword(){
    if(this.email){
      const loading = await this.loadingCtrl.create({
        message: 'Please wait...',
        spinner: 'crescent',
        showBackdrop: true
      });
      loading.present();
      this.afauth.sendPasswordResetEmail(this.email).then(()=>{
        loading.dismiss();
        this.toast('Reset Link Sent. Please check your email inbox','success');
        this.router.navigate(['/login']);
      }).catch((error)=>{
        loading.dismiss();
        this.toast(error.message,'danger');
      });
    }
    else{
      this.toast('Please enter your email address!','danger');
    }
    
  }//end of resetPassword

  async toast(message,status){
    const toast = await this.toastr.create({
      message:message,
      position:'top',
      color: status,
      duration:2000
    });
    toast.present();

}//end of toast

redirectLogin(){
  this.router.navigate(['/login']);
}//end of register
}
