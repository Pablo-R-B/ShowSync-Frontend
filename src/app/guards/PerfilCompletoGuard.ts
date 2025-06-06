import { Injectable } from '@angular/core';
import {CanActivate, CanActivateChild, Router} from '@angular/router';
import { AuthService } from '../servicios/auth.service'

@Injectable({ providedIn: 'root' })
export class PerfilCompletoGuard implements CanActivate, CanActivateChild{
  constructor(private authService: AuthService, private router: Router) {}

  private checkAccess(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isProfileComplete = this.authService.getPerfilCompletoFromToken();
    const rol = localStorage.getItem('rol');

    if (!isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (rol === 'ADMINISTRADOR') {
      return true;
    }

    if (!isProfileComplete) {
      if (rol === 'ARTISTA') {
        this.router.navigate(['/datos-artista']);
      } else if (rol === 'PROMOTOR') {
        this.router.navigate(['/datos-promotor']);
      } else {
        this.router.navigate(['/landing-page']);
      }
      return false;
    }

    return true;
  }

  canActivate(): boolean {
    return this.checkAccess();
  }

  canActivateChild(): boolean {
    return this.checkAccess();
  }

}
