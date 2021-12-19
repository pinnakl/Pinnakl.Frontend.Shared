import {
  Component,
  Input
} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-streams-status',
  templateUrl: 'streams-status.component.html',
  styles: [':host { display: inline }']
})
export class StreamsStatusComponent {
  @Input() requiredEstablishedStreamsReady$: Observable<boolean>;
  @Input() requiredStreamsErrored$: Observable<boolean>;
}
