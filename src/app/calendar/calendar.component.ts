import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import { NgForm } from '@angular/forms';
import { BdServiceService } from '../bd-service.service';
import { Clases } from '../interfaces/clase';

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
  displayedColumns: string[] = ['grupo', 'materia', 'profesor', 'frecuencia', 'horarioo'];
  csvHeaders: string[] = [];
  csvRows: string[][] = [];
  dataSource: any[] = [];
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
      //this.csvRows = parsedData.slice(1) as string[][];
    };
    this.getClases();
    //this.postClases();
    
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