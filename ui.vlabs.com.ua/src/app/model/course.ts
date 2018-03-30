import { EClass } from ".";

export class Course {
    id: number;
    name: string;
    eClasses: EClass[];


    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.eClasses = undefined;
    }

    map(anyCourseItem: any): Course {
        let course: Course = new Course();
        Object.keys(anyCourseItem).forEach(key => {
            if (course.hasOwnProperty(key)) {
                course[key] = anyCourseItem[key];
            }
        });
        return course;
    }
}

export class CourseItem extends Course {
    checked: boolean;
    eClassesNum: number;
}