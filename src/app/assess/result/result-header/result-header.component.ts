import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'result-header',
  templateUrl: './result-header.component.html',
  styleUrls: ['./result-header.component.scss']
})
export class ResultHeaderComponent implements OnInit {

  @Input()
  public rollupId: string;

  @Input()
  public created: Date;

  public summaryLink: string;
  public resultsLink: string;

  constructor() { }

  /**
   * @description on init
   * @return {void}
   */
  public ngOnInit(): void {
    this.summaryLink = `../../summary/${this.rollupId}`;
    this.resultsLink = `../../full/${this.rollupId}`;
  }

}