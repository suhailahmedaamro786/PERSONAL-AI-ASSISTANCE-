import type { ClassSession } from '../types';
import { daysAgo } from './helpers';

export const classes: ClassSession[] = [
  {
    id: 'cls_1',
    name: 'Full-Stack AI Batch — Backend Module',
    instructor: 'Sir Hamza',
    location: 'Build Team HQ, Dadu',
    isOnline: false,
    dayOfWeek: 1, // Monday
    startTime: '14:00',
    endTime: '16:00',
    courseId: 'course_2',
    startDate: daysAgo(30),
    endDate: null,
    color: '#6366f1',
  },
  {
    id: 'cls_2',
    name: 'Full-Stack AI Batch — Backend Module',
    instructor: 'Sir Hamza',
    location: 'Build Team HQ, Dadu',
    isOnline: false,
    dayOfWeek: 3, // Wednesday
    startTime: '14:00',
    endTime: '16:00',
    courseId: 'course_2',
    startDate: daysAgo(30),
    endDate: null,
    color: '#6366f1',
  },
  {
    id: 'cls_3',
    name: 'Full-Stack AI Batch — Backend Module',
    instructor: 'Sir Hamza',
    location: 'Build Team HQ, Dadu',
    isOnline: false,
    dayOfWeek: 5, // Friday
    startTime: '14:00',
    endTime: '16:00',
    courseId: 'course_2',
    startDate: daysAgo(30),
    endDate: null,
    color: '#6366f1',
  },
  {
    id: 'cls_4',
    name: 'Python Foundations — Practice Session',
    instructor: 'Self-study',
    location: 'Online',
    isOnline: true,
    dayOfWeek: 2, // Tuesday
    startTime: '20:00',
    endTime: '21:00',
    courseId: 'course_1',
    startDate: daysAgo(60),
    endDate: null,
    color: '#10b981',
  },
  {
    id: 'cls_5',
    name: 'Python Foundations — Practice Session',
    instructor: 'Self-study',
    location: 'Online',
    isOnline: true,
    dayOfWeek: 4, // Thursday
    startTime: '20:00',
    endTime: '21:00',
    courseId: 'course_1',
    startDate: daysAgo(60),
    endDate: null,
    color: '#10b981',
  },
  {
    id: 'cls_6',
    name: 'Weekly Career Review',
    instructor: 'Self-review',
    location: 'Home',
    isOnline: false,
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    endTime: '11:00',
    courseId: null,
    startDate: daysAgo(14),
    endDate: null,
    color: '#f59e0b',
  },
];
