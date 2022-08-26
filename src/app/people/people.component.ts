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
const initialPerson = { id: 0, name: '' };
const initialPersonVm = {
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
  // <div class="personrow" *ngFor="let person of vm.persons" (click)="personDetailSubj.next(person)"> ... </div>
  public personDetailSubj = new Subject<IPerson>();
  public vm$!: Observable<IPersonVm>;

  /***  add example ***/
  public addSubj = new BehaviorSubject<IPerson>(initialPerson);
  /*** delete example ***/
  public deleteSubj = new BehaviorSubject<IPerson>(initialPerson);
  /*** update example ***/
  public updateSubj = new BehaviorSubject<IPerson>(initialPerson);
  /*** persist on server example ***/
  public persistSubj = new BehaviorSubject<IPerson>(initialPerson);
  constructor(
    private personService: PersonService,
    private svc: DataService,
    private route: ActivatedRoute
  ) {
    // retrieving list of persons (could be a http request)
    const personList$ = this.personService
      .getPersons()
      .pipe(map((persons) => (vm: IPersonVm) => ({ ...vm, persons })));

    // select a person, get detail and set it on viewmodel
    const personDetail$ = this.personDetailSubj.pipe(
      mergeMap((person) => this.personService.getPersonDetail(person.id)),
      map((personDetail) => (vm: IPersonVm) => ({ ...vm, personDetail }))
    );

    // add list action
    const addPerson$ = this.addSubj.pipe(
      // spread operator is used on the existing persons list to add the new person
      map((newPerson) => (vm: IPersonVm) => ({
        ...vm,
        persons: [...vm.persons, newPerson],
      }))
    );
    // delete list action
    const deletePerson$ = this.deleteSubj.pipe(
      map((personToDelete) => (vm: IPersonVm) => ({
        ...vm,
        persons: vm.persons.filter((p) => p !== personToDelete),
      }))
    );
    // update list action
    const updatePerson$ = this.updateSubj.pipe(
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
    // Server actions
    // persist action
    const persistPerson$ = this.persistSubj.pipe(
      mergeMap((personToUpdate) =>
        this.personService.updatePerson(personToUpdate)
      ),
      map((updatedPerson) => (vm: IPersonVm) => {
        const foundPersonIndex = vm.persons.findIndex(
          (p) => p.id === updatedPerson.id
        );
        const persons = [
          ...vm.persons.slice(0, foundPersonIndex),
          updatedPerson,
          ...vm.persons.slice(foundPersonIndex + 1),
        ];
        return { ...vm, persons };
      })
    );
    // retrieve from server
    const retrievePerson$ = route.paramMap.pipe(
      map((paramMap) => Number(paramMap.get('id'))),
      switchMap((id) => this.personService.getPerson(id)),
      map((personDetail) => (vm: IPersonVm) => ({ ...vm, personDetail }))
    );

    (this.vm$ = merge(
      personList$,
      personDetail$,
      addPerson$,
      deletePerson$,
      updatePerson$,
      persistPerson$,
      retrievePerson$
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
