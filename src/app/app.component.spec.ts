import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DataService } from './data.service';

let service: DataService;

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [DataService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    service = TestBed.inject(DataService);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a div event', () => {
    const fixure = TestBed.createComponent(AppComponent);
    const calendar : HTMLElement = fixure.nativeElement;
    const event = calendar.getElementsByClassName("event");
    expect(event).toBeDefined();
  });

});
