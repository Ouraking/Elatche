import type { Habit, Quote, TimerMode, TimerModeConfig, Video } from './types';

export const TIMER_MODES: Record<TimerMode, TimerModeConfig> = {
  focus: { label: 'Focus · 25', tabLabel: 'Focus', minutes: 25 },
  short: { label: 'Break · 5', tabLabel: 'Break', minutes: 5 },
  long: { label: 'Long · 15', tabLabel: 'Long Break', minutes: 15 },
};

export const TIMER_MODE_ORDER: readonly TimerMode[] = ['focus', 'short', 'long'];

export const DEFAULT_HABITS: readonly Habit[] = [
  { id: 'deep', label: 'Deep Work Block Completed', hint: '90 minutes, no context switching', fixed: true },
  { id: 'move', label: 'Physical Movement', hint: 'Train, walk, or stretch', fixed: true },
  { id: 'mind', label: 'Mindfulness / Reading', hint: '10 minutes of stillness or pages', fixed: true },
  { id: 'plan', label: 'Plan Tomorrow', hint: 'Define the next objective', fixed: true },
];

export const QUOTES: readonly Quote[] = [
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'The successful warrior is the average person, with laser-like focus.', author: 'Bruce Lee' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'Amateurs sit and wait for inspiration. The rest of us just get up and go to work.', author: 'Stephen King' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'Do the hard jobs first. The easy jobs will take care of themselves.', author: 'Dale Carnegie' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard' },
  { text: 'Hard choices, easy life. Easy choices, hard life.', author: 'Jerzy Gregorek' },
  { text: 'Suffer the pain of discipline or suffer the pain of regret.', author: 'Jim Rohn' },
];

export const VIDEOS: readonly Video[] = [
  { id: 'cyvJjowA5Ks', title: 'Discipline Your Mind', author: 'Motivational Instinct' },
  { id: 'uvbVzutfulU', title: 'Self Discipline · 1 Hour', author: 'Motiversity' },
  { id: 'ySOPZGmkPGM', title: 'Discipline Yourself', author: 'MotivationHub · Tom Brady' },
  { id: 'N-Qn3x7Hv0c', title: 'Discipline Is The Real Power', author: 'Titan Man' },
  { id: 'maljWFCQ3LI', title: 'Discipline Is Power', author: 'MotivationHub' },
];
