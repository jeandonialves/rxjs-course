import { Component, OnInit } from "@angular/core";
import { noop } from "rxjs";
import { map } from "rxjs/operators";
import { createHttpObservable } from "../common/util";
import { Course } from "../model/course";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses: Course[];
  advancedCourses: Course[];

  constructor() {}

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");

    const courses$ = http$.pipe(map((res) => Object.values(res["payload"])));

    courses$.subscribe(
      (courses) => {
        this.beginnerCourses = courses.filter(
          (course) => course.category === "BEGINNER"
        );

        this.advancedCourses = courses.filter(
          (course) => course.category === "ADVANCED"
        );

        console.log(this.beginnerCourses);
        console.log(this.advancedCourses);
      },
      noop,
      () => console.log("completed")
    );
  }
}
