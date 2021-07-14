import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
// import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password:string;
  menuCtrl: any;

  constructor(
    private router: Router,
    // private auth: AuthService,
    private afs: AngularFirestore,
    private afauth:AngularFireAuth,

    private toastr: ToastController,
    private loadingCtrl: LoadingController,
    private navCrtl: NavController, private menu: MenuController

  ) {
    // the left menu should be disabled on the login page
  }
  logout(){
    this.afauth.signOut().then(()=>{
      this.router.navigate(['/login']);
    })
  }

  

  ngOnInit() {
  }
  userinfo;
  store;
  register(){
    this.router.navigate(['/register']);
  }//end of register
  forgot(){
    this.router.navigate(['/forgot-password']);
  }//end of forgot
 

  async login(){
    if(this.email && this.password){
      const loading = await this.loadingCtrl.create({
        message:'Logging in...',
        spinner:'crescent',
        showBackdrop:true
      });
      loading.present();
      this.afauth.signInWithEmailAndPassword(this.email,this.password).then(async (data)=>{
        if(!data.user.emailVerified)
        {
          (await this.afauth.currentUser).sendEmailVerification()
          loading.dismiss();
          this.toast('Please verify your email address. A verification mail is sent to your email address!','danger');
          this.logout();
          this.afauth.signOut().then(()=>{
            this.router.navigate(['/login']);
          })   }
          else{    
           let userDoc = this.afs.firestore.collection(`users`);
    userDoc.get().then((querySnapshot) => { 
      this.userinfo=[];
      this.store=[];
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        if ((doc.data().email == this.email)){
          const store = doc.data();
          this.userinfo = store.companyName+'randomNameByMe'+store.isAdmin+'randomNameByMe'+store.email+'randomNameByMe'+this.password+'randomNameByMe'+store.name+'randomNameByMe'+store.isSuperAdmin;
          console.log(this.userinfo);
          console.log('just before routing from login: ',btoa(this.userinfo))
          this.router.navigate([`/tabs/${btoa(this.userinfo)}`]);
          this.toast('Login Success!','success')

            loading.dismiss();

          
          
          

          

        }
        
       
      
      })
        

       

      })}


      
        // the left menu should be disabled on the login page

      
    }).catch((error)=>{
      loading.dismiss();
      this.toast(error.message,'danger');
      this.router.navigate(['/login']);
    });
    }
    else{
      this.toast('Please enter your email and password correctly!','danger');
    }
  }//end of login
  async toast(message,status){
    const toast = await this.toastr.create({
      message:message,
      position:'top',
      color:status,
      duration:2000
    });
    toast.present()
  }//end of toast
  async loginCompany(){
    if(this.email && this.password){
      const loading = await this.loadingCtrl.create({
        message:'Logging in...',
        spinner:'crescent',
        showBackdrop:true
      });
      loading.present();
      this.afauth.signInWithEmailAndPassword(this.email,this.password).then((data)=>{
        if(!data.user.emailVerified)
        {
          data.user.sendEmailVerification();
          loading.dismiss();
          this.toast('Please verify your email address. A verification mail has been sent to the registered email address!','danger');
          this.logout();
          this.afauth.signOut().then(()=>{
            this.router.navigate(['/login']);
          })   }
          else{    
           let userDoc = this.afs.firestore.collection(`companies`);
    userDoc.get().then((querySnapshot) => { 
      this.userinfo=[];
      this.store=[];
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        if ((doc.data().email == this.email)){
          const store = doc.data();
          this.userinfo = store.name+'randomNameByMe'+store.isAdmin+'randomNameByMe'+store.email+'randomNameByMe'+this.password+'randomNameByMe'+store.name+'randomNameByMe'+store.isSuperAdmin;

        }
        
        
        
       
      
      })
        

       

      }).then(()=>{
        if(this.userinfo){
          
            console.log(this.userinfo);
            console.log('just before routing from login: ',btoa(this.userinfo))
            this.router.navigate([`/tabs/${btoa(this.userinfo)}`]);
            this.toast('Login Success!','success')
  
              loading.dismiss();
          
      }})
    }


      
        // the left menu should be disabled on the login page

      
    }).catch((error)=>{
      loading.dismiss();
      this.toast(error.message,'danger');
      this.router.navigate(['/login']);
    });
    }
    else{
      this.toast('Please enter your email and password correctly!','danger');
    }
  }


}
