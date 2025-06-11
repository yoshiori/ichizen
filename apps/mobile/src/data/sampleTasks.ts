import { Task } from '../types/firebase';

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    text: {
      ja: 'ありがとうを言う',
      en: 'Say thank you'
    },
    category: {
      ja: '人間関係',
      en: 'Relationships'
    },
    icon: '💝'
  },
  {
    id: 'task-2',
    text: {
      ja: 'ゴミを一個拾う',
      en: 'Pick up one piece of trash'
    },
    category: {
      ja: '環境',
      en: 'Environment'
    },
    icon: '🌱'
  },
  {
    id: 'task-3',
    text: {
      ja: '机を掃除する',
      en: 'Clean your desk'
    },
    category: {
      ja: 'セルフケア',
      en: 'Self Care'
    },
    icon: '✨'
  },
  {
    id: 'task-4',
    text: {
      ja: '近所の人に挨拶をする',
      en: 'Greet your neighbors'
    },
    category: {
      ja: 'コミュニティ',
      en: 'Community'
    },
    icon: '👋'
  },
  {
    id: 'task-5',
    text: {
      ja: '誰かの手伝いをする',
      en: 'Help someone'
    },
    category: {
      ja: '親切',
      en: 'Kindness'
    },
    icon: '🤝'
  },
  {
    id: 'task-6',
    text: {
      ja: '深呼吸を3回する',
      en: 'Take 3 deep breaths'
    },
    category: {
      ja: 'セルフケア',
      en: 'Self Care'
    },
    icon: '🧘‍♀️'
  },
  {
    id: 'task-7',
    text: {
      ja: '植物に水をあげる',
      en: 'Water a plant'
    },
    category: {
      ja: '環境',
      en: 'Environment'
    },
    icon: '🪴'
  },
  {
    id: 'task-8',
    text: {
      ja: '笑顔で過ごす',
      en: 'Smile more today'
    },
    category: {
      ja: '親切',
      en: 'Kindness'
    },
    icon: '😊'
  }
];