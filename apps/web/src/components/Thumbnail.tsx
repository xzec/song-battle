import {
  type ComponentProps,
  cloneElement,
  isValidElement,
  useState,
} from 'react'
import { Icon } from '~/icons/misc/Icon'
import { Waveform } from '~/icons/Waveform'
import { cn } from '~/utils/cn'
import { removeEmpty } from '~/utils/remove-empty'

type Props = React.ComponentProps<'img'> & {
  size?: string | number
}

export function Thumbnail({
  src,
  ref,
  alt,
  className,
  size,
  width = size,
  height = size,
  children,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false)

  if (!src) return <PassThrough ref={ref}>{children}</PassThrough>

  return (
    <>
      <img
        src={src}
        ref={ref}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="eager"
        aria-hidden
        className={cn(
          'hidden select-none object-cover',
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

type NoImageProps = React.ComponentProps<'div'> &
  Pick<
    ComponentProps<typeof Icon>,
    'title' | 'desc' | 'inline' | 'size' | 'width' | 'height'
  >

export function NoImage({
  title,
  desc,
  inline,
  size,
  width,
  height,
  className,
  ...props
}: NoImageProps) {
  const iconProps = removeEmpty({
    title,
    desc,
    inline,
    size,
    width,
    height,
  })

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <Icon icon={Waveform} aria-hidden {...iconProps} />
    </div>
  )
}

function PassThrough({ children, ...props }: React.ComponentProps<'div'>) {
  if (isValidElement(children)) {
    return cloneElement(children, props)
  }
  return <>{children}</>
}
