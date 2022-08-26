import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, merge, Observable, of, scan, startWith, Subject } from 'rxjs';

interface State  {
  count: number
}
const initialState: State = { count: 0 };

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent implements OnInit {

  // one viewmodel
  public vmChanges             //: Observable<State> = of(initialState);
  // user actions
  public incrAction =  new BehaviorSubject<State>({ count: 0 });
  public decrAction =  new BehaviorSubject<State>({ count: 0 });

  constructor() {

    const incrChanges = this.incrAction.pipe(
      map( delta => (vm: State) => ({ ...vm, count: vm.count + 1 }) )
    )
    const decrChanges = this.decrAction.pipe(
      map( delta => (vm: State) => ({ ...vm, count: vm.count - 1 }) )
    )
    type StateReducer = (vm: State) => State;

    this.vmChanges = merge(incrChanges, decrChanges).pipe(
      scan((prevVm:State, reduce : StateReducer): State => reduce(prevVm), initialState)
    )

  }


  ngOnInit(): void {
  }

}
