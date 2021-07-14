import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { File,FileEntry } from '@ionic-native/file/ngx';
import { CameraResultType, CameraSource } from '@capacitor/core';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx'

import {
  Plugins
} from '@capacitor/core';

// import * as fs from 'fs';
// import * as readline from 'readline';
import { ActionSheetController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { IonicSelectableComponent } from 'ionic-selectable';
// const {google} = require('googleapis');
// const fs = require('fs');
// const readline = require('readline');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

class Port {
  public id: number;
  public name: string;
}

@Component({
  template: '<button (click)="onOAuthBtnClick()">Login with OAuth</button>' +
  '<button (click)="onOAuthRefreshBtnClick()">Refresh token</button>' +
  '<button (click)="onLogoutClick()">Logout OAuth</button>',
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  

})
export class Tab1Page implements OnInit{
  isPDF=false;isImage=false;
  imageUploaded=false;
  companyName="Legully Expenses Admin";
  ports: Port[];
  port: any;


uploadedImages:any=[false,false,false,false,false,false,false,false,false,false];

  isAdmin=false;
  sendData:any=[];


  files = [];
  uploadProgress = 0;
  urlPDF:any=null;
  UploadedPDF:any;
  url:any=null;
  urlImages:any=null;
  todo:any={
    dateToday: this.convert(new Date()),url:[],images:[]
  };
  dateToday = this.convert(new Date());
  ngOnInit(){
    this.clear();
  }
  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),

      day = ("0" + date.getDate()).slice(-2);
      console.log([date.getFullYear(), mnth, day].join("-"));
      
    return [day,mnth,date.getFullYear()].join("-");
  }
  doRefresh(event) {
    console.log('Begin async operation');
    this.clear();


    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1500);
  }
  clear(){
    this.todo={
      dateToday: this.convert(new Date()),images:[]

    }
    this.isPDF=false;
    this.isImage=false;
    this.uploadedImages=[false,false,false,false,false,false,false,false,false,false];

    
    this.uploadProgress=0;  
  }
  async logForm() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Submitting your form...',
      spinner:'circles',
    });
    // await loading.present();
    if(!this.todo.images){
      this.todo.images=[];

    }
   
    if (this.todo.expenseDoc){
      this.todo.amount='';
      this.todo.isExpenseDocument="YES";
      this.todo.recorded ="RECORDED";
    }
    else{
      this.todo.isExpenseDocument="NO"
    }
    if(this.isPDF){
      this.todo.pdfURL=this.todo.url;
    }
   
   
    this.todo.email = this.userData.email;
    this.todo.status = "RAW";
    this.todo.companyName=this.userData.companyName.toUpperCase();
    this.todo.unique_id = this.userData.companyName.toUpperCase()+'-'+String(Date.now());

    this.todo.date=this.todo.date.split('T')[0];
    console.log(this.todo);
    // this.sendPostRequest();
    this.uploadToFirebase(this.userData.companyName.toUpperCase()+'-'+String(Date.now()),this.todo.status);
    
    // Send data to google sheet here
    //Col1: Unique ID, Col2: Company, Col3: Expense Document, Col4: Narration, Col5: Amount, 
    //Col6: Document Type, Col7: Date of Document, Col8: Date of Submission,  Col9: PDF or Image, Col10: Doc(PDF)
    //Col11: No of Pages, Col12: Page1, Col13: Page2, Col14: Page3, Col15: Page4,
    //Col16: Page5, Col17:User Email, Col18: Status, Col19: Recorded
    this.sendData = [
      this.todo.unique_id,this.todo.companyName,this.todo.isExpenseDocument,this.todo.narration,this.todo.amount,
      this.todo.type,this.todo.date,this.todo.dateToday,this.todo.format,this.todo.pdfURL,
      this.todo.numImages,this.todo.images[0],this.todo.images[1],this.todo.images[2],this.todo.images[3],this.todo.images[4],
      this.todo.images[5],this.todo.images[6],this.todo.images[7],this.todo.images[8],this.todo.images[9],
      this.todo.email,this.todo.status,this.todo.recorded
    ];
    console.log('Final output: ',this.sendData, this.todo.images );

    // const toast = await this.toastCtrl.create({
    //   message:'Form under review!',
    //   duration:3000,
    //   position:'middle'
    // });
    // toast.present();
    // Set data to csv file
    
      
    

    // this.todo={
    //   dateToday: this.convert(new Date()),images:[]

    // }
    // this.uploadProgress=0;
    // this.isPDF=false;
    // this.isImage=false;
    // loading.dismiss();

  }
 


  
   
     
  segmentChanged2(ev: any) {
    // console.log('Segment changed', ev);
    if (ev.detail.value =="PDF"){
      this.isPDF=true;
      this.isImage=false;
    }
    else if (ev.detail.value == "Image"){
      this.isImage = true;
      this.isPDF=false;
    }
    else{
      this.isImage=false;
      this.isPDF=false;
    }
    
  }
  async uploadFile(f: FileEntry) {
    alert(f.fullPath);
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
    alert(path);
    const type = this.getMimeType(f.name.split('.').pop());
    const buffer = await this.file.readAsArrayBuffer(path, f.name);
    const fileBlob = new Blob([buffer], type);
 
    const randomId = Math.random()
      .toString(36)
      .substring(2, 8);
 
    const uploadTask = this.storage.upload(
      `files/${new Date().getTime()}_${randomId}`,
      fileBlob
    );
 
    uploadTask.percentageChanges().subscribe(change => {
      this.uploadProgress = change;
    });
 
    uploadTask.then(async res => {
      const toast = await this.toastCtrl.create({
        duration: 3000,
        message: 'File upload finished!',
        position:'middle'
      });
      toast.present();
    });
  }
 
  getMimeType(fileExt) {
    if (fileExt == 'pdf') return { type: 'application/pdf' };

    else if (fileExt == 'jpg') return { type: 'image/jpg' };
  }

