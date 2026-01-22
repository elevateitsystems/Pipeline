'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
  showButton?: boolean; // If false, only show dropdown (no button)
  isOpen?: boolean; // Controlled open state when showButton is false
  onClose?: () => void; // Callback when dropdown should close
}

// Curated lucide-react icons list - most commonly used icons
const POPULAR_ICONS = [
  // Basic UI & Actions
  'Folder', 'FileText', 'Settings', 'User', 'Users', 'Edit', 'Trash', 'Save', 'Copy', 'Download', 'Upload',
  'Plus', 'Minus', 'X', 'Check', 'Search', 'Filter', 'Grid', 'List', 'Menu', 'MoreHorizontal', 'MoreVertical',
  
  // Navigation & Arrows
  'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp',
  'Home', 'Navigation', 'Compass', 'Map', 'MapPin', 'Globe', 'Link', 'ExternalLink',
  
  // Communication
  'Mail', 'MessageSquare', 'Phone', 'Video', 'Camera', 'Mic', 'Bell', 'Share', 'Send',
  
  // Media & Files
  'Image', 'Music', 'Film', 'Play', 'Pause', 'Stop', 'Volume2', 'File', 'Files', 'FolderOpen', 'FolderPlus',
  'FileCheck', 'FileX', 'FileImage', 'FileVideo', 'FileAudio', 'FileCode', 'FileZip',
  
  // Data & Charts
  'BarChart', 'PieChart', 'LineChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Pulse', 'Gauge',
  
  // Status & Alerts
  'CheckCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'Star', 'Heart', 'Bookmark', 'Tag', 'Flag',
  'Target', 'Award', 'Trophy', 'Medal', 'Crown',
  
  // Time & Calendar
  'Calendar', 'Clock', 'Timer', 'History',
  
  // Security & Access
  'Lock', 'Unlock', 'Shield', 'Key', 'Eye', 'EyeOff', 'Fingerprint',
  
  // Tools & Utilities
  'Scissors', 'Printer', 'Wrench', 'Tool', 'Hammer', 'Cog', 'Settings2', 'Zap', 'Battery', 'Wifi',
  'Power', 'PowerOff', 'RefreshCw', 'RefreshCcw', 'RotateCw', 'RotateCcw',
  
  // Business & Finance
  'ShoppingCart', 'CreditCard', 'DollarSign', 'Coins', 'Briefcase', 'Building', 'Store', 'Receipt',
  
  // Education & Learning
  'Book', 'BookOpen', 'GraduationCap', 'School', 'Library',
  
  // Technology
  'Code', 'Database', 'Server', 'Cloud', 'Computer', 'Laptop', 'Smartphone', 'Tablet', 'Monitor',
  'Cpu', 'HardDrive', 'Usb', 'Bluetooth', 'WifiOff',
  
  // Design & Creative
  'Palette', 'PenTool', 'Paintbrush', 'Layers', 'LayoutDashboard', 'Frame',
  
  // Shapes & Symbols
  'Circle', 'Square', 'Triangle', 'Hexagon', 'Diamond',
  
  // Weather & Nature
  'Sun', 'Moon', 'CloudRain', 'CloudSnow', 'CloudLightning', 'Umbrella', 'Droplet', 'Flame',
  'Leaf', 'Tree', 'Flower', 'Mountain',
  
  // Social & Brand
  'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github', 'Gitlab', 'Dribbble', 'Slack',
  
  // Miscellaneous
  'Package', 'Box', 'Archive', 'Gift', 'Rocket', 'Lightbulb', 'Sparkles', 'Wand2',
  'QrCode', 'Scan', 'Barcode', 'Ticket', 'Tags', 'Pin', 'Paperclip',
  'Clipboard', 'StickyNote', 'Notebook', 'Pen', 'Pencil', 'Highlighter',
  'Calculator', 'Stopwatch',
  'Coffee', 'Utensils', 'ShoppingBag', 'ShoppingBasket',
  'Car', 'Plane', 'Train', 'Bike', 'Ship', 'Truck',
  'Gamepad', 'Tv', 'Radio', 'Headphones', 'Speaker',
  'Smile', 'Laugh', 'Meh', 'Frown',
  'HelpCircle', 'XCircle',
  'PlusCircle', 'MinusCircle',
  'Maximize', 'Minimize', 'Shrink', 'Move',
  'Undo', 'Redo', 'Cut', 'Paste',
  'Bold', 'Italic', 'Underline', 'Strikethrough', 'AlignLeft', 'AlignCenter', 'AlignRight', 'AlignJustify',
  'ListOrdered',
  'LogIn', 'LogOut', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX',
  
  // Additional Common Icons
  'Airplay', 'Anchor', 'Asterisk', 'AtSign', 'Ban', 'BarChart2', 'BarChart3',
  'BatteryCharging', 'BatteryFull', 'BatteryLow', 'Beaker', 'BellOff',
  'BookmarkCheck', 'Bot', 'BoxSelect', 'BriefcaseBusiness', 'Bug', 'Building2',
  'CalendarCheck', 'CalendarDays', 'CalendarMinus', 'CalendarPlus', 'CalendarX',
  'CameraOff', 'Cast', 'CheckSquare', 'CircleDot', 'CircleEllipsis',
  'ClipboardCheck', 'ClipboardCopy', 'ClipboardList', 'ClipboardPaste', 'ClipboardX',
  'CloudDownload', 'CloudUpload', 'Command', 'Component',
  'Contact', 'Cookie', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp',
  'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Crop', 'Crosshair',
  'Cube', 'CupSoda', 'Cursor', 'Disc', 'Divide', 'Dna', 'DoorClosed', 'DoorOpen',
  'Dot', 'Droplets', 'Equal', 'EqualNot', 'Eraser', 'Euro',
  'FastForward', 'Feather', 'FileArchive', 'FileJson',
  'FileJson2', 'FileMinus', 'FilePlus', 'FileQuestion', 'FileSpreadsheet', 'FileWarning',
  'FilterX', 'Fish', 'FlagOff', 'Flashlight', 'FlashlightOff', 'FlipHorizontal', 'FlipVertical',
  'Focus', 'FolderMinus', 'FolderX', 'Forklift', 'Forward', 'Framer', 'FunctionSquare',
  'Gamepad2', 'Gem', 'Ghost', 'GitBranch', 'GitCommit', 'GitCompare', 'GitFork',
  'GitMerge', 'GitPullRequest', 'Glasses', 'Globe2', 'Grab', 'Grid3x3',
  'GripHorizontal', 'GripVertical', 'Hand', 'HandMetal', 'Hash', 'HeadphonesIcon',
  'Headset', 'Hop', 'HopOff', 'Hourglass', 'IceCream',
  'ImageOff', 'Import', 'Inbox', 'Indent', 'IndianRupee', 'Infinity',
  'JapaneseYen', 'Joystick', 'Kanban', 'KeyRound', 'KeySquare', 'Keyboard',
  'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp',
  'Languages', 'Lasso', 'LassoSelect', 'LifeBuoy', 'LightbulbOff',
  'Link2', 'Link2Off', 'ListChecks', 'ListFilter', 'ListMinus',
  'ListPlus', 'ListRestart', 'ListStart', 'ListTodo', 'ListX', 'Loader', 'Loader2',
  'Locate', 'LocateFixed', 'LocateOff', 'LockKeyhole', 'Luggage', 'MailOpen',
  'MailQuestion', 'MailSearch', 'MailWarning', 'MailX', 'MapPinOff', 'Maximize2',
  'Megaphone', 'MegaphoneOff', 'MemoryStick', 'Merge', 'MessageCircle',
  'MessageCircleDashed', 'MessageCirclePlus', 'MessageCircleQuestion', 'MessageCircleReply',
  'MessageCircleWarning', 'MessageCircleX', 'MessageSquareDashed', 'MessageSquareDiff',
  'MessageSquareDot', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply',
  'MessageSquareShare', 'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX',
  'MessagesSquare', 'MicOff', 'MicVocal', 'Microscope', 'Microwave', 'Milestone',
  'Minimize2', 'MinusSquare', 'MonitorCheck', 'MonitorDot', 'MonitorDown', 'MonitorOff',
  'MonitorPause', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop',
  'MonitorUp', 'MoonStar', 'Mouse', 'MousePointer', 'MousePointer2',
  'MousePointerClick', 'Move3d', 'MoveDiagonal', 'MoveDown', 'MoveDownLeft',
  'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft',
  'MoveUpRight', 'MoveVertical', 'Music2', 'Music3', 'Music4', 'Navigation2',
  'Navigation2Off', 'Network', 'Newspaper', 'Nfc', 'NotebookPen', 'NotebookTabs',
  'NotepadText', 'NotepadTextDashed', 'Nut', 'NutOff', 'Octagon', 'Option', 'Orbit',
  'Package2', 'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus',
  'PackageSearch', 'PackageX', 'Paintbrush2',
  'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeftClose', 'PanelLeftDashed',
  'PanelLeftOpen', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen',
  'Parentheses',
  'ParkingCircle', 'ParkingCircleOff', 'ParkingMeter', 'ParkingSquare', 'ParkingSquareOff',
  'PartyPopper', 'PauseCircle', 'PauseOctagon', 'PawPrint', 'PcCase', 'PenLine',
  'PencilLine', 'PencilOff', 'PencilRuler', 'Pentagon', 'Percent', 'PercentCircle',
  'PercentDiamond', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneMissed',
  'PhoneOff', 'PhoneOutgoing', 'Pi', 'Piano', 'Pickaxe', 'PictureInPicture',
  'PictureInPicture2', 'PiggyBank', 'Pilcrow', 'PilcrowLeft', 'PilcrowRight',
  'PinOff', 'Pipette', 'Pizza', 'PlaneLanding', 'PlaneTakeoff', 'PlayCircle',
  'PlaySquare', 'Plug', 'PlugZap', 'PlugZap2', 'PlusSquare', 'Pocket', 'PocketKnife',
  'Podcast', 'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling',
  'Presentation', 'PresentationChart', 'Projector', 'Puzzle', 'Pyramid', 'Quote',
  'Radical', 'RadioReceiver', 'RectangleEllipsis', 'RectangleHorizontal',
  'RectangleVertical', 'Recycle', 'Redo2', 'RedoDot', 'Refrigerator', 'Regex',
  'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'Replace', 'ReplaceAll',
  'Reply', 'ReplyAll', 'Rewind', 'RockingChair', 'RollerCoaster', 'Rotate3d',
  'Route', 'Router', 'Rows', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'Ruler',
  'RussianRuble', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish',
  'SaveAll', 'Scale', 'ScanBarcode', 'ScanEye', 'ScanFace', 'ScanLine',
  'ScanQrCode', 'ScanSearch', 'ScanText', 'ScissorsLineDashed', 'ScreenShare',
  'ScreenShareOff', 'Scroll', 'ScrollText', 'SearchCheck', 'SearchCode',
  'SearchSlash', 'SearchX', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal',
  'SeparatorVertical', 'ServerCog', 'ServerCrash', 'ServerOff', 'Shapes', 'Share2',
  'Sheet', 'ShieldAlert', 'ShieldCheck', 'ShieldClose', 'ShieldOff', 'ShieldQuestion',
  'ShieldX', 'ShipWheel', 'Shirt', 'Shovel', 'ShowerHead', 'Shrub',
  'Shuffle', 'Sidebar', 'SidebarClose', 'SidebarOpen', 'Sigma', 'Signal',
  'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Signature', 'Signpost',
  'SignpostBig', 'Siren', 'SkipBack', 'SkipForward', 'Skull', 'Slash', 'Slice',
  'Sliders', 'SlidersHorizontal', 'SmartphoneCharging', 'SmartphoneNfc', 'SmilePlus',
  'Snail', 'Snowflake', 'Sofa', 'Soup', 'Space', 'Spade', 'Sparkle', 'SpellCheck',
  'SpellCheck2', 'Spline', 'Split', 'SplitSquareHorizontal', 'SplitSquareVertical',
  'Spray', 'Sprout', 'SquareActivity', 'SquareArrowDown', 'SquareArrowDownLeft',
  'SquareArrowDownRight', 'SquareArrowLeft', 'SquareArrowRight', 'SquareArrowUp',
  'SquareArrowUpLeft', 'SquareArrowUpRight', 'SquareAsterisk', 'SquareBottomDashedScissors',
  'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight',
  'SquareChevronUp', 'SquareCode', 'SquareDashed', 'SquareDashedBottom',
  'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer',
  'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareFunction', 'SquareGanttChart',
  'SquareKanban', 'SquareLibrary', 'SquareM', 'SquareMenu', 'SquareMinus',
  'SquareMousePointer', 'SquareParking', 'SquareParkingOff', 'SquarePen',
  'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus',
  'SquarePower', 'SquareRadical', 'SquareScissors', 'SquareSigma', 'SquareSlash',
  'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareStack', 'SquareTerminal',
  'SquareUser', 'SquareUserRound', 'SquareX', 'Squircle', 'Squirrel', 'Stamp',
  'StarHalf', 'StarOff', 'Stars', 'StepBack', 'StepForward', 'Stethoscope',
  'Sticker', 'StopCircle', 'StretchHorizontal', 'StretchVertical', 'Subscript',
  'Subscript2', 'Subtitles', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow',
  'Sunrise', 'Sunset', 'Superscript', 'Superscript2', 'SwissFranc', 'SwitchCamera',
  'Sword', 'Swords', 'Syringe', 'Table2', 'TableCellsMerge', 'TableCellsSplit',
  'TableColumnsSplit', 'TableProperties', 'TableRowsSplit', 'TabletSmartphone',
  'Tablets', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5', 'Telescope',
  'Tent', 'TentTree', 'Terminal', 'TerminalSquare', 'TestTube', 'TestTube2',
  'TestTubes', 'Text', 'TextCursor', 'TextCursorInput', 'TextQuote', 'TextSearch',
  'TextSelect', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'TicketCheck',
  'TicketMinus', 'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX',
  'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Toilet', 'Tornado',
  'Touchpad', 'TouchpadOff', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone',
  'TrainFront', 'TrainFrontTunnel', 'TramFront', 'Transform', 'Trash2',
  'TreeDeciduous', 'TreeEvergreen', 'TreePine', 'Trees', 'TriangleAlert',
  'TriangleRight', 'Turtle', 'Tv2', 'Twitch', 'Type', 'UmbrellaOff', 'Undo2',
  'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'Unlink', 'Unlink2',
  'UnlockKeyhole', 'Unplug', 'UploadCloud', 'UserRound', 'UserRoundCheck',
  'UserRoundCog', 'UserRoundMinus', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundX',
  'UserSearch', 'UsersRound', 'UtensilsCrossed', 'UtilityPole', 'Variable',
  'Vault', 'Vegan', 'VenetianMask', 'Vibrate', 'VibrateOff', 'VideoOff',
  'Videotape', 'View', 'Voicemail', 'Volume', 'Volume1', 'VolumeX', 'Vote',
  'Wallet', 'WalletCards', 'Wallpaper', 'Wand', 'Warehouse', 'WashingMachine',
  'Watch', 'Waves', 'Waypoints', 'Webcam', 'Webhook', 'WebhookOff', 'Weight',
  'Wheat', 'WheatOff', 'WholeWord', 'Wind', 'WindArrowDown', 'WindArrowUp',
  'Wine', 'WineOff', 'Workflow', 'Worm', 'XOctagon', 'XSquare',
  'ZapOff', 'ZoomIn', 'ZoomOut'
] as const;

