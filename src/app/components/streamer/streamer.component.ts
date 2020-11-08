import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { measureText } from 'src/app/app.utils';

@Component({
  selector    : 'app-streamer',
  templateUrl : './streamer.component.html',
  styleUrls   : ['./streamer.component.scss'],
})
export class StreamerComponent implements AfterViewInit {

  @ViewChild('nameElement', { static: true })
  element: ElementRef<HTMLElement>;

  @Input() logo: string;
  @Input() name: string;
  @Input() status: boolean;
  @Input() count?: number = 0;

  title: string = '';

  get el() {
    return this.element.nativeElement;
  }

  ngAfterViewInit() {
    const pixelWidth = measureText(this.el.textContent, '15px Roboto');
    if (this.el.offsetWidth > 105 || pixelWidth > 105) {
      setTimeout(() => this.title = this.name, 10);
    }
  }
  
}