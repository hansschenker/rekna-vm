import { DataService } from './data.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  map,
  merge,
  mergeMap,
  Observable,
  scan,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { PersonService } from './person.service';

export interface IPerson {
  id: number;
  name: string;
}
export interface IPersonVm {
  persons: IPerson[];
  personDetail: IPerson;
}
export const initialPerson = { id: 0, name: '' };
export const initialPersonVm = {
  persons: [
    { id: 1, name: 'Max' },
    { id: 2, name: 'Manu' },
    { id: 3, name: 'Anna' },
  ],
  personDetail: initialPerson,
};

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
})
export class PeopleComponent implements OnInit {
  // this subject will be used to pass the person object
  // when selecting a person from the list
  public vm$!: Observable<IPersonVm>;

  /***  add example ***/
  public addState = new BehaviorSubject<IPerson>(initialPerson);
  // <div class="personrow" *ngFor="let person of vm.persons" (click)="personDetailSubj.next(person)"> ... </div>
  public detailState = new BehaviorSubject<IPerson>(initialPerson);
  /*** delete example ***/
  public deleteState = new BehaviorSubject<IPerson>(initialPerson);
  /*** update example ***/
  public updateState = new BehaviorSubject<IPerson>(initialPerson);
  /*** persist on server example ***/
  public persistState = new BehaviorSubject<IPerson>(initialPerson);
  constructor(private svc: PersonService, private route: ActivatedRoute) {
    //////////////////// Server
    // retrieving list from server
    const listChange = this.svc
      .getPersons()
      .pipe(map((persons) => (vm: IPersonVm) => ({ ...vm, persons })));
    // persist to server
    const persistChange = this.persistState.pipe(
      mergeMap((personToUpdate) => this.svc.updatePerson(personToUpdate)),
      map((updatedPerson) => (vm: IPersonVm) => {
        const foundIndex = vm.persons.findIndex(
          (p) => p.id === updatedPerson.id
        );
        const persons = [
          ...vm.persons.slice(0, foundIndex),
          updatedPerson,
          ...vm.persons.slice(foundIndex + 1),
        ];
        return { ...vm, persons };
      })
    );
    // retrieve from server
    const retrieveChange = route.paramMap.pipe(
      map((paramMap) => Number(paramMap.get('id'))),
      switchMap((id) => this.svc.getPerson(id)),
      map((personDetail) => (vm: IPersonVm) => ({ ...vm, personDetail }))
    );

    //////////////////// local list once loaded from server
    // select a person, get detail and set it on viewmodel
    const detailChange = this.detailState.pipe(
      mergeMap((person) => this.svc.getPersonDetail(person.id)),
      map((personDetail) => (vm: IPersonVm) => ({ ...vm, personDetail }))
    );

    // add list action
    const addChange = this.addState.pipe(
      // spread operator is used on the existing persons list to add the new person
      map((newPerson) => (vm: IPersonVm) => ({
        ...vm,
        persons: [...vm.persons, newPerson],
      }))
    );
    // delete list action
    const deleteChange = this.deleteState.pipe(
      map((personToDelete) => (vm: IPersonVm) => ({
        ...vm,
        persons: vm.persons.filter((p) => p !== personToDelete),
      }))
    );
    // update list action
    const updateChange = this.updateState.pipe(
      map((personToUpdate) => (vm: IPersonVm) => {
        const indexOfPerson = vm.persons.findIndex((p) => p === personToUpdate);
        // spread operator to maintain immutability of the persons array
        const persons = [
          ...vm.persons.slice(0, indexOfPerson),
          personToUpdate,
          ...vm.persons.slice(indexOfPerson + 1),
        ];
        return { ...vm, persons };
      })
    );

    (this.vm$ = merge(
      listChange,
      detailChange,
      addChange,
      deleteChange,
      updateChange,
      persistChange,
      retrieveChange
    ).pipe(
      scan(
        (vm: IPersonVm, mutationFn: (vm: IPersonVm) => IPersonVm) =>
          mutationFn(vm),
        initialPersonVm
      )
    )),
      map(([persons, personDetail]) => ({
        persons,
        personDetail,
      }));
  }

  ngOnInit(): void {}
}
