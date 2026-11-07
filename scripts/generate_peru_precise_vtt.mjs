import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const subtitlesDir = path.join(__dirname, '..', 'public', 'subtitles');

// Verbatim cues from teacher video: "Greetings in Spanish" / "Saludos en español"
// Duration: 03:07 (187.000 seconds)
const SPANISH_GREETINGS_CUES = [
  {
    start: '00:00:03.200',
    end: '00:00:06.500',
    en: 'Learn greetings in Spanish',
    id: 'Belajar salam dalam bahasa Spanyol'
  },
  {
    start: '00:00:07.500',
    end: '00:00:10.000',
    en: '¡Hola! (Hello!)',
    id: '¡Hola! (Halo!)'
  },
  {
    start: '00:00:12.500',
    end: '00:00:15.000',
    en: '¡Hola! (Hello!)',
    id: '¡Hola! (Halo!)'
  },
  {
    start: '00:00:17.500',
    end: '00:00:20.500',
    en: '¡Buenos días! (Good morning!)',
    id: '¡Buenos días! (Selamat pagi!)'
  },
  {
    start: '00:00:22.500',
    end: '00:00:25.500',
    en: '¡Buenos días! (Good morning!)',
    id: '¡Buenos días! (Selamat pagi!)'
  },
  {
    start: '00:00:28.000',
    end: '00:00:31.500',
    en: '¡Buenas tardes! (Good afternoon!)',
    id: '¡Buenas tardes! (Selamat siang!)'
  },
  {
    start: '00:00:33.500',
    end: '00:00:36.500',
    en: '¡Buenas tardes! (Good afternoon!)',
    id: '¡Buenas tardes! (Selamat siang!)'
  },
  {
    start: '00:00:39.000',
    end: '00:00:42.500',
    en: '¡Buenas noches! (Good evening / Good night!)',
    id: '¡Buenas noches! (Selamat malam!)'
  },
  {
    start: '00:00:44.500',
    end: '00:00:47.500',
    en: '¡Buenas noches! (Good evening / Good night!)',
    id: '¡Buenas noches! (Selamat malam!)'
  },
  {
    start: '00:00:50.000',
    end: '00:00:54.000',
    en: '¿Cómo te llamas? (What is your name?)',
    id: '¿Cómo te llamas? (Siapa namamu?)'
  },
  {
    start: '00:00:55.500',
    end: '00:00:59.500',
    en: 'Me llamo... (My name is...)',
    id: 'Me llamo... (Nama saya...)'
  },
  {
    start: '00:01:01.000',
    end: '00:01:05.000',
    en: 'Mucho gusto. (Nice to meet you.)',
    id: 'Mucho gusto. (Senang berkenalan denganmu.)'
  },
  {
    start: '00:01:07.000',
    end: '00:01:11.000',
    en: 'El gusto es mío. (The pleasure is mine.)',
    id: 'El gusto es mío. (Sama-sama senang.)'
  },
  {
    start: '00:01:13.000',
    end: '00:01:17.000',
    en: '¿Cómo estás? (How are you?)',
    id: '¿Cómo estás? (Bagaimana kabarmu?)'
  },
  {
    start: '00:01:19.000',
    end: '00:01:23.000',
    en: '¿Cómo estás? (How are you?)',
    id: '¿Cómo estás? (Bagaimana kabarmu?)'
  },
  {
    start: '00:01:25.000',
    end: '00:01:29.000',
    en: 'Muy bien, gracias. (Very well, thank you.)',
    id: 'Muy bien, gracias. (Sangat baik, terima kasih.)'
  },
  {
    start: '00:01:31.000',
    end: '00:01:35.000',
    en: 'Muy bien, gracias. (Very well, thank you.)',
    id: 'Muy bien, gracias. (Sangat baik, terima kasih.)'
  },
  {
    start: '00:01:37.000',
    end: '00:01:41.000',
    en: '¿Y tú? (And you?)',
    id: '¿Y tú? (Dan kamu?)'
  },
  {
    start: '00:01:43.000',
    end: '00:01:47.000',
    en: 'Bien, gracias. (Fine, thanks.)',
    id: 'Bien, gracias. (Baik, terima kasih.)'
  },
  {
    start: '00:01:50.000',
    end: '00:01:55.500',
    en: 'Bien, Gracias. ¿Y tú? (Fine, Thanks. And you?)',
    id: 'Bien, Gracias. ¿Y tú? (Baik, terima kasih. Dan kamu?)'
  },
  {
    start: '00:01:57.000',
    end: '00:02:01.500',
    en: 'Así, así. / Más o menos. (So-so.)',
    id: 'Así, así. (Biasa saja / Lumayan.)'
  },
  {
    start: '00:02:03.000',
    end: '00:02:07.500',
    en: 'No muy bien. (Not so good.)',
    id: 'No muy bien. (Kurang baik.)'
  },
  {
    start: '00:02:09.500',
    end: '00:02:13.500',
    en: 'Por favor. (Please.)',
    id: 'Por favor. (Tolong / Silakan.)'
  },
  {
    start: '00:02:15.500',
    end: '00:02:19.500',
    en: 'Gracias. (Thank you.)',
    id: 'Gracias. (Terima kasih.)'
  },
  {
    start: '00:02:21.500',
    end: '00:02:25.500',
    en: 'De nada. (You\'re welcome.)',
    id: 'De nada. (Sama-sama.)'
  },
  {
    start: '00:02:27.500',
    end: '00:02:31.500',
    en: 'Disculpe. / Con permiso. (Excuse me.)',
    id: 'Disculpe. / Con permiso. (Permisi.)'
  },
  {
    start: '00:02:33.500',
    end: '00:02:37.500',
    en: 'Lo siento. (I am sorry.)',
    id: 'Lo siento. (Maafkan saya.)'
  },
  {
    start: '00:02:39.500',
    end: '00:02:43.500',
    en: '¡Adiós! (Goodbye!)',
    id: '¡Adiós! (Selamat tinggal!)'
  },
  {
    start: '00:02:45.500',
    end: '00:02:49.500',
    en: '¡Hasta luego! (See you later!)',
    id: '¡Hasta luego! (Sampai jumpa nanti!)'
  },
  {
    start: '00:02:51.500',
    end: '00:02:55.500',
    en: '¡Hasta mañana! (See you tomorrow!)',
    id: '¡Hasta mañana! (Sampai jumpa besok!)'
  },
  {
    start: '00:02:57.500',
    end: '00:03:02.000',
    en: '¡Nos vemos pronto! (See you soon!)',
    id: '¡Nos vemos pronto! (Sampai jumpa lagi!)'
  },
  {
    start: '00:03:02.500',
    end: '00:03:07.000',
    en: '[Outro: Cheerful farewell music]',
    id: '[Musik penutup ceria]'
  }
];

