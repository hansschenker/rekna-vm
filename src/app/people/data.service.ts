import { IPerson } from './people.component';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {

    }
  getPeople(): Observable<IPerson[]> {
    return this.http.get<IPerson[]>('http://localhost:3000/people')
  }
  }

