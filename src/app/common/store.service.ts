import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { delay, filter, map, retryWhen, shareReplay, tap } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
  providedIn: "root",
})
export class Store {
  private subject = new BehaviorSubject<Course[]>([]);

  courses$: Observable<Course[]> = this.subject.asObservable();

  init() {
    const http$ = createHttpObservable("/api/courses");

    http$
      .pipe(
        tap(() => console.log("HTTP Request executed")),
        map((res) => Object.values(res["payload"]))
      )
      .subscribe((courses) => this.subject.next(courses));
  }

  selectBeginnerCourses(): Observable<Course[]> {
    return this.filterByCategory("BEGINNER");
  }

  selectAdvancedCourses(): Observable<Course[]> {
    return this.filterByCategory("ADVANCED");
  }

  selectCourseById(courseId: number): Observable<Course> {
    return this.courses$.pipe(
      map((courses: Course[]) =>
        courses.find((courses) => courses.id === courseId)
      ),
      filter(course => !!course)
    );
  }

  filterByCategory(category: string) {
    return this.courses$.pipe(
      map((courses: Course[]) =>
        courses.filter((course) => course.category === category)
      )
    );
  }

  saveCourse(courseId: number, changes: Partial<Course>): Observable<any> {
    const courses = this.subject.getValue();

    const courseIndex = courses.findIndex((course) => course.id === courseId);

    const newCourses = courses.slice(0);

    newCourses[courseIndex] = {
      ...courses[courseIndex],
      ...changes,
    };

    this.subject.next(newCourses);

    return fromPromise(fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'content-type': 'application/json'
      }
    }))
  }
}
