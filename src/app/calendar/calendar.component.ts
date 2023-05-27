import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import { NgForm } from '@angular/forms';
import { BdServiceService } from '../bd-service.service';
import { Clases } from '../interfaces/clase';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

interface Class {
  docente: string,
  frecuencia : string,
  grupo: string,
  horario: string,
  nombre: string
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  title = 'ScheduleMaker';
  displayedColumns: string[] = ['grupo', 'materia', 'profesor', 'frecuencia', 'horario'];
  csvHeaders: string[] = [];
  csvRows: string[][] = [];
  dataSource: any[] = [];
  schedule: any[] = [];
  csvData: string = ''

  constructor(private db: BdServiceService) { }
   
  grupos: Clases[] = [];
  nuevoGrupo : Class = {
    docente: "",
    frecuencia : "",
    grupo: "",
    horario: "",
    nombre: ""
  };
  indices : any = [];

  ngOnInit() : void {
    console.log(this.grupos)
    console.log(this.indices)
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);    
    reader.onload = (event: any) => {
      const csvContent = event.target.result;
      this.csvData = reader.result as string;
      const config = {
        header: true,
        delimiter: ',',
        skipEmptyLines: true
      };
      const parsedData = Papa.parse(this.csvData).data;
      console.log(parsedData)

      const parsedData2 = Papa.parse(csvContent, config);
      console.log(parsedData2)

      this.dataSource = parsedData2.data;
      console.log(this.dataSource)

      this.csvHeaders = parsedData[0] as string[];
      this.generateSchedule(this.dataSource);


    };
  }

  generateSchedule(clases: any[]) {
    this.schedule = [];
    const usedMaterias: string[] = []

    clases.sort((a, b) => a.horario.localeCompare(b.horario))

    for (const c of clases) {
      if (usedMaterias.includes(c.materia)) continue

      const overlappingClass = this.schedule.find(s => {
        var [start1, end1] = s.horario.split('-');
        var [start2, end2] = c.horario.split('-');
        console.log(start1, end1, start2, end2);
      
        start1 = parseInt(start1.replace(':', ''), 10);
        start2 = parseInt(start2.replace(':', ''), 10);
        end1 = parseInt(end1.replace(':', ''), 10);
        end2 = parseInt(end2.replace(':', ''), 10);
        return end1 > start2 && start1 < end2;
      });

      if (overlappingClass) continue

      this.schedule.push(c)
      usedMaterias.push(c.materia)
    }
    

    console.log(this.schedule);
  }

  getClases() : any {
    this.db.getClases().subscribe((res : any) => {
      const Res: any = res;
      const Array = Object.keys(res).forEach((key: any) => {       
      if(Res[key] != null){
        (this.grupos).push(Res[key]);
        (this.indices).push(key);
        }    
      })
      this.deleteClases(); //Para resetear la base de datos   
    })
  }

  postClases() : any {
    for(let i = 0; i < this.grupos.length; i++){
      this.grupos[i].id = this.indices[i];
      this.db.postClase(this.grupos[i]).subscribe( res => {
        console.log(this.grupos[i]);
      });
    }
  }

  deleteClases(){
    for(let i = 0; i < this.grupos.length; i++){
      this.db.deleteClase(this.grupos[i].id).subscribe((res : any) => { 
        console.log("Eliminando: "+this.grupos[i].id)
       }) 
    }
  }

  saveSchedule() {
    console.log(this.schedule);
    const csvData = this.schedule;

    const csvHeaders = [
      'grupo',
      'materia',
      'docente',
      'frecuencia',
      'horario',
    ];

    const blob = new Blob([this.convertToCsv(csvData, csvHeaders)], {
      type: 'text/csv;charset=utf-8',
    });

    saveAs(blob, 'schedule.csv');
  }

  private convertToCsv(data: any[], headers: string[]): string {
    const csvHeader = headers.join(',');
    console.log(data);
    const csvRows = data.map(row =>
      headers
        .map(fieldName => JSON.stringify(row[fieldName], (key, value) => (value === null ? '' : value)))
        .join(','),
    );
    console.log(csvHeader, csvRows);
    return [csvHeader, ...csvRows].join('\r\n');
  }

  docente: string = "";
  frecuencia : string = "";
  grupo: string = "";
  horario: string = "";
  nombre: string = "";

  upload(f: NgForm) {
    this.nuevoGrupo["grupo"] = this.grupo;
    this.nuevoGrupo["nombre"] = this.nombre;
    this.nuevoGrupo["docente"] = this.docente;
    this.nuevoGrupo["frecuencia"] = this.frecuencia;
    this.nuevoGrupo["horario"] = this.horario;
    this.db.postClase(this.nuevoGrupo).subscribe( res => {
      console.log(this.nuevoGrupo);
    });
    this.nuevoGrupo["grupo"] = "";
    this.nuevoGrupo["nombre"] = "";
    this.nuevoGrupo["docente"] = "";
    this.nuevoGrupo["frecuencia"] = "";
    this.nuevoGrupo["horario"] = "";
  }

  
}