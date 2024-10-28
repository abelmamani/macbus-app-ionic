import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { from } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
	const loadingController = inject(LoadingController);
	if (!req.url.startsWith('http')) {
	  return next(req);
	}
	return from(loadingController.create({
	  message: 'Cargando...',
	  spinner: 'crescent'
	})).pipe(
	  tap((loading) => loading.present()),
	  switchMap((loading) => 
		next(req).pipe(
		  finalize(() => loading.dismiss())
		)
	  )
	);
};
