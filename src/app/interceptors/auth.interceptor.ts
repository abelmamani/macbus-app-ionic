import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let clonedRequest = req;
  if(localStorage.getItem('token')){
    clonedRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer '+localStorage.getItem('token')!),
    });
  }
  return next(clonedRequest);
};
