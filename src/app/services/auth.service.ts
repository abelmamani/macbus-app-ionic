import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Identity } from '../models/identity.model';
import { RequestLogin } from '../models/request.login.model';
import { ResponseAuth } from '../models/response.auth.model';
import { ERole } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url: string = 'http://localhost:3000/api/users';
  //private url = "https://macbus-api-rest.vercel.app/api/users";
  private identitySubject = new BehaviorSubject<Identity | null>(this.getIdentity());
 
  constructor(private http: HttpClient) {}

  signin(requestLogin: RequestLogin): Observable<ResponseAuth> {
    return this.http.post<ResponseAuth>(`${this.url}/login`, requestLogin)
      .pipe(
        tap(response => {
          this.saveCredentials(response);
          this.identitySubject.next(response.identity);
        })
      );
  }

  isLogged(){
    return !!localStorage.getItem('token') && !!localStorage.getItem('identity');
  }

  saveCredentials(responseAuth: ResponseAuth){
    localStorage.setItem('token', responseAuth.token);
    localStorage.setItem('identity', JSON.stringify(responseAuth.identity));
  }

  getToken(){return this.isLogged() ? localStorage.getItem('token') : null;
  }

  getIdentity(): Identity | null {
    if(this.isLogged()){
      const identityString= localStorage.getItem("identity");
      return  identityString ? JSON.parse(identityString) : null;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('identity');
    this.identitySubject.next(null);
  }

  hasRole(requiredRoles: ERole[]): boolean {
    const identity: Identity | null = this.getIdentity();
    return identity ? requiredRoles.some(role => identity.role === role) : false;
  }

  getIdentitySubject(): Observable<Identity | null> {
    return this.identitySubject.asObservable();
  }
}
