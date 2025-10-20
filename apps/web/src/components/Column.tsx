import { cn } from '~/utils/cn'

export function Root({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function Title({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-center text-white/50 uppercase tracking-widest',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export function Content({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl bg-violet-500/30 p-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
