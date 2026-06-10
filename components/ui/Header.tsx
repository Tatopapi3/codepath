'use client';
import { Flame, Coins } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const user = useUserStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-3">
        {/* Left: rank or title */}
        <div className="flex flex-col">
          {title ? (
            <span className="text-sm font-semibold text-white">{title}</span>
          ) : (
            <>
              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                Rank
              </span>
              <span className="text-xs font-semibold text-blue-400">
                {user?.rank ?? 'Code Journey Initiate'}
              </span>
            </>
          )}
        </div>

        {/* Right: streak + coins */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={18} className="text-orange-400" />
            <span className="text-sm font-bold text-orange-400">
              {user?.streak ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🪙</span>
            <span className="text-sm font-bold text-yellow-400">
              {user?.coins ?? 0}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
