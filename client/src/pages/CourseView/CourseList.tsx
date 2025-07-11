import { Course } from '../../types/course';
import CourseCard from './CourseCard';

function CourseList({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  )
}

export default CourseList