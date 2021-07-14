import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';

class Port {
  public id: number;
  public name: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordMatch: boolean;
  companyName: any="";
  ports: Port[];
  port: any;
  companyData:any = [];
  
  isCompany:string='false'


  userData:any = [];
  userLocation:any = [];
  companyRadius:number=0;

  employeeCompanyName='';
 

  constructor(
    private afs: AngularFirestore,
    private afauth: AngularFireAuth,
    private loadingCtrl: LoadingController,
    private toastr: ToastController,
    private router: Router,
    private navCrtl: NavController, private menu: MenuController

  ) {     this.menu.enable(false);
    this.ports = [
      { id: 1, name: 'Bank Statement' },
      { id: 2, name: 'Purchase Invoice' },
      { id: 3, name: 'Fix Asset Invoice' },
      { id: 4, name: 'DSR Asset' },
      { id: 5, name: 'Stock Usage Sheet' },
      { id: 6, name: 'Cash Purchase' },
      { id: 7, name: 'Petrol Expenses' },
      { id: 8, name: 'Water Expenses' },
      { id: 9, name: 'Electricity Expenses' },
      { id: 10, name: 'Packing Expenses' },
      { id: 11, name: 'Disposables' },
      { id: 12, name: 'Stationary' },
      { id: 13, name: 'Transportation' },
      { id: 14, name: 'Cleaning Material Expenses' },
      { id: 15, name: 'Maintenance' },
      { id: 16, name: 'Telephone Expenses' },
      { id: 17, name: 'Salary' },
      { id: 18, name: 'Credit Card' },
      { id: 19, name: 'Subscriptions' },
      { id: 20, name: 'Dry Cleaning' },
      { id: 21, name: 'Miscellaneous' },
      { id: 22, name: 'Vehicle Repair and Maintenance' },
      { id: 23, name: 'Royalty' },
      { id: 24, name: 'Rent' },

    ];
    console.log(window.location.href);

    console.log(atob(window.location.href.split('/register/')[1].split('%3D')[0]));

    this.userData.companyName = atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[0];
    this.isAdminFn(atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[1]);
    this.userData.email = atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[2];
    this.userData.password = atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[3];
    this.userData.name = atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[4];
    this.isSuperAdminFn(atob(window.location.href.split('/register/')[1].split('%3D')[0]).split('randomNameByMe')[5]);
   


  }
  isAdminFn(val){
    if(val == "true"){
      this.userData.isAdmin= true;
    }
    else{
      this.userData.isAdmin= false;
    }
  }
  isSuperAdminFn(val){
    if(val == "true"){
      this.userData.isSuperAdmin= true;
    }
    else{
      this.userData.isSuperAdmin= false;
    }
  }

  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
  }


  ngOnInit() {
  }
  
  
  async register(){
    if(this.name && this.email && this.password){
      const loading = await this.loadingCtrl.create({
        message:'loading...',
        spinner: 'crescent',
        showBackdrop: true
      });
      loading.present();
      let i = 0;
      let userDoc = this.afs.firestore.collection(`users`);
    userDoc.get().then((querySnapshot) => { 
      
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        if ((doc.data().companyName == this.userData.companyName)){
          i=i+1;

        }})}).then(()=>{
          this.afs.collection('companies').doc(this.userData.companyName.toUpperCase()).ref.get().then( (doc)=> {
            if (doc.exists) {
              console.log(doc.data());
              if(i <= doc.data()['numEmployees']){
      this.afauth.createUserWithEmailAndPassword(this.email,this.password).then((data)=>{
        this.afs.collection('users').doc(this.email).set({
          'userId': data.user.uid,
          'name':this.name,
          'email':this.email,
          'createdAt':Date.now(),
          'isAdmin': "false",
          'isSuperAdmin':'false',
          'companyName':this.userData.companyName.toUpperCase(),
          'password':this.password,
        });
        data.user.sendEmailVerification();
      }).then(()=>{
        console.log('success');
        this.name='';
        this.email='';
        this.password='';
        this.confirmPassword='';
        loading.dismiss();
        this.toast("Registration Success! A verification mail has been sent to user's email address.",'success');
      }).catch((error)=>{
        loading.dismiss();
        this.toast(error.message,'danger');

      })
    
      
              }
    else{
      this.toast('Maximum Employees Limit Reached. Contact FIRMSAP for increasing the limit.','warning');
      loading.dismiss();

    }
            }
            else{
              this.toast('Company name is not Registered or Wrong!','danger');
              loading.dismiss();

            }
          })
          
 //end of register
    })}
        
   
  

   
    
    }
 
    checkPasswordCompany(){
      if (this.companyData.password == this.companyData.confirmPassword){
        this.passwordMatch = true;
      }
      else{
        this.passwordMatch=false;
      }
    }
    async registerCompany(){
      if(this.companyData.name && this.companyData.email && this.companyData.password){
        const loading = await this.loadingCtrl.create({
          message:'loading...',
          spinner: 'crescent',
          showBackdrop: true
        });
        loading.present();
        this.afauth.createUserWithEmailAndPassword(this.companyData.email,this.companyData.password).then((data)=>{
          this.afs.collection('companies').doc(this.companyData.name.toUpperCase()).set({
            'userId': data.user.uid,
            'name':this.companyData.name.toUpperCase(),
            'email':this.companyData.email,
            'createdAt':Date.now(),
            'numEmployees':this.companyData.maxEmployees,
              
            'isAdmin': 'true',
            'password':this.companyData.password,
            'isSuperAdmin':'false',
            'AllowedDocs':this.port

          });
          data.user.sendEmailVerification();
        }).then(()=>{
          
          console.log('success');
          loading.dismiss();
          this.toast("Registration Success! A verification mail has been sent to company's email address.",'success');
          this.companyData.name='';
          this.companyData.email='';
          this.companyData.maxEmployees=0;
          this.companyData.password='';
          this.companyData.confirmPassword='';
          this.port = [];
          
        }).catch((error)=>{
          loading.dismiss();
          this.toast(error.message,'danger');
  
        })
      
        
      }
      else{
        this.toast('Please fill in the form!','danger');
      }//end of register
  
  
     
      
      }
  
    async toast(message,status){
      const toast = await this.toastr.create({
        message:message,
        position:'top',
        color: status,
        duration:2000
      });
      toast.present();
  
  }//end of toast


  checkPassword(){
    if (this.password == this.confirmPassword){
      this.passwordMatch = true;
    }
    else{
      this.passwordMatch=false;
    }
  }
  redirectLogin(){
    this.router.navigate(['/login']);
  }//end of register
  resendEmail='';

 
}
  
