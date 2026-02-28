import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import {
  HouseIcon,
  ChartBarIcon,
  FileTextIcon,
  GearIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CaretLeftIcon,
  CaretRightIcon,
  BellIcon,
  UserIcon,
  UsersIcon,

  ShoppingCartIcon,

  CurrencyDollarIcon,
  WalletIcon,

  BankIcon,

  ReceiptIcon,

  PackageIcon,

  TruckIcon,

  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CheckCircleIcon,

  XIcon,
  XCircleIcon,

  WarningIcon,

  InfoIcon,
  QuestionIcon,
  TrashIcon,
  PencilSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  LockOpenIcon,
  FingerprintIcon,
  ShieldIcon,
  ShieldCheckIcon,
  
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CameraIcon,
  MicrophoneIcon,
  ImageIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  PrinterIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  ListIcon,
  FunnelIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  LightningIcon,
  RobotIcon,
  ChatCircleIcon,
  PaperPlaneTiltIcon,
  SparkleIcon,
  StarIcon,
  HeartIcon,
  ThumbsUpIcon,

  CreditCardIcon,

  MoneyIcon,

  CurrencyCircleDollarIcon,
  CoinsIcon,

  HandshakeIcon,

  TrendUpIcon,
  TrendDownIcon,
  ChartLineIcon,

  ChartPieIcon,

  BuildingsIcon,

  StorefrontIcon,
  TagIcon,
  
  BarcodeIcon,
  QrCodeIcon,
  ScanIcon,
  SignOutIcon,
  SignInIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  TranslateIcon,
  CaretDownIcon,
  CaretUpIcon,
  ArrowsClockwiseIcon,
  CircleNotchIcon,
  IconProps as PhosphorIconProps,
} from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

// Map of icon names to their components
const iconMap = {
    // Navigation
    house: HouseIcon,
    dashboard: ChartBarIcon,
    chart: ChartBarIcon,
    file: FileTextIcon,
    settings: GearIcon,
    plus: PlusIcon,
    search: MagnifyingGlassIcon,
    'caret-left': CaretLeftIcon,
    'caret-right': CaretRightIcon,
    'caret-down': CaretDownIcon,
    'caret-up': CaretUpIcon,
    bell: BellIcon,
  
    // Users
    user: UserIcon,
    users: UsersIcon,
  
    // Commerce / Finance
    cart: ShoppingCartIcon,
    'shopping-cart': ShoppingCartIcon,
    currency: CurrencyDollarIcon,
    wallet: WalletIcon,
    bank: BankIcon,
    receipt: ReceiptIcon,
    package: PackageIcon,
    truck: TruckIcon,
    'credit-card': CreditCardIcon,
    money: MoneyIcon,
    coins: CoinsIcon,
    'currency-circle': CurrencyCircleDollarIcon,
    handshake: HandshakeIcon,
  
    // Arrows
    up: ArrowUpIcon,
    down: ArrowDownIcon,
    left: ArrowLeftIcon,
    right: ArrowRightIcon,
  
    // Status
    check: CheckIcon,
    success: CheckCircleIcon,
    close: XIcon,
    error: XCircleIcon,
    warning: WarningIcon,
    info: InfoIcon,
    question: QuestionIcon,
  
    // Actions
    delete: TrashIcon,
    trash: TrashIcon,
    edit: PencilSimpleIcon,
    view: EyeIcon,
    hide: EyeSlashIcon,
  
    // Security
    lock: LockIcon,
    unlock: LockOpenIcon,
    fingerprint: FingerprintIcon,
    shield: ShieldIcon,
    verified: ShieldCheckIcon,
  
    // Communication
    phone: PhoneIcon,
    email: EnvelopeIcon,
    envelope: EnvelopeIcon,
    location: MapPinIcon,
  
    // Time
    calendar: CalendarIcon,
    clock: ClockIcon,
  
    // Media
    camera: CameraIcon,
    mic: MicrophoneIcon,
    microphone: MicrophoneIcon,
    image: ImageIcon,
  
    // Share / Transfer
    share: ShareIcon,
    download: DownloadIcon,
    upload: UploadIcon,
    printer: PrinterIcon,
  
    // UI
    more: DotsThreeIcon,
    'more-vertical': DotsThreeVerticalIcon,
    list: ListIcon,
    filter: FunnelIcon,
    'sort-asc': SortAscendingIcon,
    'sort-desc': SortDescendingIcon,
  
    // AI / Tech
    lightning: LightningIcon,
    robot: RobotIcon,
    ai: RobotIcon,
    chat: ChatCircleIcon,
    send: PaperPlaneTiltIcon,
    sparkle: SparkleIcon,
  
    // Rating
    star: StarIcon,
    heart: HeartIcon,
    like: ThumbsUpIcon,
  
    // Analytics
    'trend-up': TrendUpIcon,
    'trend-down': TrendDownIcon,
    'chart-line': ChartLineIcon,
    'chart-pie': ChartPieIcon,
  
    // Business
    buildings: BuildingsIcon,
    storefront: StorefrontIcon,
    shop: StorefrontIcon,
    tag: TagIcon,
    barcode: BarcodeIcon,
    'qr-code': QrCodeIcon,
    scan: ScanIcon,
  
    // Auth
    login: SignInIcon,
    logout: SignOutIcon,
  
    // Theme
    sun: SunIcon,
    moon: MoonIcon,
  
    // Language
    globe: GlobeIcon,
    translate: TranslateIcon,
  
    // Loading
    refresh: ArrowsClockwiseIcon,
    loading: CircleNotchIcon,
  } as const;

export type IconName = keyof typeof iconMap;

interface IconComponentProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  style?: ViewStyle;
  mirrored?: boolean;
}

const PhosphorIconComponent: React.FC<IconComponentProps> = ({
  name,
  size = 24,
  color,
  weight = 'regular',
  style,
  mirrored = false,
}) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.text.primary;
  
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`PhosphorIcon: Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      color={iconColor}
      weight={weight}
      style={style}
      mirrored={mirrored}
    />
  );
};

export const PhosphorIcon = memo(PhosphorIconComponent);

// Export icon names for TypeScript autocomplete
export { iconMap };
