import { BehaviorSubject, map, merge, scan, tap } from 'rxjs';
import { Component, OnInit } from '@angular/core';

interface Person {
  id: number;
  name: string;
}
interface State {
  persons: Person[];
  person: Person;
}
const initialState: State = { persons: [{ id: 1, name: 'Max' }], person: {id:0, name: ''} };

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css'],
})
export class PersonsComponent {
  // one viewmodel
  public vmChanges; //: Observable<State> = of(initialState);
  
  // user actions
  public addState = new BehaviorSubject<State>(initialState);
  public deleteState = new BehaviorSubject<State>(initialState);
  public vm = new BehaviorSubject<State>(initialState);

  constructor() {
    type StateReducer = (vm: State) => State;

    const addChanges = this.addState.pipe(
      tap(state => ({ ...state, persons: [...state.persons, state.person] }) ),
      map((add:State) => (vm: State) => ({ ...vm, persons: [...vm.persons, add.person] }))
    );
    const deleteChanges = this.deleteState.pipe(
      map((add:State) => (vm: State) => ({ ...vm, persons: vm.persons.filter(p => p.id !== add.person.id) }))
    );





    this.vmChanges = merge(addChanges,deleteChanges).pipe(
      scan((prevVm: State, reduce: StateReducer): State => reduce(prevVm), initialState)
    );
  }
}
