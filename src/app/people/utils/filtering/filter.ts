import { BehaviorSubject, map, merge, Observable, scan, Subject } from 'rxjs';
import { PersonService } from '../../person.service';
import { IPerson } from './../../people.component';

  interface IPersonVm {
    persons:IPerson[];
  }

  class PersonListComponent {
    public vm$! : Observable<IPersonVm>;
    public filterSubj! : Subject<string>;

    private retrievePersons$ = this.svc.getPersons().pipe(
      map( persons => (vm: IPersonVm) =>  ({...vm, persons }) )
    );
    constructor(private svc:PersonService) {
      this.vm$ = merge(this.retrievePersons$, this.filterPersons$).pipe(
        scan( (vm:IPersonVm, mutationFn:(vm:IPersonVm)=>IPersonVm) => mutationFn(vm), {persons:[], personDetail:null})
      );
    }
    // attempt filtering as another mutation on the viewmodel
    private filterPersons$ = this.filterSubj.pipe(
      map( filterArg =>(vm: IPersonVm) =>({
        ...vm,
        persons: vm.persons.filter(p=>filterArg==null || p.name.includes(filterArg))
      }) )
    )
  }