userData:any=[];
isAdminFn(val){
  if(val == "true"){
    this.userData.isAdmin= true;
  }
  else{
    this.userData.isAdmin= false;
  }
}
routerData:any='';
  constructor(private datePicker: DatePicker,  private loadingCtrl:LoadingController,
   
    private file: File,private afauth:AngularFireAuth,private afs: AngularFirestore,
    // ,
    private actionSheetController: ActionSheetController,
    private plt: Platform,
    private toastCtrl: ToastController,  private storage: AngularFireStorage,
    private http:HttpClient,private googlePlus: GooglePlus,private camera: Camera
    ) {
      console.log(window.location.href);
 
      this.routerData = window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0];

     
      console.log(atob(window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0]));
      this.userData.companyName=atob(window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0]).split('randomNameByMe')[0];
      this.isAdminFn(atob(window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0]).split('randomNameByMe')[1]);
      this.userData.email=atob(window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0]).split('randomNameByMe')[2];
      this.userData.password=atob(window.location.href.split('/tabs/')[1].split('/tab1')[0].split('%3D')[0]).split('randomNameByMe')[3];
 console.log('Company Name: ',this.userData.companyName);
      console.log('Is Admin: ', this.userData.isAdmin);
      console.log('User Email: ',this.userData.email);
      console.log('User Password: ',this.userData.password);
  
      console.log(this.userData)
      let userDoc = this.afs.firestore.collection(`companies`);
      userDoc.get().then((querySnapshot) => { 
        
        
          
       
        querySnapshot.forEach((doc) => {
          if((doc.id == this.userData.companyName) || (doc.id == this.userData.name) ){
            if(doc.data()['AllowedDocs']){
              this.ports = doc.data()['AllowedDocs'];
            }
            else{
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
            }
          }
          
        })
      })
    }
    portChange(event: {
      component: IonicSelectableComponent,
      value: any
    }) {
      console.log('port:', event.value);
    }
  
    

  pickDate(){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date =>{ console.log('Got date: ', date);return date},
      err => console.log('Error occurred while getting date: ', err)
    );
  }
  

  yourImageDataURL;
  loadPdfFromDevice(event) {
    this.todo.url='';
    this.todo.images=[];

    const file = event.target.files[0];
    console.log(file);
    this.reader = new FileReader();
  
    if(this.plt.is('android')){
      const filereader = new FileReader();
      this.reader = (filereader as any)._realReader;
    }
    
  
    this.reader.readAsArrayBuffer(file);
        this.reader.onload = async () => {
  
      // get the blob of the image:
      let blob: Blob = new Blob([new Uint8Array((this.reader.result as ArrayBuffer))],{type:'application/pdf'});
      // create blobURL, such that we could use it in an image element:
      
      const randomId = Math.random()
      .toString(36)
      .substring(2, 8);
      let date=new Date().getTime();
      const loading = await this.loadingCtrl.create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
        spinner:'circles',
      });
      await loading.present();
 
    const uploadTask = this.storage.upload(
      `files/${date}_pdf`,
      blob
    );
   

    uploadTask.percentageChanges().subscribe(change => {
      this.uploadProgress = change;
    });
 
    uploadTask.then(async res => {
      loading.dismiss();
      this.todo.url=`https://firebasestorage.googleapis.com/v0/b/legully-expense-app.appspot.com/o/files%2F${date}_pdf?alt=media&token=38133089-1be1-4eda-b056-2d862a483836`

      
    });
    console.log("https://firebasestorage.googleapis.com/v0/b/legully-expense-app.appspot.com/o/files%2F1615051902141_image_2?alt=media&token=38133089-1be1-4eda-b056-2d862a483836")
  
  
    };
  
    this.reader.onerror = (error) => {
  
      //handle errors https://firebasestorage.googleapis.com/v0/b/legully-expense-app.appspot.com/o/files%2F1615195549857_pdf?alt=media&token=38133089-1be1-4eda-b056-2d862a483836
  
    };
  };
  reader:any = new FileReader();
