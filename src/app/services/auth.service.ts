import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Identity } from '../models/identity.model';
import { EPrivilege } from '../models/privilege.enum';
import { RequestLogin } from '../models/request.login.model';
import { ResponseAuth } from '../models/response.auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private url: string = 'http://localhost:3000/api/users';
  private url = "macbus-api-rest-sigma.vercel.app/api/users";
  private identitySubject = new BehaviorSubject<Identity | null>(this.getIdentity());
 
  constructor(private http: HttpClient) {}

  signin(requestLogin: RequestLogin): Observable<ResponseAuth> {
    return this.http.post<ResponseAuth>(`${this.url}/login`, requestLogin);
  }

  isLogged(){
    return !!localStorage.getItem('token') && !!localStorage.getItem('identity');
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

  login(token: string, identity: Identity): void {
    localStorage.setItem('token', token);
    localStorage.setItem('identity', JSON.stringify(identity));
    this.identitySubject.next(identity);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('identity');
    this.identitySubject.next(null);
  }

  hasAuthority(requiredPrivilege: EPrivilege): boolean {
    const identity: Identity | null = this.getIdentity();
    return identity ? identity.role.privileges.some(privilege => privilege.name ===  requiredPrivilege) : false;
  }

  getIdentitySubject(): Observable<Identity | null> {
    return this.identitySubject.asObservable();
  }
}
