import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ //Decorador para injectar contenido, referencias, librerías, dependencias, etc.
  providedIn: 'root'
})
export class BdServiceService {

  constructor(private http: HttpClient) { }

  //GET
  getClases(){
    return this.http.get('https://schedulemakerlmp-default-rtdb.firebaseio.com/clases.json')
  }

  getGrupo(id: string){
    return this.http.get('https://schedulemakerlmp-default-rtdb.firebaseio.com/clases/'+ id +'.json')
  }

  //POST
  postClase(post: any) {
    return this.http.post('https://schedulemakerlmp-default-rtdb.firebaseio.com/clases.json', post)
  }

  //DELETE
  deleteClase(id: string){
    return this.http.delete('https://schedulemakerlmp-default-rtdb.firebaseio.com/clases/'+ id + '.json')
  }

  //PUT
  updateClase(id : string, put : any){
    return this.http.put('https://schedulemakerlmp-default-rtdb.firebaseio.com/clases/'+ id + '.json', put)
  }

}