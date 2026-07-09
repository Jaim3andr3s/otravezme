import { BookOpenCheck, BookMarked, Crown, Heart, Brain, Sparkles, Grid3x3, Type, Puzzle, Compass, Award } from 'lucide-react';

export const ACHIEVEMENT_ICONS = {
  BookOpenCheck,
  BookMarked,
  Crown,
  Heart,
  Brain,
  Sparkles,
  Grid3x3,
  Type,
  Puzzle,
  Compass,
};

export function getAchievementIcon(name) {
  return ACHIEVEMENT_ICONS[name] || Award;
}
