interface IconList {
  name: string
  category: string
  icon_order: number
}

const iconList: IconList[] = [
  // Interface
  {
    name: 'pawlicy',
    category: 'interface',
    icon_order: 1,
  },
  {
    name: 'add',
    category: 'interface',
    icon_order: 2,
  },
  {
    name: 'add_thick',
    category: 'interface',
    icon_order: 3,
  },
  {
    name: 'edit',
    category: 'interface',
    icon_order: 4,
  },
  {
    name: 'delete',
    category: 'interface',
    icon_order: 5,
  },
  {
    name: 'search',
    category: 'interface',
    icon_order: 6,
  },
  {
    name: 'more_vertical',
    category: 'interface',
    icon_order: 7,
  },
  {
    name: 'more_horizontal',
    category: 'interface',
    icon_order: 8,
  },
  {
    name: 'settings_1',
    category: 'interface',
    icon_order: 9,
  },
  {
    name: 'settings_2',
    category: 'interface',
    icon_order: 10,
  },
  {
    name: 'filter_1',
    category: 'interface',
    icon_order: 11,
  },
  {
    name: 'filter_2',
    category: 'interface',
    icon_order: 12,
  },
  {
    name: 'sort',
    category: 'interface',
    icon_order: 13,
  },
  {
    name: 'download_1',
    category: 'interface',
    icon_order: 14,
  },
  {
    name: 'download_2',
    category: 'interface',
    icon_order: 15,
  },
  {
    name: 'website',
    category: 'interface',
    icon_order: 16,
  },
  {
    name: 'add_outline',
    category: 'interface',
    icon_order: 17,
  },
  {
    name: 'add_solid',
    category: 'interface',
    icon_order: 18,
  },
  {
    name: 'remove_outline',
    category: 'interface',
    icon_order: 19,
  },
  {
    name: 'remove_solid',
    category: 'interface',
    icon_order: 20,
  },
  {
    name: 'lock',
    category: 'interface',
    icon_order: 21,
  },
  {
    name: 'unlock',
    category: 'interface',
    icon_order: 22,
  },
  {
    name: 'secure',
    category: 'interface',
    icon_order: 23,
  },
  {
    name: 'key',
    category: 'interface',
    icon_order: 24,
  },
  {
    name: 'attach_vertical',
    category: 'interface',
    icon_order: 25,
  },
  {
    name: 'attach_horizontal',
    category: 'interface',
    icon_order: 26,
  },

  // Content
  {
    name: 'checkbox_empty',
    category: 'content',
    icon_order: 1,
  },
  {
    name: 'checkbox_indeterminate',
    category: 'content',
    icon_order: 2,
  },
  {
    name: 'checkbox_checked',
    category: 'content',
    icon_order: 3,
  },
  {
    name: 'radio_unselected',
    category: 'content',
    icon_order: 4,
  },
  {
    name: 'radio_selected',
    category: 'content',
    icon_order: 5,
  },
  {
    name: 'check_circle',
    category: 'content',
    icon_order: 6,
  },
  {
    name: 'cut',
    category: 'content',
    icon_order: 7,
  },
  {
    name: 'content',
    category: 'content',
    icon_order: 8,
  },
  {
    name: 'clipboard',
    category: 'content',
    icon_order: 9,
  },
  {
    name: 'inventory',
    category: 'content',
    icon_order: 10,
  },
  {
    name: 'note',
    category: 'content',
    icon_order: 11,
  },
  {
    name: 'edit_note',
    category: 'content',
    icon_order: 12,
  },
  {
    name: 'list',
    category: 'content',
    icon_order: 13,
  },
  {
    name: 'folder',
    category: 'content',
    icon_order: 14,
  },
  {
    name: 'pdf',
    category: 'content',
    icon_order: 15,
  },
  {
    name: 'webhook',
    category: 'content',
    icon_order: 16,
  },
  {
    name: 'assignment_complete',
    category: 'content',
    icon_order: 17,
  },
  {
    name: 'assignment_late',
    category: 'content',
    icon_order: 18,
  },

  // Navigation
  {
    name: 'arrow_left',
    category: 'navigation',
    icon_order: 1,
  },
  {
    name: 'arrow_right',
    category: 'navigation',
    icon_order: 2,
  },
  {
    name: 'arrow_up',
    category: 'navigation',
    icon_order: 3,
  },
  {
    name: 'arrow_down',
    category: 'navigation',
    icon_order: 4,
  },
  {
    name: 'chevron_left',
    category: 'navigation',
    icon_order: 5,
  },
  {
    name: 'chevron_right',
    category: 'navigation',
    icon_order: 6,
  },
  {
    name: 'chevron_up',
    category: 'navigation',
    icon_order: 7,
  },
  {
    name: 'chevron_down',
    category: 'navigation',
    icon_order: 8,
  },
  {
    name: 'forward-1',
    category: 'navigation',
    icon_order: 9,
  },
  {
    name: 'back',
    category: 'navigation',
    icon_order: 10,
  },
  {
    name: 'triangle_left',
    category: 'navigation',
    icon_order: 11,
  },
  {
    name: 'triangle_right',
    category: 'navigation',
    icon_order: 12,
  },
  {
    name: 'triangle_up',
    category: 'navigation',
    icon_order: 13,
  },
  {
    name: 'triangle_down',
    category: 'navigation',
    icon_order: 14,
  },
  {
    name: 'forward',
    category: 'navigation',
    icon_order: 15,
  },
  {
    name: 'keyboard_return',
    category: 'navigation',
    icon_order: 16,
  },
  {
    name: 'zoom_in',
    category: 'navigation',
    icon_order: 17,
  },
  {
    name: 'zoom_out',
    category: 'navigation',
    icon_order: 18,
  },

  // Alerts
  {
    name: 'bookmark',
    category: 'alerts',
    icon_order: 1,
  },
  {
    name: 'star_solid',
    category: 'alerts',
    icon_order: 2,
  },
  {
    name: 'star_half',
    category: 'alerts',
    icon_order: 3,
  },
  {
    name: 'star_outline',
    category: 'alerts',
    icon_order: 4,
  },
  {
    name: 'notification',
    category: 'alerts',
    icon_order: 5,
  },
  {
    name: 'notification_important',
    category: 'alerts',
    icon_order: 6,
  },
  {
    name: 'favorite_solid',
    category: 'alerts',
    icon_order: 7,
  },
  {
    name: 'flag',
    category: 'alerts',
    icon_order: 8,
  },
  {
    name: 'double_arrow',
    category: 'alerts',
    icon_order: 9,
  },
  {
    name: 'thick_arrow',
    category: 'alerts',
    icon_order: 10,
  },
  {
    name: 'bookmark_solid',
    category: 'alerts',
    icon_order: 11,
  },
  {
    name: 'bookmark_outline',
    category: 'alerts',
    icon_order: 12,
  },
  {
    name: 'like',
    category: 'alerts',
    icon_order: 13,
  },
  {
    name: 'dislike',
    category: 'alerts',
    icon_order: 14,
  },
  {
    name: 'verified',
    category: 'alerts',
    icon_order: 15,
  },
  {
    name: 'certified',
    category: 'alerts',
    icon_order: 16,
  },
  {
    name: 'lightbulb',
    category: 'alerts',
    icon_order: 17,
  },
  {
    name: 'lightbulb_solid',
    category: 'alerts',
    icon_order: 18,
  },
  {
    name: 'info_outline',
    category: 'alerts',
    icon_order: 19,
  },
  {
    name: 'info_solid',
    category: 'alerts',
    icon_order: 20,
  },
  {
    name: 'help_outline',
    category: 'alerts',
    icon_order: 21,
  },
  {
    name: 'help_solid',
    category: 'alerts',
    icon_order: 22,
  },
  {
    name: 'question',
    category: 'alerts',
    icon_order: 23,
  },
  {
    name: 'warning',
    category: 'alerts',
    icon_order: 24,
  },
  {
    name: 'pin',
    category: 'alerts',
    icon_order: 25,
  },
  {
    name: 'label',
    category: 'alerts',
    icon_order: 26,
  },
  {
    name: 'report',
    category: 'alerts',
    icon_order: 27,
  },

  // Compare
  {
    name: 'yes',
    category: 'compare',
    icon_order: 1,
  },
  {
    name: 'yes_thick',
    category: 'compare',
    icon_order: 2,
  },
  {
    name: 'yes_circle',
    category: 'compare',
    icon_order: 3,
  },
  {
    name: 'no',
    category: 'compare',
    icon_order: 4,
  },
  {
    name: 'no_thick',
    category: 'compare',
    icon_order: 5,
  },
  {
    name: 'no_circle',
    category: 'compare',
    icon_order: 6,
  },
  {
    name: 'check',
    category: 'compare',
    icon_order: 7,
  },
  {
    name: 'check_circle',
    category: 'compare',
    icon_order: 8,
  },
  {
    name: 'dont',
    category: 'compare',
    icon_order: 9,
  },
  {
    name: 'compare',
    category: 'compare',
    icon_order: 10,
  },
  {
    name: 'balance',
    category: 'compare',
    icon_order: 11,
  },
  {
    name: 'data_1',
    category: 'compare',
    icon_order: 12,
  },
  {
    name: 'data_2',
    category: 'compare',
    icon_order: 13,
  },
  {
    name: 'data_3',
    category: 'compare',
    icon_order: 14,
  },
  {
    name: 'pie_chart',
    category: 'compare',
    icon_order: 15,
  },
  {
    name: 'line_graph',
    category: 'compare',
    icon_order: 16,
  },
  {
    name: 'table',
    category: 'compare',
    icon_order: 17,
  },

  // Social
  {
    name: 'reddit',
    category: 'social',
    icon_order: 1,
  },
  {
    name: 'angellist',
    category: 'social',
    icon_order: 2,
  },
  {
    name: 'facebook',
    category: 'social',
    icon_order: 3,
  },
  {
    name: 'instagram',
    category: 'social',
    icon_order: 4,
  },
  {
    name: 'linkedin',
    category: 'social',
    icon_order: 5,
  },
  {
    name: 'twitter',
    category: 'social',
    icon_order: 6,
  },
  {
    name: 'youtube',
    category: 'social',
    icon_order: 7,
  },

  // People
  {
    name: 'account',
    category: 'account',
    icon_order: 1,
  },
  {
    name: 'male',
    category: 'account',
    icon_order: 2,
  },
  {
    name: 'female',
    category: 'account',
    icon_order: 3,
  },
  {
    name: 'man',
    category: 'account',
    icon_order: 4,
  },
  {
    name: 'woman',
    category: 'account',
    icon_order: 5,
  },
  {
    name: 'girl',
    category: 'account',
    icon_order: 6,
  },
  {
    name: 'boy',
    category: 'account',
    icon_order: 7,
  },
  {
    name: 'parent_child',
    category: 'account',
    icon_order: 8,
  },
  {
    name: 'family',
    category: 'account',
    icon_order: 9,
  },
  {
    name: 'couple',
    category: 'account',
    icon_order: 10,
  },
  {
    name: 'person',
    category: 'account',
    icon_order: 11,
  },
  {
    name: 'happy',
    category: 'account',
    icon_order: 12,
  },
  {
    name: 'neutral',
    category: 'account',
    icon_order: 13,
  },
  {
    name: 'sad',
    category: 'account',
    icon_order: 14,
  },
  {
    name: 'accessible',
    category: 'account',
    icon_order: 15,
  },
  {
    name: 'not_accessible',
    category: 'account',
    icon_order: 16,
  },

  // Pets
  {
    name: 'cat',
    category: 'pets',
    icon_order: 1,
  },
  {
    name: 'dog',
    category: 'pets',
    icon_order: 2,
  },
  {
    name: 'pets',
    category: 'pets',
    icon_order: 3,
  },
  {
    name: 'fleas',
    category: 'pets',
    icon_order: 4,
  },
  {
    name: 'mouse',
    category: 'pets',
    icon_order: 5,
  },

  // Medical
  {
    name: 'emergency',
    category: 'medical',
    icon_order: 1,
  },
  {
    name: 'ambulance',
    category: 'medical',
    icon_order: 2,
  },
  {
    name: 'medical_care',
    category: 'medical',
    icon_order: 3,
  },
  {
    name: 'hospital',
    category: 'medical',
    icon_order: 4,
  },
  {
    name: 'vaccines',
    category: 'medical',
    icon_order: 5,
  },
  {
    name: 'covid',
    category: 'medical',
    icon_order: 6,
  },
  {
    name: 'medical_information',
    category: 'medical',
    icon_order: 7,
  },
  {
    name: 'medical_services',
    category: 'medical',
    icon_order: 8,
  },
  {
    name: 'health_safety',
    category: 'medical',
    icon_order: 9,
  },
  {
    name: 'care',
    category: 'medical',
    icon_order: 10,
  },
  {
    name: 'help',
    category: 'medical',
    icon_order: 11,
  },

  // Finance
  {
    name: 'savings',
    category: 'finance',
    icon_order: 1,
  },
  {
    name: 'money_1',
    category: 'finance',
    icon_order: 2,
  },
  {
    name: 'money_2',
    category: 'finance',
    icon_order: 3,
  },
  {
    name: 'wallet',
    category: 'finance',
    icon_order: 4,
  },
  {
    name: 'credit_card',
    category: 'finance',
    icon_order: 5,
  },
  {
    name: 'shopping_cart',
    category: 'finance',
    icon_order: 6,
  },
  {
    name: 'deal',
    category: 'finance',
    icon_order: 7,
  },
  {
    name: 'deal_heart',
    category: 'finance',
    icon_order: 8,
  },
  {
    name: 'shop',
    category: 'finance',
    icon_order: 9,
  },
  {
    name: 'receipt_1',
    category: 'finance',
    icon_order: 10,
  },
  {
    name: 'receipt_2',
    category: 'finance',
    icon_order: 11,
  },

  // Lifestyle
  {
    name: 'summer',
    category: 'lifestyle',
    icon_order: 1,
  },
  {
    name: 'winter',
    category: 'lifestyle',
    icon_order: 2,
  },
  {
    name: 'temperature',
    category: 'lifestyle',
    icon_order: 3,
  },
  {
    name: 'tree',
    category: 'lifestyle',
    icon_order: 4,
  },
  {
    name: 'night',
    category: 'lifestyle',
    icon_order: 5,
  },
  {
    name: 'day',
    category: 'lifestyle',
    icon_order: 6,
  },
  {
    name: 'food_1',
    category: 'lifestyle',
    icon_order: 7,
  },
  {
    name: 'food_2',
    category: 'lifestyle',
    icon_order: 8,
  },
  {
    name: 'fix_1',
    category: 'lifestyle',
    icon_order: 9,
  },
  {
    name: 'fix_2',
    category: 'lifestyle',
    icon_order: 10,
  },
  {
    name: 'build',
    category: 'lifestyle',
    icon_order: 11,
  },
  {
    name: 'luggage',
    category: 'lifestyle',
    icon_order: 12,
  },
  {
    name: 'travel',
    category: 'lifestyle',
    icon_order: 13,
  },
  {
    name: 'car',
    category: 'lifestyle',
    icon_order: 14,
  },
  {
    name: 'suitcase_1',
    category: 'lifestyle',
    icon_order: 15,
  },
  {
    name: 'suitcase_2',
    category: 'lifestyle',
    icon_order: 16,
  },
  {
    name: 'outdoors',
    category: 'lifestyle',
    icon_order: 17,
  },
  {
    name: 'recycle',
    category: 'lifestyle',
    icon_order: 18,
  },
  {
    name: 'sports',
    category: 'lifestyle',
    icon_order: 19,
  },
  {
    name: 'science',
    category: 'lifestyle',
    icon_order: 20,
  },
  {
    name: 'doodle',
    category: 'lifestyle',
    icon_order: 21,
  },
  {
    name: 'flashlight',
    category: 'lifestyle',
    icon_order: 22,
  },

  // Time
  {
    name: 'alarm',
    category: 'time',
    icon_order: 1,
  },
  {
    name: 'clock_outline',
    category: 'time',
    icon_order: 2,
  },
  {
    name: 'clock_solid',
    category: 'time',
    icon_order: 3,
  },
  {
    name: 'calendar',
    category: 'time',
    icon_order: 4,
  },
  {
    name: 'calendar_month',
    category: 'time',
    icon_order: 5,
  },
  {
    name: 'calendar_edit',
    category: 'time',
    icon_order: 6,
  },
  {
    name: 'location_outline',
    category: 'time',
    icon_order: 7,
  },
  {
    name: 'location_solid',
    category: 'time',
    icon_order: 8,
  },
  {
    name: 'home',
    category: 'time',
    icon_order: 9,
  },
  {
    name: 'world',
    category: 'time',
    icon_order: 10,
  },
  {
    name: 'map',
    category: 'time',
    icon_order: 11,
  },

  // Devices
  {
    name: 'desktop',
    category: 'devices',
    icon_order: 1,
  },
  {
    name: 'laptop',
    category: 'devices',
    icon_order: 2,
  },
  {
    name: 'tablet',
    category: 'devices',
    icon_order: 3,
  },
  {
    name: 'phone',
    category: 'devices',
    icon_order: 4,
  },
  {
    name: 'watch',
    category: 'devices',
    icon_order: 5,
  },
  {
    name: 'devices',
    category: 'devices',
    icon_order: 6,
  },
  {
    name: 'printer',
    category: 'devices',
    icon_order: 7,
  },

  // Media
  {
    name: 'chat',
    category: 'mei',
    icon_order: 1,
  },
  {
    name: 'phone',
    category: 'mei',
    icon_order: 2,
  },
  {
    name: 'email',
    category: 'mei',
    icon_order: 3,
  },
  {
    name: 'sms',
    category: 'mei',
    icon_order: 4,
  },
  {
    name: 'mms',
    category: 'mei',
    icon_order: 5,
  },
  {
    name: 'conversation',
    category: 'mei',
    icon_order: 6,
  },
  {
    name: 'quotation',
    category: 'mei',
    icon_order: 7,
  },
  {
    name: 'wifi',
    category: 'mei',
    icon_order: 8,
  },
  {
    name: 'bluetooth',
    category: 'mei',
    icon_order: 9,
  },
  {
    name: 'headphones',
    category: 'mei',
    icon_order: 10,
  },
  {
    name: 'microphone',
    category: 'mei',
    icon_order: 11,
  },
  {
    name: 'video',
    category: 'mei',
    icon_order: 12,
  },
  {
    name: 'book',
    category: 'mei',
    icon_order: 13,
  },
  {
    name: 'photo',
    category: 'mei',
    icon_order: 14,
  },
  {
    name: 'image',
    category: 'mei',
    icon_order: 15,
  },
  {
    name: 'movie',
    category: 'mei',
    icon_order: 16,
  },
  {
    name: 'play',
    category: 'mei',
    icon_order: 17,
  },
  {
    name: 'play_circle',
    category: 'mei',
    icon_order: 18,
  },
  {
    name: 'pause',
    category: 'mei',
    icon_order: 19,
  },
  {
    name: 'pause_circle',
    category: 'mei',
    icon_order: 20,
  },
  {
    name: 'music',
    category: 'mei',
    icon_order: 21,
  },
  {
    name: 'sound',
    category: 'mei',
    icon_order: 22,
  },
  {
    name: 'mute',
    category: 'mei',
    icon_order: 23,
  },
]

