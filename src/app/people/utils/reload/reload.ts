import { map, merge, mergeMap, Observable, scan, share, Subject, switchMap } from 'rxjs';
import { IPerson, IPersonVm } from '../../people.component';
import { PersonService } from '../../person.service';

/*
Let's consider reloading a list where reloading needs to be done in the following cases:

- the user specifically clicks the reload button
- after deleting an item successfully on the server

This introduces the following problem : since the delete$ observable is subscribed twice
(merge subscribes directly to delete$ and indirectly a second time via reload$)
the delete request will be executed twice. Luckily this can be easily solved
by the share operator.

share will share an observable result in the future, meaning that if one subscribes at some
time x, this subscriber will not get any value that was emitted previously to that time.
 So in the case of the delete$ observable which is subscribed to multiple times the
 share operator prevents the request from being executed multiple times.

shareReplay on the other hand is more suitable as a caching mechanism for late subscribers.
They will get previously emitted values as well, how much depends upon the bufferSize
parameter. So it can be used with an observable which retrieves data from the server
and that needs to be shared among mulitple components without refetching the data again.

*/
export class Reload {
public reloadSubj = new Subject<boolean>();
public deleteSubj = new Subject<IPerson>();
public vm$!: Observable<IPersonVm>;

// private delete$ = this.deleteSubj.pipe(
//   mergeMap( item => this.svc.deletePerson(item.id)),
//   map( _ => (vm:IPersonVm) => vm)
// );

private reload$ = this.reloadSubj.pipe(
  switchMap( _ => this.svc.getPersons() ),
  map( items => (vm:IPersonVm) => ({...vm, items}))
)
private delete$ = this.deleteSubj.pipe(
  mergeMap( item => this.svc.deletePerson(item.id)),
  share(),
  map( _ => (vm:IPersonVm) => vm)
);
  constructor(private svc: PersonService){
    // this.vm$ = merge(this.reload$, this.delete$).pipe(
      //scan( ... )
    //)
  }
}
