import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;
  if (apiUrl && req.url.startsWith(apiUrl)) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(req);
};
