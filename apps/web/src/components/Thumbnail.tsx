import { type ComponentProps, useState } from 'react'
import { Icon } from '~/icons/misc/Icon'
import { Waveform } from '~/icons/Waveform'
import { cn } from '~/utils/cn'

type Props = React.ComponentProps<'img'> & {
  size?: string | number
}

export function Thumbnail({
  src,
  alt,
  className,
  size,
  width = size,
  height = size,
  children,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false)

  if (!src) return children

  return (
    <>
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="eager"
        aria-hidden
        className={cn(
          'loaded:block hidden select-none object-cover',
          loaded && 'block',
          className,
        )}
        width={width}
        height={height}
        {...props}
      />
      {!loaded && children}
    </>
  )
}

type NoImageProps = React.ComponentProps<'div'> & {
  iconProps?: ComponentProps<typeof Icon>
}

export function NoImage({ iconProps, className, ...props }: NoImageProps) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <Icon
        icon={Waveform}
        viewBox="-128 -128 512 512"
        aria-hidden
        {...iconProps}
      />
    </div>
  )
}
