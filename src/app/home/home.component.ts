import { Component, OnInit } from "@angular/core";
import { noop, Observable, of, throwError } from "rxjs";
import { catchError, finalize, map, shareReplay, tap } from "rxjs/operators";
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

  constructor() {}

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");

    const courses$: Observable<Course[]> = http$.pipe(
      catchError((err) => {
        console.log("Error ocurred", err);

        return throwError(err);
      }),
      finalize(() => {
        console.log("Finalize executed");
      }),
      tap(() => console.log("HTTP Request executed")),
      map((res) => Object.values(res["payload"])),
      shareReplay()
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
