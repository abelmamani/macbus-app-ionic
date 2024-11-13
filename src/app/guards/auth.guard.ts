import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PublicRoute } from '../models/routes.model';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const requiredPrivilege = route.data?.['privilege'];

  if(authService.isLogged()){
    if(!requiredPrivilege || authService.hasAuthority(requiredPrivilege)){
      return true;
    }else{
      router.navigate([PublicRoute.HOME]);
      return false;
    }
  }else{
    router.navigate([PublicRoute.LOGIN]);
    return false;
  }
};