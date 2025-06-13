import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<{message: string, type: 'success' | 'error'} | null>(null);
  toast$ = this.toastSubject.asObservable();

  showSuccess(message: string): void {
    this.toastSubject.next({ message, type: 'success' });
    setTimeout(() => this.toastSubject.next(null), 5000);
  }

  showError(message: string): void {
    this.toastSubject.next({ message, type: 'error' });
    setTimeout(() => this.toastSubject.next(null), 5000);
  }
}
