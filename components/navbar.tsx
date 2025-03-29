import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl mr-6 flex items-center">
          FB Group Finder
        </Link>
        
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link 
            href="/discover" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Discover
          </Link>
          <Link 
            href="/categories" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Categories
          </Link>
          <Link 
            href="/submit" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Submit Group
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About
          </Link>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <form className="hidden md:block relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="pl-8"
            />
          </form>
          <UserNav />
        </div>
      </div>
    </nav>
  );
}

