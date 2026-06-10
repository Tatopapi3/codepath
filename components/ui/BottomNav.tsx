'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Activity, Bot, BookOpen, User } from 'lucide-react';

const tabs = [
  { href: '/learn', icon: Map, label: 'Learn' },
  { href: '/activity', icon: Activity, label: 'Activity' },
  { href: '/codebot', icon: Bot, label: 'CodeBot' },
  { href: '/courses', icon: BookOpen, label: 'Courses' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[430px] items-center justify-around px-2 py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                active
                  ? 'text-blue-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon
                size={22}
                className={active ? 'fill-blue-400/20' : ''}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-blue-400' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
