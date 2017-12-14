import { Pipe } from '@angular/core'

@Pipe({
  name: 'celement'
})
export class CelementPipe {
  transform(value: any, args: any) : any {
    switch (args.action) {
      case 'icon':
        switch (value) {
          case 'youtube': return 'subscriptions';
          case 'label': return 'label';
          case 'folder': return 'create_new_folder';
          case 'attachment': return 'attachment';
          case 'vlab': return 'developer_board';
          case 'quiz': return 'event_available';
        }
      break;
    }
  }
}