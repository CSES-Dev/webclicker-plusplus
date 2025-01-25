import React from 'react'

interface Props{
    color: string,
    days: string[],
    course: string,
    timeStart: string,
    timeEnd: string
}
export default function CourseCard({color, days, course, timeStart, timeEnd}: Props) {
  return (
    <div>course-card</div>
  )
}
