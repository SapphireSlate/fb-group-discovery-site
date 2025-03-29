'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminNavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}

export default function AdminNavLink({ href, icon, children, exact = false }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact 
    ? pathname === href
    : pathname.startsWith(href) && href !== '/';
  
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start text-sm font-medium",
          isActive ? "bg-muted" : "hover:bg-transparent hover:underline"
        )}
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
} 