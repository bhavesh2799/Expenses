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
  selector: 'app-companies',
  templateUrl: './companies.page.html',
  styleUrls: ['./companies.page.scss'],
})
export class CompaniesPage implements OnInit {

  ports: Port[];
  port: any;
  companyData:any = [];
  companiesData :any = [];
  


  userData:any = [];

 

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

    console.log(atob(window.location.href.split('/companies/')[1].split('%3D')[0]));

    this.userData.companyName = atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[0];
    this.isAdminFn(atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[1]);
    this.userData.email = atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[2];
    this.userData.password = atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[3];
    this.userData.name = atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[4];
    this.isSuperAdminFn(atob(window.location.href.split('/companies/')[1].split('%3D')[0]).split('randomNameByMe')[5]);
   


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
    this.getCompanies();
  }
  getCompanies(){
    let i = 0;
    let userDoc = this.afs.firestore.collection(`companies`);
    userDoc.get().then((querySnapshot) => { 
      
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        this.companiesData[i] = doc.data();
        i=i+1;
        
     
  })
}).then(()=>{
  for(let j=0;j<this.companiesData.length;j++){
    this.items[j] = {expanded:false}
  }
})
}
modify(name, num, allowed){
  this.afs.collection('companies').doc(name).ref.get().then( (doc)=> {
    if (doc.exists) {
      console.log(doc.data());
      this.afs.collection('companies').doc(name).set({
        'userId': doc.data()['userId'],
            'name':doc.data()['name'],
            'email':doc.data()['email'],
            'createdAt':doc.data()['createdAt'],
            'numEmployees':num,
              
            'isAdmin': 'true',
            'password':doc.data()['password'],
            'isSuperAdmin':'false',
            'AllowedDocs':allowed
      })
}
  }).then(()=>{
    this.presentToast('Company Info Updated. Please refresh to review changes.','success');
  })
}
items :any = [];
expandItem(item): void {
  if (item.expanded) {
    item.expanded = false;
  } else {
    this.items.map(listItem => {
      if (item == listItem) {
        listItem.expanded = !listItem.expanded;
      } else {
        listItem.expanded = false;
      }
      return listItem;
    });
  }
}

doRefresh(event) {
  this.companiesData = [];

  console.log('Begin async operation');
  this.getCompanies();


  setTimeout(() => {
    console.log('Async operation has ended');
    event.target.complete();
  }, 1500);
}
async presentToast(mss,color) {
  const toast = await this.toastr.create({
    message: mss,
    color:color,
    duration: 2000,
    position:'top'
  });
  toast.present();
}

}
