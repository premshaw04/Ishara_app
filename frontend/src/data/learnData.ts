export interface Sign {
  id: string;
  name: string;
  image?: any;
  meaning: string;
  usage: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  signCount: number;
}

export const DUMMY_CATEGORIES: Category[] = [
  { id: '1', name: 'Alphabet', icon: '🅰️', signCount: 26 },
  { id: '2', name: 'Numbers', icon: '🔢', signCount: 10 },
  { id: '3', name: 'Greetings', icon: '👋', signCount: 15 },
  { id: '4', name: 'Emotions', icon: '❤️', signCount: 12 },
  { id: '5', name: 'Emergency', icon: '⚠️', signCount: 8 },
  { id: '6', name: 'Daily Life', icon: '☕', signCount: 20 },
];

export const DUMMY_SIGNS: Sign[] = [
  {
    id: 's1',
    name: 'HELLO',
    categoryId: '3',
    meaning: 'A greeting or a way to say hello.',
    usage: 'Used when meeting someone or starting a conversation.',
    // We can use require for actual local images if we have them, for now undefined
  },
  {
    id: 's2',
    name: 'THANK YOU',
    categoryId: '3',
    meaning: 'An expression of gratitude.',
    usage: 'Used to show appreciation for something.',
  },
  {
    id: 's3',
    name: 'A',
    categoryId: '1',
    meaning: 'The letter A in the English alphabet.',
    usage: 'Used for spelling words.',
  },
  {
    id: 's4',
    name: 'B',
    categoryId: '1',
    meaning: 'The letter B in the English alphabet.',
    usage: 'Used for spelling words.',
  },
  {
    id: 's5',
    name: 'HELP',
    categoryId: '5',
    meaning: 'A request for assistance.',
    usage: 'Used in emergencies or when needing support.',
  },
  {
    id: 's6',
    name: 'WATER',
    categoryId: '6',
    meaning: 'A transparent fluid which forms the world\'s streams, lakes, oceans and rain.',
    usage: 'Used when asking for a drink.',
  },
  {
    id: 's7',
    name: 'HAPPY',
    categoryId: '4',
    meaning: 'Feeling or showing pleasure or contentment.',
    usage: 'Used to express joy or satisfaction.',
  },
];
