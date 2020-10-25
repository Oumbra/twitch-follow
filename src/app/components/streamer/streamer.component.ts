import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector    : 'app-streamer',
  templateUrl : './streamer.component.html',
  styleUrls   : ['./streamer.component.scss'],
})
export class StreamerComponent implements OnInit {

  @Input() logo: string;
  @Input() name: string;
  @Input() status: boolean;

  ngOnInit(){
  }

}