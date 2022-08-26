import { BehaviorSubject, map } from "rxjs";
import { initialPerson, IPerson, IPersonVm } from "../../people.component";

  const sideEffectSubj = new BehaviorSubject<IPerson>(initialPerson);
  const sideEffect$ = sideEffectSubj.pipe(
    map( _ => (vm:IPersonVm)=>{
      // execute side effect here
      return vm;
    })
  );
