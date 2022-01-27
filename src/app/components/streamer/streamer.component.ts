import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { measureText } from 'src/app/app.utils';
import { TwitchService } from 'src/app/services/twitch.service';
import { AbstractComponent } from '../abstract.component';

@Component({
  selector    : 'app-streamer',
  templateUrl : './streamer.component.html',
  styleUrls   : ['./streamer.component.scss'],
})
export class StreamerComponent extends AbstractComponent implements AfterViewInit, OnChanges {

  @ViewChild('nameElement', { static: true })
  element: ElementRef<HTMLElement>;

  @Input() name: string;
  @Input() logo: string;
  @Input() status: boolean;
  @Input() game_id?: number;
  @Input() viewer_count?: number;
  @Output() onClick: Subject<any> = new Subject();
  @Output() refresh: Subject<void> = new Subject();

  tooltip: string = '';
  badge: string;
  activity: string;

  constructor(private twitchSrv: TwitchService) {
    super();
  }

  get el() {
    return this.element.nativeElement;
  }

  @HostListener('click', ['$event.target'])
  onElementClick(target: HTMLElement) {
    if (!this.isButtonContainer(target)) {
      this.onClick.next(target);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.game_id && !!changes.game_id.currentValue) {
      this.twitchSrv.searchGame({ id: [`${this.game_id}`] })
        .pipe(
          takeUntil(this.destroy$),
          map(response => response.data.shift())
        )
        .subscribe(game => {
          this.activity = game.name;
          this.refresh.next();
        });
      }
      
      if (changes.viewer_count && !!changes.viewer_count.currentValue) {
        this.badge = this.humanViewerSize(this.viewer_count);
        this.refresh.next();
      }
    }  

  ngAfterViewInit() {
    const pixelWidth = measureText(this.el.textContent, '15px Roboto');
    if (this.el.offsetWidth > 105 || pixelWidth > 105) {
      setTimeout(() => this.tooltip = this.name, 10);
    }
  }
  
  private humanViewerSize(count: number, dp=1): string {
    const thresh = 1000;
  
    if (Math.abs(count) < thresh) {
      return `${count}`;
    }
  
    const units = ['k', 'M'];
    let u = -1;
    const r = 10**dp;
  
    do {
      count /= thresh;
      ++u;
    } while (Math.round(Math.abs(count) * r) / r >= thresh && u < units.length - 1);
  
    return `${count.toFixed(dp)}`.replace('.0', '') + units[u];
  }

  private isButtonContainer(element: HTMLElement): boolean {
    const isOrIn: boolean = element.classList.contains('app-streamer_buttons-container') || false;
    return !isOrIn && !!element.parentElement ? this.isButtonContainer(element.parentElement) : isOrIn;
  }

}