async loadImagesFromDevice(event,n) {
  this.todo.url='';


  const file = event.target.files[0];
  console.log(event.target.files[0])
  if(this.plt.is('android')){
    const filereader = new FileReader();
    this.reader = (filereader as any)._realReader;
  }
  else{
    this.reader = new FileReader();
  }

  
    // const reader = new FileReader();

  this.reader.readAsArrayBuffer(file);
      this.reader.onload = async () => {

    // get the blob of the image:
    let blob: Blob = new Blob([new Uint8Array((this.reader.result as ArrayBuffer))],{type:'image/jpg'});
    // create blobURL, such that we could use it in an image element:
    
    const randomId = Math.random()
    .toString(36)
    .substring(2, 8);
    let date = new Date().getTime()
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      spinner:'circles',
    });
    await loading.present();

  const uploadTask = this.storage.upload(
    `files/${date}_image_${n}`,
    blob
  );

  

  uploadTask.percentageChanges().subscribe(async change => {
    this.uploadProgress = change;
    
    
  });

// https://firebasestorage.googleapis.com/v0/b/expenses-aarc.appspot.com/o/files%2F1_image_1?alt=media&token=13a3a975-c542-47bd-91c3-18b8d7eb539b
  uploadTask.then(async res => {
    loading.dismiss();
    this.todo.images[n]=`https://firebasestorage.googleapis.com/v0/b/legully-expense-app.appspot.com/o/files%2F${date}_image_${n}?alt=media&token=38133089-1be1-4eda-b056-2d862a483836`

    
  });
}

  this.reader.onerror = (error) => {

    //handle errors

  };
};
spreadsheetId="1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE";
range="A1:D4"
API_KEY="AIzaSyDz6iwLxD6LWoCrq86Nn8fKIjWTvmvtEWs"

getSheet(){
//   this.http.get(
//     `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.range}?key=${this.API_KEY}`
//   )
//   .subscribe((res) => {
//     console.log('Sheet : ', res);
// })
}







////// SENDING DATA TO SHEETS API
ACCESS_TOKEN="";
REFRESH_TOKEN="1//04DvLfw2CQThCCgYIARAAGAQSNwF-L9IrilWADjAAdUZmN32vYDONTARY5y8q9LyOV1CbXg2asRVSshWDwVqXROy5KecqJuHx4-E"
authenticateUser(){
  this.http.get(
    `
    https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&prompt=consent&response_type=code&client_id=173748306826-l78q522250bbl21btqa7a9muahi5hkt6.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets&access_type=offline&flowName=GeneralOAuthFlow`  ).subscribe(res=>{
    console.log('Auth Data: ',res);
    alert(res);
});
}

