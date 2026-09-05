import { getWeeklyLearningHours } from './dashboard';

export interface LearningHourDay extends Record<string, unknown> {
  day: string;
  hours: number;
}

/** Weekly learning hours computed from the user's real tasks. */
export function dailyLearningHours(): LearningHourDay[] {
  return getWeeklyLearningHours();
}