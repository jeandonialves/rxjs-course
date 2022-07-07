import { Component, OnInit } from "@angular/core";
import { noop, Observable, of, throwError, timer } from "rxjs";
import { catchError, delay, delayWhen, finalize, map, retryWhen, shareReplay, tap } from "rxjs/operators";
import { Store } from "../common/store.service";
import { createHttpObservable } from "../common/util";
import { Course } from "../model/course";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor(private store: Store) {}

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");

    const courses$: Observable<Course[]> = http$.pipe(
      tap(() => console.log("HTTP Request executed")),
      map((res) => Object.values(res["payload"])),
      shareReplay(),
      retryWhen(errors => errors.pipe(
        delay(2000)
      ))
    );

    this.beginnerCourses$ = courses$.pipe(
      map((courses: Course[]) =>
        courses.filter((course) => course.category === "BEGINNER")
      )
    );

    this.advancedCourses$ = courses$.pipe(
      map((courses: Course[]) =>
        courses.filter((course) => course.category === "ADVANCED")
      )
    );
  }
}
