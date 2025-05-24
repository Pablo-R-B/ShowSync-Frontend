import { NgModule } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  imports: [FullCalendarModule],
  exports: [FullCalendarModule]
})
export class SharedModule {}
