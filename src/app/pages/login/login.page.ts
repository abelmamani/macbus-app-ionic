import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonNote, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, eyeOffOutline, eyeOutline, lockClosedOutline, mailOutline } from 'ionicons/icons';
import { ResponseAuth } from 'src/app/models/response.auth.model';
import { PublicRoute } from 'src/app/models/routes.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonHeader, IonContent, IonButton, IonIcon, IonCard, IonCardContent,IonCardHeader, IonCardSubtitle, IonCardTitle, IonList, IonItem, IonInput, IonLabel, IonNote]
})
export class LoginPage implements OnInit {
  showPassword = false;
  loginForm: FormGroup = this.formBuilder.group({
    email: [undefined, [Validators.required, Validators.email]],
    password: [undefined, Validators.required]
  });
  constructor(private authService: AuthService, private formBuilder: FormBuilder, private router: Router, private navCtrl: NavController, private toastController: ToastController) {
    addIcons({arrowBackOutline, lockClosedOutline, mailOutline, eyeOutline, eyeOffOutline});
  }

  ngOnInit() {
    this.loginForm.untouched;
    this.loginForm.reset();
  }
  onSubmit(){
    if(this.loginForm.valid){
      this.authService.signin(this.loginForm.value).subscribe({
        next: (res: ResponseAuth) => {
          this.authService.login(res.token, res.identity);
          this.router.navigate([PublicRoute.HOME]);
        },
        error: ( err ) => {
          this.showToast(err.error.message ? err.error.message : "Ocurrio un problema al iniciar session, intentelo mas tarde!");
        }
      });
    }else{
      this.loginForm.touched;
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
