import { Lock } from 'lucide-react';
import { getAchievementIcon } from '../../constants/achievementIcons.js';

export function BadgeTile({ achievement, earned }) {
  const Icon = getAchievementIcon(achievement.icon);

  return (
    <div
      className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition ${
        earned ? 'bg-surface border-edge shadow-sm' : 'bg-surface-alt border-edge/60 opacity-60'
      }`}
      title={achievement.description}
    >
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 ${
          earned ? 'bg-gradient-to-b from-gold to-accent border-surface shadow-md' : 'bg-surface-alt border-edge'
        }`}
      >
        {earned ? (
          <Icon className="w-7 h-7 text-white" />
        ) : (
          <Lock className="w-6 h-6 text-ink-muted" />
        )}
      </div>
      <p className={`text-xs font-semibold ${earned ? 'text-ink' : 'text-ink-muted'}`}>{achievement.title}</p>
    </div>
  );
}
