import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import {
  Plugins
} from '@capacitor/core';
import { AngularFirestore } from '@angular/fire/firestore';
const { App } = Plugins;

@Component({
  template: '<button (click)="onOAuthBtnClick()">Login with OAuth</button>' +
  '<button (click)="onOAuthRefreshBtnClick()">Refresh token</button>' +
  '<button (click)="onLogoutClick()">Logout OAuth</button>',
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
userinfo;
  companyName;
  name="lol";
  isAdmin:boolean=false;
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
  navigateRegister(){
    console.log('Button Pressed!')
    this.router.navigate(['/register/'+btoa(this.userinfo)]);
  }
  navigateCompanies(){
    console.log('Button Pressed!')
    this.router.navigate(['/companies/'+btoa(this.userinfo)]);
  }

  constructor(private http:HttpClient,private route: ActivatedRoute,private router:Router,private platform: Platform,
    private afs:AngularFirestore,
    private routerOutlet: IonRouterOutlet,) {
    this.route.params.subscribe(data => {
      this.userinfo=atob(data.id);

      

      console.log('Reaching to tabs: ',this.userinfo);
      this.companyName = this.userinfo.split('randomNameByMe')[0];
      this.isAdminFn(this.userinfo.split('randomNameByMe')[1]);
      this.name=this.userinfo.split('randomNameByMe')[4];
      console.log(atob(window.location.href.split('/tabs/')[1].split('%3D')[0]));
      this.userData.companyName=atob(window.location.href.split('/tabs/')[1].split('%3D')[0]).split('randomNameByMe')[0];
      this.isAdminFn(atob(window.location.href.split('/tabs/')[1].split('%3D')[0]).split('randomNameByMe')[1]);
      this.userData.email=atob(window.location.href.split('/tabs/')[1].split('%3D')[0]).split('randomNameByMe')[2];
      this.userData.password=atob(window.location.href.split('/tabs/')[1].split('%3D')[0]).split('randomNameByMe')[3];
      this.isSuperAdminFn(atob(window.location.href.split('/tabs/')[1].split('%3D')[0]).split('randomNameByMe')[5])
      this.getSheet();
      this.platform.backButton.subscribeWithPriority(10, () => {
        if (!this.routerOutlet.canGoBack()) {
          App.exitApp();
        }
      });
      // this.backButtonSub = this.platform.backButton.subscribeWithPriority(
      //   10000,
      //   () => {}
      // );





    
    });


  }
  refreshToken: string;

    onOAuthBtnClick() {
        Plugins.OAuth2Client.authenticate(
            this.oauth2Options
        ).then(response => {
            let accessToken = response["access_token"];
            this.refreshToken = response["refresh_token"];

            // only if you include a resourceUrl protected user values are included in the response!
            let oauthUserId = response["id"];
            let name = response["name"];
            console.log("The oauth accesstoken, oauthuserid,name: ",accessToken,oauthUserId,name);

            // go to backend
        }).catch(reason => {
            console.error("OAuth rejected", reason);
        });
    }

    // Refreshing tokens only works on iOS/Android for now
    // onOAuthRefreshBtnClick() {
    //   if (!this.refreshToken) {
    //     console.error("No refresh token found. Log in with OAuth first.");
    //   }

    //   Plugins.OAuth2Client.refreshToken(
    //     oauth2RefreshOptions
    //   ).then(response => {
    //     let accessToken = response["access_token"];
    //     // Don't forget to store the new refresh token as well!
    //     this.refreshToken = response["refresh_token"];
    //     // Go to backend
    //   }).catch(reason => {
    //       console.error("Refreshing token failed", reason);
    //   });
    // }

    spreadsheetId="1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE";
range="A1:AC"
API_KEY="AIzaSyDz6iwLxD6LWoCrq86Nn8fKIjWTvmvtEWs"
data:any=[];userData:any=[];finalDataTotal:any=[];finalDataUnreadable:any=[];finalDataProcessed:any=[];finalDataRaw:any=[];
  getSheet(){
    let userDoc = this.afs.firestore.collection(`invoices`);
    userDoc.get().then((querySnapshot) => { 
      this.data = [];
    
      let i = 0;
      
        
     
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        if(this.userData.isAdmin){
          if ((doc.id.split('_')[0] == this.userData.companyName)  ){
            this.data[i]=doc.data()
            i++;
    }
        }
        else{
          if ((doc.id.split('_')[1] == this.userData.email)  ){
            this.data[i]=doc.data()
            i++;
    }
        }
        
      })}).then(() => {
      let j=0,k=0,l=0,m=0;
      console.log(this.data,this.data[0][21]);
      for(let i=0;i<this.data.length;i++){
        if((this.userData.email == this.data[i][21])){
          this.finalDataTotal[j]=this.data[i];
          j++;
        }
        if((this.data[i][22].toUpperCase()=="UNREADABLE")){
          this.finalDataUnreadable[k]=this.data[i];
          k++;
        }
        if(((this.data[i][22].toUpperCase()!="RAW") && (this.data[i][22].toUpperCase()!="UNREADABLE"))){
          this.finalDataProcessed[m]=this.data[i];
          m++;
        }
        if((this.data[i][22].toUpperCase()=="RAW")){
          this.finalDataRaw[l]=this.data[i];
          l++;
        }
        console.log('Total: ',this.finalDataTotal);
        console.log('Raw: ',this.finalDataRaw);
        console.log('Unreadable: ',this.finalDataUnreadable);


      }

      
      
  });}

    onLogoutClick() {
            Plugins.OAuth2Client.logout(
                this.oauth2Options
            ).then(() => {
                // do something
            }).catch(reason => {
                console.error("OAuth logout failed", reason);
            });
        }
oauth2Options={
  authorizationBaseUrl: "https://accounts.google.com/o/oauth2/auth",
  accessTokenEndpoint: "https://www.googleapis.com/oauth2/v4/token",
  scope: "email profile",
  resourceUrl: "https://www.googleapis.com/userinfo/v2/me",
  web: {
    appId: "1:173748306826:web:25d9e8801ecd7e695afe73",
    responseType: "token", // implicit flow
    accessTokenEndpoint: "", // clear the tokenEndpoint as we know that implicit flow gets the accessToken from the authorizationRequest
    redirectUrl: "http://localhost:4200",
    windowOptions: "height=600,left=0,top=0"
  },
  android: {
    appId: "1:173748306826:android:15ece5f01b1769455afe73",
    responseType: "code", // if you configured a android app in google dev console the value must be "code"
    redirectUrl: "com.expenses.aarc:/" // package name from google dev console
  },
  
}


}
