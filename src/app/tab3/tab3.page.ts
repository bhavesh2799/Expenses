import { HttpClient } from '@angular/common/http';
import { identifierModuleUrl } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  data:any;
  finalData:any=[];
parties:any[]=[[]];
party:any=[];
output=[];
amountTotal:number;
amount:any=[];
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
    }, 1500);
  }
  userData:any=[];

  constructor(private http:HttpClient,private afs:AngularFirestore) {
    
    console.log(window.location.href);

    console.log(atob(window.location.href.split('/tabs/')[1].split('/tab3')[0].split('%3D')[0]));
    this.userData.companyName=atob(window.location.href.split('/tabs/')[1].split('/tab3')[0].split('%3D')[0]).split('randomNameByMe')[0];
    this.isAdminFn(atob(window.location.href.split('/tabs/')[1].split('/tab3')[0].split('%3D')[0]).split('randomNameByMe')[1]);
    this.userData.email=atob(window.location.href.split('/tabs/')[1].split('/tab3')[0].split('%3D')[0]).split('randomNameByMe')[2];
    this.userData.password=atob(window.location.href.split('/tabs/')[1].split('/tab3')[0].split('%3D')[0]).split('randomNameByMe')[3];
    console.log('Company Name: ',this.userData.companyName);
      console.log('Is Admin: ', this.userData.isAdmin);
      console.log('User Email: ',this.userData.email);
      console.log('User Password: ',this.userData.password);
  
      console.log(this.userData)
    
    
    
  }
  ngOnInit(){
    this.receiverFirebase();
  }
 
  spreadsheetId="1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE";
  range="A2:AC"
  API_KEY="AIzaSyDz6iwLxD6LWoCrq86Nn8fKIjWTvmvtEWs"
    getSheet(){
      this.output=[];

      let j=0;
        let k=0;
        let l=0;
      this.http.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.range}?key=${this.API_KEY}`
      )
      .subscribe((res) => {
        
        console.log('Sheet : ', res);
        this.data=res['values'];
        for(let i=0;i<this.data.length;i++){
          if((this.userData.email == this.data[i][21]) &&((this.data[i][22].toUpperCase()=='SALE') || (this.data[i][22].toUpperCase()=='PURCHASE')) ){
            this.finalData[j]=this.data[i];
            j++;
          }

         
        }
        console.log('Final Data: ',this.finalData)
        this.http.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/AA2:AA?key=${this.API_KEY}`
        )
        .subscribe((res) => {
          console.log(res);
          var flags = [], l = res['values'].length, i;
for( i=0; i<l; i++) {
    if( flags[res['values'][i]]) continue;
    flags[res['values'][i]] = true;
    if(res['values'][i] !=''){
      this.output.push(res['values'][i]);

    }
}
console.log(this.output);
          
        })
        

        

        
    });}
    Tamount(party){
      var amount:number=0;
      for (let i=0;i<this.finalData.length;i++){
        if(this.finalData[i][26]== party){
          amount+=Number(this.finalData[i][27]);
        }
      }
      return amount
    }
    filteredData(party){
      var customData=[];
      let j=0;
      for (let i=0;i<this.finalData.length;i++){
        if(this.finalData[i][26]== party){
          customData[j]=this.finalData[i];
          j++;
        }
      }
      return customData;
    }

    receiverFirebase(){
      this.output=[];

      let userDoc = this.afs.firestore.collection(`invoices`);
      userDoc.get().then((querySnapshot) => { 
        this.finalData=[]
        let j = 0;
        
          
       
        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          if(this.userData.isAdmin){
            if ((doc.id.split('_')[0] == this.userData.companyName)  && ((doc.data()[22].toUpperCase()=='SALE') || (doc.data()[22].toUpperCase()=='PURCHASE'))){
              this.finalData[j]=doc.data()
              j++;
      }
          }
          else{
            if ((doc.id.split('_')[1] == this.userData.email) && (doc.data()[1] == this.userData.companyName) && ((doc.data()[22].toUpperCase()=='SALE') || (doc.data()[22].toUpperCase()=='PURCHASE'))){
              this.finalData[j]=doc.data()
              j++;
      }
          }
         
        })}).then(()=>{
          console.log(this.finalData)

          var flags = [], l = this.finalData.length, i;

          for( i=0; i<l; i++) {
            if( flags[this.finalData[i][26]]) continue;
            flags[this.finalData[i][26]] = true;
            if(this.finalData[i][26] !=''){
              this.output.push(this.finalData[i][26]);
        
            }
        }
        this.output.reverse();
        console.log(this.output);

        })
      }
}