sendPostRequest() {
  /// AUTHENTICATION OF CLIENT
  // this.http.get(
  //   `
  //   https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https://developers.google.com/oauthplayground&prompt=consent&response_type=code&client_id=173748306826-l78q522250bbl21btqa7a9muahi5hkt6.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/drive+https://www.googleapis.com/auth/drive.file+https://www.googleapis.com/auth/spreadsheets&access_type=offline
  //     `
  // ).subscribe(res=>{
  //   console.log('Auth Data: ',res);







    ////// SHEET API CALL
    var headers = new Headers();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json' );
  // const requestOptions = new RequestOptions({ headers: headers });
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      "Accept": 'application/json',
      'Authorization': `Bearer ${this.ACCESS_TOKEN}`

      })
    };
  

  let postData = {
    
      "values": [
        [
          this.todo.unique_id,this.todo.companyName,this.todo.isExpenseDocument,this.todo.narration,this.todo.amount,
          this.todo.type,this.todo.date,this.todo.dateToday,this.todo.format,this.todo.pdfURL,
          this.todo.numImages,this.todo.images[0],this.todo.images[1],this.todo.images[2],this.todo.images[3],this.todo.images[4],
          this.todo.images[5],this.todo.images[6],this.todo.images[7],this.todo.images[8],this.todo.images[9],
          this.todo.email,this.todo.status,this.todo.recorded        ]
      ]
    }
  

  this.http.post(`https://sheets.googleapis.com/v4/spreadsheets/1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE/values/A1%3AZ7:append?insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=UNFORMATTED_VALUE&valueInputOption=USER_ENTERED&key=${this.API_KEY}`, postData, httpOptions)
    .subscribe(data => {
      console.log(data['_body']);
     }, error => {
      console.log(error);
    });
  
  // })
  }

updateSheet(){
  
//   POST https://sheets.googleapis.com/v4/spreadsheets/1lZvjVqsIGkW657ev8zSUM1YoyXULEw_jtfOlyaUSjLE/values/A1%3AD2:append?insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=UNFORMATTED_VALUE&valueInputOption=USER_ENTERED&key=[YOUR_API_KEY] HTTP/1.1

// Authorization: Bearer [YOUR_ACCESS_TOKEN]
// Accept: application/json
// Content-Type: application/json

// {
//   "range": "",
//   "values": [
//     [
//       "tthjgghvhvhvhjvhjv",
//       "kkkk"
//     ]
//   ]
// }

}


refreshToken: string;

