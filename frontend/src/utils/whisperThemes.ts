// Daily themes for WhisperWall
export interface WhisperTheme {
  name: string;
  backgroundColor: string;
  headerColor: string;
  textColor: string;
  accentColor: string;
  bubbleColors: string[];
  particleType: 'stars' | 'fog' | 'hearts' | 'rain' | 'sparkles' | 'none';
  mood: 'happy' | 'mysterious' | 'calm' | 'energetic' | 'romantic' | 'melancholic';
}

const themes: WhisperTheme[] = [
  {
    name: '🌌 Cosmic Night',
    backgroundColor: '#0a0e27',
    headerColor: '#1a1f3a',
    textColor: '#e0e6ff',
    accentColor: '#6366f1',
    bubbleColors: ['#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed'],
    particleType: 'stars',
    mood: 'mysterious',
  },
  {
    name: '🌸 Calm Pastels',
    backgroundColor: '#fef3f8',
    headerColor: '#fce7f3',
    textColor: '#831843',
    accentColor: '#ec4899',
    bubbleColors: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6'],
    particleType: 'none',
    mood: 'calm',
  },
  {
    name: '⚡ Neon Rush',
    backgroundColor: '#0a0a15', // Darker, stormier
    headerColor: '#15152a',
    textColor: '#00ffff', // Electric cyan
    accentColor: '#ff00ff', // Electric magenta
    bubbleColors: ['#ff00ff', '#00ffff', '#ff0080', '#00ff00'], // Electric neon colors
    particleType: 'sparkles',
    mood: 'energetic',
  },
  {
    name: '🌊 Ocean Depths',
    backgroundColor: '#001f3f',
    headerColor: '#003d5c',
    textColor: '#7fdbff',
    accentColor: '#39cccc',
    bubbleColors: ['#001f3f', '#003d5c', '#0074d9', '#39cccc'],
    particleType: 'none',
    mood: 'calm',
  },
  {
    name: '🔥 Solar Burst',
    backgroundColor: '#1a0505',
    headerColor: '#2d0a0a',
    textColor: '#ffedd5',
    accentColor: '#f97316',
    bubbleColors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c'],
    particleType: 'sparkles',
    mood: 'energetic',
  },
  {
    name: '💜 Twilight Dreams',
    backgroundColor: '#1e1b4b',
    headerColor: '#312e81',
    textColor: '#e0e7ff',
    accentColor: '#a78bfa',
    bubbleColors: ['#4c1d95', '#5b21b6', '#7c3aed', '#a78bfa'],
    particleType: 'stars',
    mood: 'mysterious',
  },
  {
    name: '❤️ Love Whispers',
    backgroundColor: '#2d0a0f',
    headerColor: '#4a0e1a',
    textColor: '#fecdd3',
    accentColor: '#fb7185',
    bubbleColors: ['#881337', '#9f1239', '#be123c', '#e11d48'],
    particleType: 'hearts',
    mood: 'romantic',
  },
];

export const getDailyTheme = (): WhisperTheme => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return themes[dayOfYear % themes.length];
};

export const getThemeByMood = (mood: string): WhisperTheme => {
  return themes.find(t => t.mood === mood) || themes[0];
};
