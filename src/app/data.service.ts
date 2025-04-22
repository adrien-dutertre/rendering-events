import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  constructor() {  }

 getData() {
    return this.http.get('./input.json');
  }
}
