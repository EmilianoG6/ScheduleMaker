import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import { NgForm } from '@angular/forms';
import { BdServiceService } from '../bd-service.service';
import { Clases } from '../interfaces/clase'
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

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
  constructor(private db: BdServiceService, private http: HttpClient) { }

  title = 'ScheduleMaker';
  displayedColumns: string[] = ['grupo', 'materia', 'profesor', 'frecuencia', 'horario'];
  csvHeaders: string[] = [];
  csvRows: string[][] = [];
  dataSource: any[] = [];
  schedule: any[] = [];
  csvData: string = ''
  grupos: Clases[] = [];
  nuevoGrupo : Class = {
    docente: "",
    frecuencia : "",
    grupo: "",
    horario: "",
    nombre: ""
  };
  indices : any = [];


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
      const parsedData2 = Papa.parse(csvContent, config);

      this.dataSource = parsedData2.data;
      console.log(this.dataSource)

      this.csvHeaders = parsedData[0] as string[];
      this.generateSchedule(this.dataSource);

      this.getClases();
      this.postClases();
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
        //console.log(start1, end1, start2, end2); //Muestra el intervalo de los tiempos.
      
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
        (this.grupos).push(Res[key]); //Obtiene las clases.
        (this.indices).push(key); //Obtiene los indices de las clases.
        this.db.deleteClase(key).subscribe((res : any) => { //Formateo de database.
            console.log("Eliminando: "+key)
           }) 
        }
      })
    })
  }

  postClases() : any {
    for(let i = 0; i < this.dataSource.length; i++){
      this.db.postClase(this.dataSource[i]).subscribe( res => { }); //Introduci las clases del CSV ingresado.
    }
  }

  saveSchedule() { //Guarda el archivo CSV del schedule made.
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

  obtenerClases() {
    this.http.get<any>('http://localhost:3000/clases').subscribe((clases) => {
      console.log(clases); // Muestra los datos en la consola del navegador
    });
  }
}