interface IconType {
  type: string
  name: string
  content: string
}

const iconType: IconType[] = [
  { type: 'int', name: 'interface', content: '<span class="icon-pawlicy"></span>' },
  { type: 'con', name: 'content', content: '<span class="icon-checkbox_empty"></span>' },
  { type: 'nav', name: 'food', content: '<span class="icon-arrow_left"></span>' },
  { type: 'ale', name: 'alerts', content: '<span class="icon-bookmark"></span>' },
  { type: 'com', name: 'compare', content: '<span class="icon-yes"></span>' },
  { type: 'soc', name: 'social', content: '<span class="icon-reddit"></span>' },
  { type: 'acc', name: 'account', content: '<span class="icon-account"></span>' },
  { type: 'pet', name: 'pets', content: '<span class="icon-pets"></span>' },
  { type: 'med', name: 'medical', content: '<span class="icon-emergency"></span>' },
  { type: 'fin', name: 'finance', content: '<span class="icon-savings"></span>' },
  { type: 'lif', name: 'lifestyle', content: '<span class="icon-summer"></span>' },
  { type: 'tim', name: 'time', content: '<span class="icon-alarm"></span>' },
  { type: 'dev', name: 'devices', content: '<span class="icon-desktop"></span>' },
  { type: 'mei', name: 'media', content: '<span class="icon-chat"></span>' },
]

type IconMap = Record<string, { item: IconList }>

const iconMap: IconMap = {}

iconList.forEach(iconListObject => {
  iconMap[iconListObject.name] = {
    item: iconListObject,
  }
})

export { iconList, iconMap, iconType }
