import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { IPersonVm } from '../../people.component';
import { PersonService } from '../../person.service';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css']
})
export class PersonDetailsComponent implements OnInit {

  constructor(private route:ActivatedRoute, private personService: PersonService) {
    const retrieveData$ = route.paramMap.pipe(
      map( paramMap => Number( paramMap.get('id')) ),
      switchMap( id => this.personService.getPerson(id)),
      map( personDetail => (vm:IPersonVm)=> ({...vm, personDetail }))
    )
  };

 // this.vm$ = merge(retrieveData$, /* other viewmodel mutations */);


  ngOnInit(): void {
  }

}
