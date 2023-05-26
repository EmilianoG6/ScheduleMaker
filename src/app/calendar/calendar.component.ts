import { Component } from '@angular/core';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  csvData: string = '';
  csvHeaders: string[] = [];
  csvRows: string[][] = [];

  onFileSelected(event: any) {
    // defined earlier
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.csvData = reader.result as string;
      this.parseCsv(); // will be defined later
    };
  }

  parseCsv() {
    const parsedData = Papa.parse(this.csvData).data;
    this.csvHeaders = parsedData[0] as string[];
    this.csvRows = parsedData.slice(1) as string[][];
  }
}