'use client';

import { cn } from '@/lib/utils';

const Fullsscreen = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Fullsscreen;
