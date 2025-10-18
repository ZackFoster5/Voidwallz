import React from 'react'
import {
  // Core
  ArrowRight01Icon,
  Download02Icon,
  FavouriteIcon,
  GlobeIcon,
  PuzzleIcon,
  SmartPhone01Icon,
  TruckIcon,
  RocketIcon,
  GridViewIcon,
  UserCircleIcon,
  UserIcon,
  Image01Icon,
  PencilEdit01Icon,
  Shield01Icon,
  LockIcon,
  Key01Icon,
  ArrowUpRight01Icon,
  ArrowReloadHorizontalIcon,
  CreditCardIcon,
  Calendar02Icon,
  CheckmarkCircle01Icon,
  SchoolBell01Icon,
  InformationCircleIcon,
  Cancel01Icon,
  Share02Icon,
  EyeIcon,
  AiSearchIcon,
  FilterIcon,
  Logout02Icon,
  Sun02Icon,
  MoonIcon,
  StarIcon,
  UserGroupIcon,
  MagicWand02Icon,
} from 'hugeicons-react'

export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'arrow-path'
  | 'check'
  | 'check-circle'
  | 'star'
  | 'users'
  | 'user'
  | 'user-circle'
  | 'download'
  | 'heart'
  | 'sparkles'
  | 'globe'
  | 'puzzle'
  | 'phone'
  | 'truck'
  | 'rocket'
  | 'grid'
  | 'photo'
  | 'pencil-square'
  | 'shield'
  | 'lock-closed'
  | 'key'
  | 'credit-card'
  | 'calendar-days'
  | 'bell'
  | 'info'
  | 'x-mark'
  | 'share'
  | 'eye'
  | 'magnifying-glass'
  | 'funnel'
  | 'logout'
  | 'sun'
  | 'moon'

const iconMap: Record<IconName, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  'arrow-right': ArrowRight01Icon,
  'arrow-up-right': ArrowUpRight01Icon,
  'arrow-path': ArrowReloadHorizontalIcon,
  check: CheckmarkCircle01Icon,
  'check-circle': CheckmarkCircle01Icon,
  star: StarIcon,
  users: UserGroupIcon,
  user: UserIcon,
  'user-circle': UserCircleIcon,
  download: Download02Icon,
  heart: FavouriteIcon,
  sparkles: MagicWand02Icon,
  globe: GlobeIcon,
  puzzle: PuzzleIcon,
  phone: SmartPhone01Icon,
  truck: TruckIcon,
  rocket: RocketIcon,
  grid: GridViewIcon,
  photo: Image01Icon,
  'pencil-square': PencilEdit01Icon,
  shield: Shield01Icon,
  'lock-closed': LockIcon,
  key: Key01Icon,
  'credit-card': CreditCardIcon,
  'calendar-days': Calendar02Icon,
  bell: SchoolBell01Icon,
  info: InformationCircleIcon,
  'x-mark': Cancel01Icon,
  share: Share02Icon,
  eye: EyeIcon,
  'magnifying-glass': AiSearchIcon,
  funnel: FilterIcon,
  logout: Logout02Icon,
  sun: Sun02Icon,
  moon: MoonIcon,
}

export type IconProps = {
  name: IconName
  size?: number | string
  className?: string
  title?: string
} & Omit<React.SVGProps<SVGSVGElement>, 'name' | 'ref'>

export function Icon({ name, size, className, title, ...rest }: IconProps) {
  const Cmp = iconMap[name]
  if (!Cmp) return null
  // Intentionally do not set a default `size` so Tailwind `w-*/h-*` classes can drive sizing.
  return (
    <Cmp
      size={size}
      className={className}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    />
  )
}
