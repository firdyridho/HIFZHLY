import { type ElementType, type ReactNode, type ComponentPropsWithoutRef } from 'react';

type StarBorderProps<T extends ElementType = 'button'> = {
  as?: T;
  className?: string;
  color?: string;
  speed?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export default function StarBorder<T extends ElementType = 'button'>({
  as,
  className = '',
  color = '#10b981',
  speed = '4.5s',
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = as || 'button';

  return (
    <Component
      className={`relative inline-flex items-center justify-center p-[1.5px] overflow-hidden rounded-2xl group transition-all duration-300 active:scale-[0.98] ${className}`}
      {...rest}
    >
      {/* React Bits Traveling Star Light: Bottom Gradient */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute w-[300%] h-[60%] opacity-75 bottom-[-14px] right-[-250%] rounded-full animate-star-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 14%)`,
          animationDuration: speed,
        }}
      />
      {/* React Bits Traveling Star Light: Top Gradient */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute w-[300%] h-[60%] opacity-75 top-[-14px] left-[-250%] rounded-full animate-star-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 14%)`,
          animationDuration: speed,
        }}
      />
      {/* Inner surface */}
      <div className="relative z-[1] w-full h-full flex items-center justify-center rounded-[14px]">
        {children}
      </div>
    </Component>
  );
}