onOAuthBtnClick() {
    Plugins.OAuth2Client.authenticate(
        this.oauth2Options
    ).then(response => {
      console.log(response);
        this.ACCESS_TOKEN = response["access_token"];

        // only if you include a resourceUrl protected user values are included in the response!
        let oauthUserId = response["id"];
        let name = response["name"];
        console.log("The oauth accesstoken, oauthuserid,name: ",this.ACCESS_TOKEN,oauthUserId,name);
        this.logForm();

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
  authorizationBaseUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    accessTokenEndpoint: "https://oauth2.googleapis.com/token",
    prompt:'consent',
    scope:"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
    access_type:'online',
  

    
  web: {
    appId: "173748306826-l78q522250bbl21btqa7a9muahi5hkt6.apps.googleusercontent.com",
    responseType: "token", // implicit flow
    accessTokenEndpoint: "", // clear the tokenEndpoint as we know that implicit flow gets the accessToken from the authorizationRequest
    redirectUrl: "http://localhost:8100/tabs/",
    windowOptions: "height=600,left=0,top=0"
  },
  android:{
    appId: "173748306826-278no4bidemh7o2rvu9vqleunl5n44nh.apps.googleusercontent.com",
    responseType: "code", // if you configured a android app in google dev console the value must be "code"
    redirectUrl: "com.expenses.aarc:/tabs/"
  }}

convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(';base64,');

  // Hold the content type
  const imageType = parts[0].split(':')[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}


async captureImage(n){

   
  const options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  
  this.camera.getPicture(options).then(async (imageData) => {
   // imageData is either a base64 encoded string or a file URI
   // If it's base64 (DATA_URL):
   let base64Image = 'data:image/jpeg;base64,' + imageData;
   let blob: Blob = this.convertBase64ToBlob(base64Image)
    // create blobURL, such that we could use it in an image element:
    
    // const randomId = Math.random()
    // .toString(36)
    // .substring(2, 8);
    let date = new Date().getTime()
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      spinner:'circles',
    });
    await loading.present();

  const uploadTask = this.storage.upload(
    `files/${date}_image_${n}`,
    blob
  );

  

  uploadTask.percentageChanges().subscribe(async change => {
    this.uploadProgress = change;
    
    
  });

// https://firebasestorage.googleapis.com/v0/b/expenses-aarc.appspot.com/o/files%2F1_image_1?alt=media&token=13a3a975-c542-47bd-91c3-18b8d7eb539b
  uploadTask.then(async res => {
    loading.dismiss();
    this.uploadedImages[n]=true;

    this.todo.images[n]=`https://firebasestorage.googleapis.com/v0/b/legully-expense-app.appspot.com/o/files%2F${date}_image_${n}?alt=media&token=38133089-1be1-4eda-b056-2d862a483836`

    
  });

  }, (err) => {
   // Handle error
   
  });


    // get the blob of the image:
    
 
}

  async uploadToFirebase(val1,val2){
  let date=new Date()

  let postData = {
    
    "values": [
      [
        this.todo.unique_id,this.todo.companyName,this.todo.isExpenseDocument,this.todo.narration,this.todo.amount,
        this.todo.type,this.todo.date,this.todo.dateToday,this.todo.format,this.todo.pdfURL,
        this.todo.numImages,this.todo.images[0],this.todo.images[1],this.todo.images[2],this.todo.images[3],this.todo.images[4],
        this.todo.images[5],this.todo.images[6],this.todo.images[7],this.todo.images[8],this.todo.images[9],
        this.todo.email,this.todo.status,this.todo.recorded        ]
    ]
  }
  var jsonString = JSON.stringify(postData);
  var blob = new Blob([jsonString], {type: "application/json"})
  const loading = await this.loadingCtrl.create({
    cssClass: 'my-custom-class',
    message: 'Please wait...',
    spinner:'circles',
  });
  await loading.present();
  this.afauth.signInWithEmailAndPassword(this.userData.email,this.userData.password).then((data)=>{
    this.afs.collection('invoices').doc(`${this.userData.companyName}_${this.userData.email}_${this.todo.dateToday}_${new Date().toTimeString()}`).set({
      'userId': `${this.userData.companyName}_${this.userData.email}_${this.todo.dateToday}_${new Date().toTimeString()}`,
      'createdAt':Date.now(),
      0:val1,
      1:this.userData.companyName.toUpperCase(),
      2:this.todo.isExpenseDocument,
      3:this.todo.narration,
      4:this.todo.amount,
      5:this.port.name || 'Not Provided',
      6:this.todo.date,
      7:this.todo.dateToday,
      8:this.todo.format || 'Not Provided',
      9:this.todo.pdfURL || 'Not Provided',
      10:this.todo.numImages || 'Not Provided',
      11:this.todo.images[0] || 'Not Provided',
      12:this.todo.images[1] || 'Not Provided',
      13:this.todo.images[2] || 'Not Provided',
      14:this.todo.images[3] || 'Not Provided',
      15:this.todo.images[4] || 'Not Provided',
      16:this.todo.images[5] || 'Not Provided',
      17:this.todo.images[6] || 'Not Provided',
      18:this.todo.images[7] || 'Not Provided',
      19:this.todo.images[8] || 'Not Provided',
      20:this.todo.images[9] || 'Not Provided',
      21:this.todo.email,
      22:val2,
      23:this.todo.recorded || 'Not Provided'














})}).then(async ()=>{
  loading.dismiss()
  this.todo={
    dateToday: this.convert(new Date()),images:[]

  }
  this.uploadProgress=0;
  this.port = [];
  this.isPDF=false;
  this.isImage=false;
  const toast = await this.toastCtrl.create({
    message:'Form under review!',
    duration:1500,
    position:'middle',
    color:'primary'
  });
  toast.present();
})
  }}
