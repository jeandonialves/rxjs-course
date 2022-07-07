import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { forkJoin, fromEvent, Observable } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { createHttpObservable } from "../common/util";
import { Course } from "../model/course";
import { Lesson } from "../model/lesson";
import { Store } from "./../common/store.service";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  courseId: number;

  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];

    this.course$ = this.store.selectCourseById(this.courseId).pipe(take(1));

    forkJoin(this.course$, this.loadLessons())
      .pipe(
        tap(([course, lessons]) => {
          console.log("course", course);
          console.log("lessons", lessons);
        })
      )
      .subscribe();
  }

  ngAfterViewInit() {
    fromEvent<any>(this.input.nativeElement, "keyup")
      .pipe(map((event) => event.target.value))
      .subscribe(console.log);
  }

  loadLessons(search = ""): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`
    ).pipe(map((res) => res["payload"]));
  }
}