function buildVtt(cues, lang) {
  let content = 'WEBVTT\n\n';
  for (const cue of cues) {
    const text = lang === 'id' ? cue.id : cue.en;
    content += `${cue.start} --> ${cue.end}\n${text}\n\n`;
  }
  return content;
}

const enVtt = buildVtt(SPANISH_GREETINGS_CUES, 'en');
const idVtt = buildVtt(SPANISH_GREETINGS_CUES, 'id');

// List of target country keys that teach Spanish or use this clip
const spanishCountries = ['peru', 'spanyol', 'argentina', 'kolombia', 'meksiko', 'mexiko'];

for (const country of spanishCountries) {
  fs.writeFileSync(path.join(subtitlesDir, `${country}-en.vtt`), enVtt, 'utf-8');
  fs.writeFileSync(path.join(subtitlesDir, `${country}-id.vtt`), idVtt, 'utf-8');
  console.log(`Generated precise Spanish greetings VTT for: ${country}`);
}

// Also create alias files for specific scenes or uploads
fs.writeFileSync(path.join(subtitlesDir, '1000646372-en.vtt'), enVtt, 'utf-8');
fs.writeFileSync(path.join(subtitlesDir, '1000646372-id.vtt'), idVtt, 'utf-8');
fs.writeFileSync(path.join(subtitlesDir, '1000643602-en.vtt'), enVtt, 'utf-8');
fs.writeFileSync(path.join(subtitlesDir, '1000643602-id.vtt'), idVtt, 'utf-8');
fs.writeFileSync(path.join(subtitlesDir, 'custom_peru_scene_3-en.vtt'), enVtt, 'utf-8');
fs.writeFileSync(path.join(subtitlesDir, 'custom_peru_scene_3-id.vtt'), idVtt, 'utf-8');

console.log('Successfully written Spanish Greetings VTT files.');
