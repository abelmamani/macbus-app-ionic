import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { PrivateRoute, PublicRoute } from '../models/routes.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const requiredRoles = route.data?.['roles'];
  if(!authService.isLogged()){
    if(!requiredRoles || authService.hasRole(requiredRoles)){
      return true;
    }else{
      router.navigate([PrivateRoute.HOME]);
      return false;
    }
  }else{
    router.navigate([PublicRoute.LOGIN]);
    return false;
  }
};
