import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  data:any;
  finalData:any=[];
  userData:any=[];
  docType='';
  isAdminFn(val){
    if(val == "true"){
      this.userData.isAdmin = true;
    }
    else{
      this.userData.isAdmin = false;

    }
    
  }
  doRefresh(event) {
    console.log('Begin async operation');
    this.receiverFirebase();


    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }


  constructor(private http:HttpClient,private afs:AngularFirestore) { 
    console.log(window.location.href);

    console.log(atob(window.location.href.split('/tabs/')[1].split('/tab5')[0].split('%3D')[0]));
    this.userData.companyName=atob(window.location.href.split('/tabs/')[1].split('/tab5')[0].split('%3D')[0]).split('randomNameByMe')[0];
    this.isAdminFn(atob(window.location.href.split('/tabs/')[1].split('/tab5')[0].split('%3D')[0]).split('randomNameByMe')[1]);
    this.userData.email=atob(window.location.href.split('/tabs/')[1].split('/tab5')[0].split('%3D')[0]).split('randomNameByMe')[2];
    this.userData.password=atob(window.location.href.split('/tabs/')[1].split('/tab5')[0].split('%3D')[0]).split('randomNameByMe')[3];
    console.log('Company Name: ',this.userData.companyName);
      console.log('Is Admin: ', this.userData.isAdmin);
      console.log('User Email: ',this.userData.email);
      console.log('User Password: ',this.userData.password);
  
      console.log(this.userData)
    
    
  }

  ngOnInit() {
    this.receiverFirebase();
  }

  spreadsheetId="1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE";
  range="A1:AC"
  API_KEY="AIzaSyDz6iwLxD6LWoCrq86Nn8fKIjWTvmvtEWs"
  getSheet(){
    this.finalData=[];

    this.http.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.range}?key=${this.API_KEY}`
    )
    .subscribe((res) => {
      let j=0;
      console.log('Sheet : ', res['values']);
      this.data=res['values'];
      for(let i=0;i<this.data.length;i++){
        if((this.userData.email == this.data[i][21])&&((this.data[i][22].toUpperCase()!='RAW'))&&((this.data[i][22].toUpperCase()!='UNREADABLE'))&&((this.data[i][22].toUpperCase()!='SALE'))&&((this.data[i][22].toUpperCase()!='PURCHASE'))){
          this.finalData[j]=this.data[i];
          j++;
        }
        this.finalData.reverse();
      }
      console.log(this.finalData);
      
  });}
  receiverFirebase(){
    let userDoc = this.afs.firestore.collection(`invoices`);
    userDoc.get().then((querySnapshot) => { 
      this.finalData=[]
      let j = 0;
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        if(this.userData.isAdmin){
          if ((doc.id.split('_')[0] == this.userData.companyName) && ((doc.data()[22].toUpperCase()!='UNREADABLE'))&&((doc.data()[22].toUpperCase()!='SALE'))&& (doc.data()[22].toUpperCase()!='RAW')&&((doc.data()[22].toUpperCase()!='PURCHASE'))){
            this.finalData[j]=doc.data()
            j++;
    }
        }
        else{
          if ((doc.id.split('_')[1] == this.userData.email)  && ((doc.data()[22].toUpperCase()!='UNREADABLE'))&&((doc.data()[22].toUpperCase()!='SALE'))&& (doc.data()[22].toUpperCase()!='RAW')&&((doc.data()[22].toUpperCase()!='PURCHASE'))){
            this.finalData[j]=doc.data()
            j++;
    }
        }
        
      })}).then(()=>{
        this.finalData.reverse();

      })

    }


}
