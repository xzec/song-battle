import { cn } from '~/utils/cn'

type Props = React.SVGProps<SVGSVGElement> & {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title?: string
  desc?: string
  inline?: boolean
  size?: string | number
}

export function Icon({
  icon: Comp,
  title,
  desc,
  inline,
  className,
  size,
  width = size,
  height = size,
  ...props
}: Props) {
  const notHidden = String(props['aria-hidden']) !== 'true'

  return (
    <Comp
      className={cn(className, inline && 'inline [vertical-align:-0.125em]')}
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      {...props}
    >
      {title && notHidden && <title>{title}</title>}
      {desc && notHidden && <desc>{desc}</desc>}
    </Comp>
  )
}
