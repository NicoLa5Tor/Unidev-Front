import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { UserSessionService } from '../services/user-session.service';
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const userSessionService = inject(UserSessionService);
  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (roles.length === 0) {
    return true;
  }

  return userSessionService.loadCurrentUser().pipe(
    map(user => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      if (roles.includes(user.roleName)) {
        return true;
      }

      return router.createUrlTree(['/']);
    })
  );
};
