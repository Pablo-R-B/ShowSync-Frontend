import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateTo(path: string): void {
    //this.router.navigate([path], { relativeTo: this.route });
    this.router.navigate(['/admin', path]);

  }


}
