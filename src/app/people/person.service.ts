import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, tap } from 'rxjs';
import { IPerson } from './people.component';
declare module namespace {

  export interface Geo {
      lat: string;
      lng: string;
  }

  export interface Address {
      street: string;
      suite: string;
      city: string;
      zipcode: string;
      geo: Geo;
  }

  export interface Company {
      name: string;
      catchPhrase: string;
      bs: string;
  }

  export interface RootObject {
      id: number;
      name: string;
      username: string;
      email: string;
      address: Address;
      phone: string;
      website: string;
      company: Company;
  }

}

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  persons: IPerson[] =[{id:1, name:'Max'},{id:2, name:'Mary'},{id:3, name:'Werner'}
]
  headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: HttpClient) { }

  getPersons(): Observable<IPerson[]> {
    return this.http.get<IPerson[]>('http://localhost:3000/people/').pipe(

      catchError(this.handleError),
      tap( ps => console.log("service persons: " + JSON.stringify(ps)))
  )}

  getPersonDetail(id: number): Observable<IPerson> {
    return of({id:1, name:'Max'});
  }

  updatePerson(person: IPerson): Observable<IPerson> {
    return of({id:1, name:'Max'});
  }
  getPerson(id: number): Observable<IPerson> {
    return of({id:1, name:'Max'});
  }
  deletePerson(id: number): Observable<IPerson>{
    return of({id:1, name:'Max'});
  }
  handleError(error: any): Observable<any> {
    console.error('An error occurred', error); // for demo purposes only
    return of(error.message || error);
  }
}
