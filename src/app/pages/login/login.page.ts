import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ResponseAuth } from 'src/app/models/response.auth.model';
import { PublicRoute } from 'src/app/models/routes.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup = this.formBuilder.group({
    email: [undefined, [Validators.required, Validators.email]],
    password: [undefined, Validators.required]
  });
  constructor(private authService: AuthService, private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.loginForm.untouched;
    this.loginForm.reset();
  }
  onSubmit(){
    if(this.loginForm.valid){
      this.authService.signin(this.loginForm.value).subscribe({
        next: (res: ResponseAuth) => {
          this.router.navigate([PublicRoute.HOME]);
        },
        error: ( err ) => {
          console.log(err.error.message ? err.error.message : "error al hacer login");
        }
      });
    }else{
      this.loginForm.touched;
    }
  }
}