export default function IconPicker({
  value,
  onChange,
  placeholder = 'Select an icon',
  className = '',
  showButton = true,
  isOpen: controlledIsOpen,
  onClose,
}: IconPickerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Ensure we're mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use controlled isOpen if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    } else if (onClose && !value) {
      onClose();
    }
  };

  // Use hardcoded popular icons list
  const allIconNames = POPULAR_ICONS;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (!(target instanceof Element)) {
        return;
      }
      
      // First check: Is click inside the dropdown using ref (most reliable)
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return; // Don't close if clicking inside dropdown
      }
      
      // Second check: Is click inside the dropdown using data attribute
      if (target.closest('[data-icon-picker-dropdown]')) {
        return; // Don't close if clicking inside dropdown
      }
      
      // Third check: Is click inside the trigger container
      if (containerRef.current && containerRef.current.contains(target)) {
        return; // Don't close if clicking on trigger button
      }
      
      // If we get here, the click is outside - close the dropdown
      if (controlledIsOpen === undefined) {
        setInternalIsOpen(false);
      } else if (onClose) {
        onClose();
      }
    };

    // Use a longer delay to ensure the button click completes first
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, controlledIsOpen, onClose]);

  // Calculate dropdown position when it opens and update on scroll/resize
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 250;
      const dropdownWidth = 250;
      
      let top = showButton ? rect.bottom + 4 : rect.top;
      let left = rect.left;
      
      // Adjust if dropdown would go off bottom of screen
      if (top + dropdownHeight > window.innerHeight) {
        top = showButton ? rect.top - dropdownHeight - 4 : rect.bottom - dropdownHeight;
      }
      
      // Adjust if dropdown would go off right side of screen
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      
      // Ensure it doesn't go off left side
      if (left < 10) {
        left = 10;
      }
      
      setDropdownPosition({ top, left });
    };

    updatePosition();
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, showButton]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string; size?: number }>
    >)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  };

  const selectedIconComponent = value ? getIconComponent(value) : null;

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
      style={{ zIndex: isOpen ? 99999 : 'auto', position: 'relative' }}
    >
      {/* Trigger Button - only show if showButton is true */}
      {showButton && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          style={{ position: 'relative', zIndex: isOpen ? 99999 : 'auto' }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {value && selectedIconComponent ? (
              <>
                {selectedIconComponent}
                <span className="text-gray-700 truncate">{value}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Dropdown - Render via Portal to escape overflow constraints */}
      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          data-icon-picker-dropdown
          className="bg-white border border-gray-300 rounded-md shadow-xl"
          style={{
            width: '250px',
            height: '250px',
            display: 'flex',
            flexDirection: 'column',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 99999,
            position: 'fixed',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Icons Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-4 gap-2">
              {allIconNames.map((iconName) => {
                  const IconComponent = (LucideIcons as unknown as Record<
                    string,
                    React.ComponentType<{ className?: string; size?: number }>
                  >)[iconName];
                  if (!IconComponent) return null;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleIconSelect(iconName);
                      }}
                      className={`p-2 text-black bg-gray-50 rounded hover:bg-gray-100 flex items-center justify-center transition-colors ${
                        value === iconName
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'border border-gray-200 hover:border-gray-300'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

