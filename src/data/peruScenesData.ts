/**
 * Peru Documentary 6 Scenes Complete Educational Data
 * Dense factual data: Nama, Jenis, Jumlah, Luas, Panjang, Lebar, Ketinggian
 * No subtitles on video. Pure factual parameters and continuous relaxed narration.
 */

export interface FactualMetrics {
  nama: string;
  jenis: string;
  jumlah: string;
  luas?: string;
  panjang?: string;
  lebar?: string;
  kedalaman?: string;
  ketinggian?: string;
}

export interface TriviaItem {
  id: number;
  questionId: string;
  questionEn: string;
  optionsId: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationId: string;
  explanationEn: string;
  hintId: string;
  hintEn: string;
}

import { SceneFactualParameters } from '../types/encyclopedia';
import { ArchivalSourceInfo } from './countryMediaRegistry';

export interface DocumentaryScene {
  id: number;
  number: number;
  titleId: string;
  titleEn: string;
  taglineId: string;
  taglineEn: string;
  duration: number; // 60 seconds
  videoUrl: string;
  fallbackPoster: string;
  galleryImages: {
    url: string;
    captionId: string;
    captionEn: string;
    sourceArchive?: string;
  }[];
  archivalSource?: ArchivalSourceInfo;
  isCustomVideo?: boolean;
  customVideoUrl?: string;
  customFileName?: string;
  customFileSize?: string;
  customSubtitles?: {
    src: string;
    srcLang: 'en' | 'id';
    label: 'English' | 'Indonesia';
    default?: boolean;
  }[];
  // Factual metrics requested by user: nama, jumlah, jenis, luas, panjang, lebar, ketinggian
  metrics: FactualMetrics;
  metricsEn?: FactualMetrics;
  // Exact 6 user-designated factual parameter groups
  factualDataId?: SceneFactualParameters;
  factualDataEn?: SceneFactualParameters;
  // Compact, cohesive single narration text (no fragmented cuts, relaxed conversational tone)
  fullNarrationId: string;
  fullNarrationEn: string;
  triviaQuestions: TriviaItem[];
  miniProject: {
    titleId: string;
    titleEn: string;
    descriptionId: string;
    descriptionEn: string;
    stepsId: string[];
    stepsEn: string[];
    outputLabelId: string;
    outputLabelEn: string;
  };
}

export const PERU_DOCUMENTARY_SCENES: DocumentaryScene[] = [
  {
    id: 1,
    number: 1,
    titleId: 'Letak Geografis Peru',
    titleEn: 'Geographical Landscape of Peru',
    taglineId: 'Data Parameter Wilayah, Elevasi, dan Tiga Zona Alam',
    taglineEn: 'Regional Parameters, Elevation, and Three Natural Zones',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Lanskap megah Machu Picchu di punggung Pegunungan Andes',
        captionEn: 'Majestic panorama of Machu Picchu in the Andes Mountains',
      },
      {
        url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Danau Titicaca, danau tertinggi di dunia yang dapat dilayari (3.812 mdpl)',
        captionEn: 'Lake Titicaca, the highest navigable body of water in the world (3,812m)',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Hutan Hujan Amazon Peru yang menutupi lebih dari 60% daratan nasional',
        captionEn: 'The Peruvian Amazon Rainforest covering over 60% of the national territory',
      },
    ],
    metrics: {
      nama: 'Republik Peru (República del Perú)',
      jenis: '3 Zona Alam: Costa (Pesisir 12%), Sierra (Pegunungan Andes 28%), Selva (Amazon 60%)',
      jumlah: '5 Negara Perbatasan (Ekuador, Kolombia, Brasil, Bolivia, Cile)',
      luas: '1.285.216 km² (Terbesar ke-3 di Amerika Selatan)',
      panjang: '2.414 km garis pantai Samudra Pasifik',
      lebar: 'Lebar wilayah maksimum sekitar 1.000 km',
      ketinggian: 'Puncak Tertinggi: Gunung Huascarán (6.768 mdpl); Danau Titicaca: 3.812 mdpl; Ngarai Colca: 3.270 m',
    },
    metricsEn: {
      nama: 'Republic of Peru (República del Perú)',
      jenis: '3 Natural Zones: Costa (Coast 12%), Sierra (Andes 28%), Selva (Amazon 60%)',
      jumlah: '5 Bordering Nations (Ecuador, Colombia, Brazil, Bolivia, Chile)',
      luas: '1,285,216 km² (3rd Largest in South America)',
      panjang: '2,414 km Pacific Ocean coastline',
      lebar: 'Maximum territorial width approx. 1,000 km',
      ketinggian: 'Highest Peak: Mount Huascarán (6,768m); Lake Titicaca: 3,812m; Colca Canyon: 3,270m',
    },
    factualDataId: {
      geografi: {
        benua: 'Amerika Selatan (Kawasan Pasifik Barat)',
        luasDaratan: '1.285.216 km² (Terbesar ke-3 di Benua Amerika Selatan)',
        garisPantai: '2.414 km sepanjang perairan Samudra Pasifik',
        titikTertinggi: 'Gunung Huascarán (6.768 mdpl di Pegunungan Andes)',
      },
    },
    factualDataEn: {
      geografi: {
        benua: 'South America (Western Pacific Coastline)',
        luasDaratan: '1,285,216 km² (3rd Largest in South America)',
        garisPantai: '2,414 km along the Pacific Ocean',
        titikTertinggi: 'Mount Huascarán (6,768m above sea level in the Andes)',
      },
    },
    fullNarrationId:
      'Republik Peru memiliki luas wilayah 1.285.216 kilometer persegi dengan panjang garis pantai 2.414 kilometer di Samudra Pasifik. Bentang alamnya terbagi menjadi tiga jenis zona: pesisir Costa 12 persen, pegunungan Sierra 28 persen, dan rimba Amazon Selva 60 persen. Ketinggian tertingginya adalah Gunung Huascarán pada 6.768 meter di atas permukaan laut, serta Danau Titicaca pada ketinggian 3.812 meter dengan luas 8.372 kilometer persegi.',
    fullNarrationEn:
      'The Republic of Peru spans an area of 1,285,216 square kilometers with a Pacific coastline of 2,414 kilometers. Its geography comprises three distinct zones: coastal Costa at 12 percent, Andean Sierra at 28 percent, and Amazonian Selva covering 60 percent. The highest elevation is Mount Huascarán at 6,768 meters above sea level, alongside Lake Titicaca at an altitude of 3,812 meters and an area of 8,372 square kilometers.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapa persen wilayah negara Peru yang ditutupi oleh Hutan Hujan Amazon (zona Selva)?',
        questionEn: 'What percentage of Peru’s territory is covered by the Amazon Rainforest (Selva region)?',
        optionsId: ['Sekitar 20%', 'Sekitar 40%', 'Lebih dari 60%', 'Hanya 10%'],
        optionsEn: ['Around 20%', 'Around 40%', 'Over 60%', 'Only 10%'],
        correctIndex: 2,
        explanationId: 'Zona Selva (Hutan Hujan Amazon) mencakup lebih dari 60% total luas daratan Peru.',
        explanationEn: 'The Selva zone (Amazon Rainforest) encompasses over 60% of Peru’s total land area.',
        hintId: 'Kawasan hutan ini adalah wilayah terluas di Peru.',
        hintEn: 'This rainforest biome is Peru’s largest geographic zone.',
      },
      {
        id: 2,
        questionId: 'Berapakah ketinggian Danau Titicaca di atas permukaan laut?',
        questionEn: 'What is the elevation of Lake Titicaca above sea level?',
        optionsId: ['1.200 mdpl', '2.400 mdpl', '3.812 mdpl', '5.500 mdpl'],
        optionsEn: ['1,200 m', '2,400 m', '3,812 m', '5,500 m'],
        correctIndex: 2,
        explanationId: 'Danau Titicaca terletak pada ketinggian 3.812 mdpl di pegunungan Andes.',
        explanationEn: 'Lake Titicaca sits at an elevation of 3,812 meters in the Andes.',
        hintId: 'Di atas 3.800 meter di atas permukaan laut.',
        hintEn: 'Above 3,800 meters elevation.',
      },
      {
        id: 3,
        questionId: 'Berapakah ketinggian puncak Gunung Huascarán sebagai titik tertinggi di Peru?',
        questionEn: 'What is the elevation of Mount Huascarán, the highest point in Peru?',
        optionsId: ['4.500 mdpl', '5.895 mdpl', '6.768 mdpl', '8.848 mdpl'],
        optionsEn: ['4,500 m', '5,895 m', '6,768 m', '8,848 m'],
        correctIndex: 2,
        explanationId: 'Gunung Huascarán mencapai ketinggian 6.768 mdpl di Cordillera Blanca.',
        explanationEn: 'Mount Huascarán reaches 6,768 meters in the Cordillera Blanca range.',
        hintId: 'Mendekati hampir 7 kilometer di atas permukaan laut.',
        hintEn: 'Approaching nearly 7 kilometers above sea level.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Sains & IPS: Lembar Parameter Tiga Zona Geografis Peru',
      titleEn: 'Science & Geography Mini Project: Parameter Sheet of Peru’s Three Zones',
      descriptionId:
        'Siswa menyusun tabel perbandingan parameter Nama, Luas, Panjang, dan Ketinggian antara zona Costa, Sierra, dan Selva.',
      descriptionEn:
        'Students compile a comparative data sheet of Name, Area, Length, and Elevation parameters across Costa, Sierra, and Selva.',
      stepsId: [
        'Catat luas persentase Costa (12%), Sierra (28%), dan Selva (60%).',
        'Bandingkan ketinggian kota pesisir Lima (0-150 mdpl) dan kota dataran tinggi Cusco (3.400 mdpl).',
        'Dokumentasikan panjang garis pantai Pasifik 2.414 km pada peta digital.',
      ],
      stepsEn: [
        'Record area percentages of Costa (12%), Sierra (28%), and Selva (60%).',
        'Contrast coastal Lima elevation (0-150m) with high-altitude Cusco (3,400m).',
        'Document the 2,414 km Pacific coastline on a digital map.',
      ],
      outputLabelId: 'Lembar Data Parameter Geografis',
      outputLabelEn: 'Geographical Parameter Data Sheet',
    },
  },
  {
    id: 2,
    number: 2,
    titleId: 'Sejarah Peradaban Peru',
    titleEn: 'Historical Heritage of Peru',
    taglineId: 'Data Kronologi Peradaban, Dimensi Situs, dan Panjang Jalan Inka',
    taglineEn: 'Civilization Chronology, Site Dimensions, and Inca Road Network',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Machu Picchu, mahakarya arsitektur batu Kekaisaran Inka abad ke-15',
        captionEn: 'Machu Picchu, the 15th-century architectural marvel of the Inca Empire',
      },
      {
        url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Dinding batu raksasa Sacsayhuamán dengan teknik sambung presisi tanpa semen',
        captionEn: 'Massive stone fortifications of Sacsayhuamán assembled without mortar',
      },
      {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Pusat bersejarah Cusco, ibu kota kuno Kekaisaran Inka dan kota kolonial warisan UNESCO',
        captionEn: 'Historic center of Cusco, imperial Inca capital and UNESCO World Heritage site',
      },
    ],
    metrics: {
      nama: 'Peradaban Caral-Supe & Kekaisaran Inka (Tahuantinsuyo)',
      jenis: 'Peradaban Pra-Kolumbus dan Kekaisaran Andes Kuno',
      jumlah: 'Usia Kota Caral: 5.000 Tahun (3000 SM); Kekaisaran Inka: 4 Suyu (Wilayah)',
      luas: 'Wilayah Kekaisaran Inka: Lebih dari 2.000.000 km²',
      panjang: 'Jaringan Jalan Qhapaq Ñan: 40.000 km melintasi 6 negara Andes',
      lebar: 'Lebar jalan Qhapaq Ñan bervariasi antara 1 hingga 8 meter',
      ketinggian: 'Situs Machu Picchu: 2.430 mdpl; Sacsayhuamán: 3.700 mdpl; Kota Cusco: 3.400 mdpl',
    },
    metricsEn: {
      nama: 'Caral-Supe Civilization & Inca Empire (Tahuantinsuyo)',
      jenis: 'Pre-Columbian Civilizations and Ancient Andean Empires',
      jumlah: 'Age of Caral City: 5,000 Years (3000 BCE); Inca Empire: 4 Suyus (Regions)',
      luas: 'Inca Imperial Territory: Over 2,000,000 km²',
      panjang: 'Qhapaq Ñan Road Network: 40,000 km across 6 Andean nations',
      lebar: 'Qhapaq Ñan road width varies from 1 to 8 meters',
      ketinggian: 'Machu Picchu: 2,430m; Sacsayhuamán: 3,700m; City of Cusco: 3,400m',
    },
    factualDataId: {
      sejarah: {
        situsWarisan: 'Machu Picchu, Benteng Sacsayhuamán, & Piramida Kuno Caral-Supe (Warisan UNESCO)',
        usiaPeradaban: '5.000 Tahun (Peradaban Caral 3000 SM; Kekaisaran Inka Abad ke-15)',
        dimensiMonumen: 'Machu Picchu: Ketinggian 2.430 mdpl; Jaringan Qhapaq Ñan: 40.000 km (lebar 1-8 m)',
      },
    },
    factualDataEn: {
      sejarah: {
        situsWarisan: 'Machu Picchu, Sacsayhuamán Fortress, & Ancient Caral Pyramids (UNESCO World Heritage)',
        usiaPeradaban: '5,000 Years (Caral 3000 BCE; Imperial Inca 15th Century)',
        dimensiMonumen: 'Machu Picchu: 2,430m altitude; Qhapaq Ñan Network: 40,000 km length (1-8m wide)',
      },
    },
    fullNarrationId:
      'Peradaban tertua Peru adalah Caral-Supe berusia 5.000 tahun yang berdiri sejak 3000 SM. Kekaisaran Inka Tahuantinsuyo menguasai luas wilayah 2.000.000 kilometer persegi dengan 4 wilayah besar berpusat di Cusco. Bangsa Inka membangun jaringan jalan Qhapaq Ñan sepanjang 40.000 kilometer, serta situs Machu Picchu pada ketinggian 2.430 meter di atas permukaan laut dengan teknik batu poligon presisi.',
    fullNarrationEn:
      'Peru’s oldest civilization is Caral-Supe, dating back 5,000 years to 3000 BCE. The Inca Empire Tahuantinsuyo encompassed over 2,000,000 square kilometers across four realms centered in Cusco. The Incas constructed the Qhapaq Ñan road network spanning 40,000 kilometers, alongside the mountain sanctuary of Machu Picchu at an elevation of 2,430 meters.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapakah perkiraan panjang total jaringan jalan raya kuno Inka Qhapaq Ñan?',
        questionEn: 'What is the estimated total length of the Inca road network Qhapaq Ñan?',
        optionsId: ['1.000 km', '5.000 km', '20.000 km', '40.000 km'],
        optionsEn: ['1,000 km', '5,000 km', '20,000 km', '40,000 km'],
        correctIndex: 3,
        explanationId: 'Qhapaq Ñan membentang sepanjang 40.000 km menghubungkan wilayah Argentina, Bolivia, Cile, Kolombia, Ekuador, dan Peru.',
        explanationEn: 'The Qhapaq Ñan spans 40,000 kilometers connecting six modern South American nations.',
        hintId: 'Mencapai empat puluh ribu kilometer.',
        hintEn: 'Reaches forty thousand kilometers.',
      },
      {
        id: 2,
        questionId: 'Pada ketinggian berapakah situs arkeologi benteng Machu Picchu dibangun?',
        questionEn: 'At what altitude was the archaeological sanctuary of Machu Picchu erected?',
        optionsId: ['500 mdpl', '1.200 mdpl', '2.430 mdpl', '4.800 mdpl'],
        optionsEn: ['500 m', '1,200 m', '2,430 m', '4,800 m'],
        correctIndex: 2,
        explanationId: 'Machu Picchu dibangun di atas punggung pegunungan pada ketinggian 2.430 mdpl.',
        explanationEn: 'Machu Picchu was built upon a mountain ridge at 2,430 meters elevation.',
        hintId: 'Ketinggian sekitar dua ribu empat ratus meter.',
        hintEn: 'Approximately two thousand four hundred meters.',
      },
      {
        id: 3,
        questionId: 'Berapa jumlah wilayah besar (Suyu) yang membentuk Kekaisaran Inka Tahuantinsuyo?',
        questionEn: 'How many major administrative realms (Suyus) formed the Inca Empire Tahuantinsuyo?',
        optionsId: ['2 Wilayah', '4 Wilayah', '8 Wilayah', '12 Wilayah'],
        optionsEn: ['2 Regions', '4 Regions', '8 Regions', '12 Regions'],
        correctIndex: 1,
        explanationId: 'Tahuantinsuyo secara harfiah berarti "Empat Wilayah Bersatu" (Chinchaysuyu, Antisuyu, Kuntisuyu, Qullasuyu).',
        explanationEn: 'Tahuantinsuyo literally translates to "The Four United Regions".',
        hintId: 'Sesuai arti kata "Tahua" dalam bahasa Quechua yang berarti empat.',
        hintEn: '"Tahua" in Quechua translates to the number four.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Sejarah: Tabel Metrik Peradaban Andes Kuno',
      titleEn: 'History Mini Project: Metric Table of Ancient Andean Civilizations',
      descriptionId:
        'Siswa membuat tabel data kuantitatif: usia peradaban Caral (5.000 tahun), luas imperium Inka (2 juta km²), dan panjang jalan Qhapaq Ñan (40.000 km).',
      descriptionEn:
        'Students draft a quantitative comparative sheet of Caral age (5,000 yrs), Inca territory (2M km²), and Qhapaq Ñan length (40,000 km).',
      stepsId: [
        'Petakan 4 pembagian wilayah Tahuantinsuyo yang berpusat di Cusco.',
        'Hitung perbandingan panjang jalan Qhapaq Ñan (40.000 km) terhadap keliling bumi.',
        'Catat ketinggian elevasi situs Machu Picchu (2.430 mdpl) dan Sacsayhuamán (3.700 mdpl).',
      ],
      stepsEn: [
        'Diagram the 4 Suyus of Tahuantinsuyo centered around Cusco.',
        'Compare the 40,000 km Qhapaq Ñan network with Earth’s circumference.',
        'Record the elevations of Machu Picchu (2,430m) and Sacsayhuamán (3,700m).',
      ],
      outputLabelId: 'Lembar Metrik Sejarah Arkeologi',
      outputLabelEn: 'Archaeological History Metric Sheet',
    },
  },
  {
    id: 3,
    number: 3,
    titleId: 'Bahasa Nasional Peru',
    titleEn: 'National Languages of Peru',
    taglineId: 'Data Statistik Penutur Bahasa dan Jumlah Bahasa Pribumi',
    taglineEn: 'Speaker Demographics and Native Linguistic Census Data',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Penutur asli bahasa Quechua melestarikan tradisi bercerita lisan di dataran tinggi Andes',
        captionEn: 'Native Quechua speakers preserving oral storytelling traditions in the Andean highlands',
      },
      {
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Komunitas adat di kepulauan Titicaca bertutur dalam bahasa Quechua dan Aymara',
        captionEn: 'Indigenous communities of Lake Titicaca conversing in Quechua and Aymara',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Kekayaan 47 bahasa pribumi di kawasan hutan Amazon Peru seperti Asháninka dan Shipibo',
        captionEn: 'Linguistic wealth of 47 indigenous Amazonian languages including Asháninka and Shipibo',
      },
    ],
    metrics: {
      nama: 'Bahasa Spanyol (Castellano), Quechua (Runasimi), Aymara & Bahasa Amazon',
      jenis: '3 Bahasa Resmi Utama; 19 Rumpun Bahasa Pribumi',
      jumlah: 'Total 48 Bahasa Asli Nasional (4 bahasa Andes + 44 bahasa Amazon)',
      luas: 'Sebaran Wilayah Tutur: Quechua di Andes (28% wilayah), Amazon (60% wilayah)',
      panjang: 'Rentang wilayah sebaran penutur Quechua membentang lebih dari 2.500 km',
      ketinggian: 'Wilayah Tutur Quechua & Aymara: Ketinggian 2.000 hingga 4.500 mdpl',
    },
    metricsEn: {
      nama: 'Spanish (Castilian), Quechua (Runasimi), Aymara & Amazonian Tongues',
      jenis: '3 Primary Official Languages; 19 Indigenous Linguistic Families',
      jumlah: 'Total 48 Native National Languages (4 Andean + 44 Amazonian)',
      luas: 'Linguistic Coverage: Quechua in the Andes (28%), Amazon (60%)',
      panjang: 'Quechua linguistic zone spans over 2,500 km along the Andes',
      ketinggian: 'Quechua & Aymara Native Range: 2,000 to 4,500m above sea level',
    },
    factualDataId: {
      bahasa: {
        bahasaResmi: 'Bahasa Spanyol (Castellano), Quechua (Runasimi), & Aymara',
        penuturAsli: 'Spanyol: 84% (~28 Juta Jiwa); Quechua: 3,8 Juta Jiwa; Aymara: 450.000 Jiwa',
        ragamDialek: '48 Bahasa Asli Nasional (4 Dialek Pegunungan Andes + 44 Bahasa Suku Hutan Amazon)',
      },
    },
    factualDataEn: {
      bahasa: {
        bahasaResmi: 'Spanish (Castilian), Quechua (Runasimi), & Aymara',
        penuturAsli: 'Spanish: 84% (~28 Million); Quechua: 3.8 Million; Aymara: 450,000 Speakers',
        ragamDialek: '48 Indigenous National Languages (4 Andean Highlands + 44 Amazon Rainforest)',
      },
    },
    fullNarrationId:
      'Peru memiliki 3 bahasa resmi utama yaitu Spanyol, Quechua, dan Aymara, dengan total 48 jenis bahasa asli nasional. Bahasa Spanyol dituturkan oleh 84 persen atau 28 juta jiwa. Bahasa Quechua memiliki jumlah penutur 3,8 juta jiwa di pegunungan Andes. Bahasa Aymara dituturkan 450.000 jiwa di sekitar Danau Titicaca, serta terdapat 19 jenis rumpun bahasa di hutan Amazon.',
    fullNarrationEn:
      'Peru recognizes three primary official languages: Spanish, Quechua, and Aymara, alongside 48 registered indigenous tongues. Spanish is spoken by 84 percent or roughly 28 million people. Quechua accounts for 3.8 million speakers across the Andes. Aymara is spoken by 450,000 residents around Lake Titicaca, and the Amazon basin hosts 19 distinct linguistic families.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapakah perkiraan jumlah penutur bahasa Quechua di kawasan pegunungan Andes Peru?',
        questionEn: 'What is the estimated number of Quechua speakers across the Peruvian Andes?',
        optionsId: ['Sekitar 100 ribu', 'Sekitar 500 ribu', '3,8 Juta Jiwa', 'Lebih dari 20 juta'],
        optionsEn: ['About 100,000', 'About 500,000', '3.8 Million People', 'Over 20 million'],
        correctIndex: 2,
        explanationId: 'Bahasa Quechua dituturkan oleh sekitar 3,8 juta jiwa di Peru (13% dari total populasi nasional).',
        explanationEn: 'Quechua is actively spoken by approximately 3.8 million citizens in Peru.',
        hintId: 'Mendekati hampir 4 juta jiwa.',
        hintEn: 'Approaches nearly 4 million speakers.',
      },
      {
        id: 2,
        questionId: 'Berapakah total jumlah bahasa asli nasional yang diinventarisasi secara resmi di Peru?',
        questionEn: 'How many distinct indigenous languages are officially inventoried in Peru?',
        optionsId: ['Hanya 3 bahasa', '12 bahasa', '48 Bahasa Asli', '120 bahasa'],
        optionsEn: ['Only 3', '12', '48 Native Languages', '120'],
        correctIndex: 2,
        explanationId: 'Kementerian Kebudayaan Peru mencatat 48 bahasa asli (4 bahasa Andes dan 44 bahasa Amazon).',
        explanationEn: 'The Ministry of Culture registers 48 native languages (4 Andean and 44 Amazonian).',
        hintId: 'Empat puluh delapan bahasa.',
        hintEn: 'Forty-eight languages.',
      },
      {
        id: 3,
        questionId: 'Berapa persentase penduduk Peru yang menggunakan bahasa Spanyol sebagai bahasa ibu?',
        questionEn: 'What percentage of Peru’s population uses Spanish as their primary language?',
        optionsId: ['Sekitar 25%', 'Sekitar 50%', 'Sekitar 84%', '100%'],
        optionsEn: ['About 25%', 'About 50%', 'About 84%', '100%'],
        correctIndex: 2,
        explanationId: 'Bahasa Spanyol dituturkan oleh sekitar 84% penduduk Peru.',
        explanationEn: 'Spanish is the primary language for approximately 84% of Peruvians.',
        hintId: 'Lebih dari delapan puluh persen.',
        hintEn: 'Over eighty percent.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Bahasa: Infografis Data Sensus Bahasa Peru',
      titleEn: 'Language Mini Project: Peruvian Linguistic Census Infographic',
      descriptionId:
        'Siswa menyusun diagram statistik perbandingan jumlah penutur Spanyol (84%), Quechua (3,8 juta), Aymara (450 ribu), dan 44 bahasa Amazon.',
      descriptionEn:
        'Students compile a statistical chart comparing Spanish (84%), Quechua (3.8M), Aymara (450K), and 44 Amazonian languages.',
      stepsId: [
        'Hitung perbandingan proporsi penutur Spanyol vs bahasa pribumi Andes.',
        'Petakan daerah persebaran bahasa Aymara di sekitar Danau Titicaca (ketinggian 3.812 mdpl).',
        'Daftar 5 nama bahasa Amazon asli: Asháninka, Shipibo-Konibo, Awajún, Shawi, dan Matsigenka.',
      ],
      stepsEn: [
        'Calculate proportional ratios between Spanish and native Andean languages.',
        'Map the geographic range of Aymara surrounding Lake Titicaca (elevation 3,812m).',
        'List 5 indigenous Amazonian languages: Asháninka, Shipibo, Awajún, Shawi, and Matsigenka.',
      ],
      outputLabelId: 'Infografis Sensus Bahasa Digital',
      outputLabelEn: 'Digital Linguistic Census Infographic',
    },
  },
  {
    id: 4,
    number: 4,
    titleId: 'Pakaian Tradisional Peru',
    titleEn: 'Traditional Peruvian Attire',
    taglineId: 'Data Dimensi Kain, Lapisan Rok, dan Serat Wol Andes',
    taglineEn: 'Fabric Dimensions, Skirt Layers, and Andean Wool Fiber Metrics',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Kain tenun wol alpaca tradisional dengan pewarna alami dari akar, lumut, dan serangga cochineal',
        captionEn: 'Traditional alpaca wool weaving utilizing natural dyes from roots, moss, and cochineal insects',
      },
      {
        url: 'https://images.unsplash.com/photo-1546874177-9e664107314e?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Anak-anak dan masyarakat dataran tinggi mengenakan topi Chullo dengan penutup telinga hangat',
        captionEn: 'Highland community members wearing hand-knitted Chullo hats with warm ear flaps',
      },
      {
        url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Keindahan Polleras bertingkat berhias sulaman motif bunga dan selendang Lliclla serbaguna',
        captionEn: 'The splendor of multilayered embroidered Polleras skirts and versatile Lliclla shawls',
      },
    ],
    metrics: {
      nama: 'Poncho Andes, Topi Chullo, Rok Polleras, dan Selendang Lliclla',
      jenis: '2 Jenis Serat Wol Utama (Bulu Alpaca dan Llama); Pewarna Serangga Cochineal',
      jumlah: 'Lapisan Rok Polleras: 3 hingga 10 lapis rok bertingkat',
      panjang: 'Panjang Kain Poncho: 1,5 hingga 2,0 meter',
      lebar: 'Lebar Kain Poncho: 1,2 hingga 1,5 meter',
      ketinggian: 'Habitat Ternak Alpaca & Llama: Ketinggian 3.500 hingga 4.800 mdpl',
    },
    metricsEn: {
      nama: 'Andean Poncho, Chullo Hat, Layered Polleras, and Lliclla Shawl',
      jenis: '2 Camelid Wool Types (Alpaca & Llama Fleece); Natural Cochineal Dye',
      jumlah: 'Polleras Skirt Layers: 3 to 10 gathered festive tiers',
      panjang: 'Woven Poncho Length: 1.5 to 2.0 meters',
      lebar: 'Woven Poncho Width: 1.2 to 1.5 meters',
      ketinggian: 'Camelid Pasture Elevation: 3,500 to 4,800m above sea level',
    },
    factualDataId: {
      pakaian: {
        kainAdat: 'Poncho Tenun Andes, Topi Hangat Chullo, & Rok Bertingkat Polleras',
        teknikTenun: 'Alat Tenun Pinggang Kuno (Backstrap Loom) & Sulaman Tangan Polikrom',
        bahanSeratAlami: 'Bulu Wol Hewan Alpaca & Llama (Habitat 3.500-4.800 mdpl) & Pewarna Alami Serangga Cochineal',
      },
    },
    factualDataEn: {
      pakaian: {
        kainAdat: 'Handwoven Andean Poncho, Earflap Chullo Hat, & Multilayered Polleras Skirts',
        teknikTenun: 'Ancient Backstrap Loom Weaving & Intricate Polychrome Embroidery',
        bahanSeratAlami: 'Natural Alpaca & Llama Camelid Wool (3,500-4,800m Altitude) & Cochineal Dyes',
      },
    },
    fullNarrationId:
      'Pakaian tradisional Peru terdiri dari jenis Poncho, topi Chullo, dan rok bertingkat Polleras. Bahan ditenun dari 2 jenis serat wol unggulan hewan Alpaca dan Llama yang hidup di ketinggian 3.500 hingga 4.800 meter. Kain Poncho memiliki panjang 1,5 hingga 2 meter dengan lebar 1,2 meter. Rok Polleras memiliki jumlah 3 hingga 10 lapisan kain dengan pewarna alami dari serangga Cochineal.',
    fullNarrationEn:
      'Traditional Peruvian attire features the woven Poncho, the ear-flap Chullo cap, and multilayered Polleras skirts. Textiles are spun from two premium camelid wool fibers, Alpaca and Llama, native to altitudes between 3,500 and 4,800 meters. Ponchos measure 1.5 to 2 meters in length by 1.2 meters in width. Polleras skirts feature between 3 and 10 gathered layers dyed with natural cochineal.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapa rentang panjang dan lebar standar kain Poncho tenun tradisional Andes?',
        questionEn: 'What are the typical length and width dimensions of a traditional woven Andean Poncho?',
        optionsId: [
          'Panjang 50 cm, lebar 30 cm',
          'Panjang 1,5 - 2 meter, lebar 1,2 meter',
          'Panjang 5 meter, lebar 4 meter',
          'Panjang 10 meter, lebar 2 meter',
        ],
        optionsEn: [
          'Length 50 cm, width 30 cm',
          'Length 1.5 - 2 meters, width 1.2 meters',
          'Length 5 meters, width 4 meters',
          'Length 10 meters, width 2 meters',
        ],
        correctIndex: 1,
        explanationId: 'Kain Poncho tenun standar memiliki panjang 1,5 hingga 2 meter dengan lebar 1,2 meter.',
        explanationEn: 'A standard handwoven poncho measures approximately 1.5 to 2 meters in length by 1.2 meters in width.',
        hintId: 'Antara satu setengah hingga dua meter.',
        hintEn: 'Between one and a half to two meters.',
      },
      {
        id: 2,
        questionId: 'Pada ketinggian berapakah hewan Alpaca dan Llama penghasil wol umumnya dipelihara di dataran tinggi Andes?',
        questionEn: 'At what altitude are wool-bearing Alpacas and Llamas typically pastured in the Andes?',
        optionsId: ['0 - 500 mdpl', '1.000 - 2.000 mdpl', '3.500 - 4.800 mdpl', 'Di atas 7.000 mdpl'],
        optionsEn: ['0 - 500 m', '1,000 - 2,000 m', '3,500 - 4,800 m', 'Above 7,000 m'],
        correctIndex: 2,
        explanationId: 'Alpaca dan Llama hidup di padang rumput Altiplano pada ketinggian 3.500 hingga 4.800 mdpl.',
        explanationEn: 'Camelids graze across the high Altiplano plateaus between 3,500 and 4,800 meters.',
        hintId: 'Di atas 3.500 meter di atas permukaan laut.',
        hintEn: 'Above 3,500 meters elevation.',
      },
      {
        id: 3,
        questionId: 'Berapa jumlah lapisan rok bertingkat Polleras yang biasa dikenakan wanita dalam busana adat Andes?',
        questionEn: 'How many gathered layers of Polleras skirts are traditionally worn by Andean women?',
        optionsId: ['Hanya 1 lapis', '3 hingga 10 lapisan', 'Tepat 20 lapisan', '50 lapisan'],
        optionsEn: ['Only 1 layer', '3 to 10 layers', 'Exactly 20 layers', '50 layers'],
        correctIndex: 1,
        explanationId: 'Rok Polleras dikenakan bertumpuk antara 3 hingga 10 lapis untuk penahan dingin dan keindahan busana.',
        explanationEn: 'Polleras are layered between 3 and 10 tiers for thermal insulation and elegance.',
        hintId: 'Antara tiga sampai sepuluh lapis.',
        hintEn: 'Between 3 and 10 layers.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Kriya: Tabel Ukuran & Spesifikasi Tekstil Tradisional Peru',
      titleEn: 'Crafts Mini Project: Dimension & Specification Sheet of Andean Textiles',
      descriptionId:
        'Siswa mencatat dimensi panjang, lebar, dan berat kain Poncho wol alpaca serta jumlah lapisan rok Polleras.',
      descriptionEn:
        'Students record length, width, and weight dimensions of alpaca wool ponchos and polleras skirt layers.',
      stepsId: [
        'Tuliskan spesifikasi kain Poncho: panjang 1,5 - 2 m, lebar 1,2 m.',
        'Jelaskan mengapa serat wol Alpaca berongga udara dan tahan dingin di ketinggian 4.000 mdpl.',
        'Hitung jumlah lapisan rok Polleras (3-10 lapis) dan pewarna serangga Cochineal.',
      ],
      stepsEn: [
        'Document poncho dimensions: 1.5 - 2 m length, 1.2 m width.',
        'Explain thermal hollow-fiber properties of alpaca wool at 4,000m altitudes.',
        'Calculate polleras layering tiers (3-10) and organic cochineal dyes.',
      ],
      outputLabelId: 'Lembar Spesifikasi Tekstil Kriya',
      outputLabelEn: 'Textile Specification Sheet',
    },
  },
  {
    id: 5,
    number: 5,
    titleId: 'Budaya, Musik, & Tarian Peru',
    titleEn: 'Peruvian Culture, Music, & Dance',
    taglineId: 'Data Tabung Seruling Zampoña, Senar Charango, dan Ketinggian Festival',
    taglineEn: 'Panpipe Tube Counts, Charango Strings, and Festival Amphitheater Altitude',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Perayaan agung Festival Inti Raymi (Pesta Matahari) di benteng bersejarah Sacsayhuamán, Cusco',
        captionEn: 'Grand celebration of Inti Raymi (Festival of the Sun) at Sacsayhuamán fortress, Cusco',
      },
      {
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Musisi tradisional memainkan seruling pipa bambu Zampoña dan Quena yang mistis',
        captionEn: 'Musicians playing the mystical bamboo panpipe Zampoña and wooden Quena flute',
      },
      {
        url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Tarian nasional Marinera yang memukau dengan saputangan putih dan irama cajón',
        captionEn: 'National Marinera dance with graceful fluttering white handkerchiefs and cajón rhythm',
      },
    ],
    metrics: {
      nama: 'Festival Inti Raymi, Seruling Zampoña & Quena, Charango, Tari Marinera & Huayno',
      jenis: '2 Jenis Tarian Utama: Marinera Pesisir dan Huayno Andes; Alat Tiup, Petik, & Perkusi',
      jumlah: 'Jumlah Tabung Zampoña: 13 hingga 17 tabung bambu; Senar Charango: 10 senar (5 pasang)',
      panjang: 'Panjang Tabung Zampoña: 10 sentimeter hingga 120 sentimeter (1,2 meter)',
      ketinggian: 'Ketinggian Benteng Sacsayhuamán (Lokasi Inti Raymi): 3.700 mdpl di atas kota Cusco',
    },
    metricsEn: {
      nama: 'Inti Raymi Festival, Zampoña Panpipe, Quena, Charango, Marinera & Huayno Dance',
      jenis: '2 Principal Dance Styles: Coastal Marinera and Andean Huayno; Wind, Strings & Percussion',
      jumlah: 'Zampoña Pipes: 13 to 17 bamboo resonance tubes; Charango: 10 strings (5 double courses)',
      panjang: 'Zampoña Tube Length: 10 cm to 120 cm (1.2 meters bass pipes)',
      ketinggian: 'Sacsayhuamán Ceremonial Fortress Elevation: 3,700m overlooking Cusco',
    },
    factualDataId: {
      musikTarian: {
        alatMusikTradisional: 'Seruling Pipa Bambu Zampoña, Suling Kayu Quena, & Gitar Andes Charango',
        jumlahDawaiTabung: 'Pipa Zampoña: 13 hingga 17 Tabung Bambu (panjang 10-120 cm); Senar Charango: 10 Senar (5 Pasang)',
        ragamTarian: 'Tarian Nasional Marinera Pesisir, Tarian Huayno Pegunungan, & Upacara Akbar Inti Raymi (3.700 mdpl)',
      },
    },
    factualDataEn: {
      musikTarian: {
        alatMusikTradisional: 'Bamboo Panpipe Zampoña, Quena Flute, & Charango Andean Lute',
        jumlahDawaiTabung: 'Zampoña: 13 to 17 Bamboo Pipes (length 10-120 cm); Charango: 10 Strings (5 Double Courses)',
        ragamTarian: 'Coastal Marinera Dance, Andean Huayno Folk Dance, & Inti Raymi Sun Festival (3,700m Altitude)',
      },
    },
    fullNarrationId:
      'Festival terbesar Peru adalah Inti Raymi di Sacsayhuamán pada ketinggian 3.700 meter. Alat musik tiup Zampoña memiliki jumlah 13 hingga 17 tabung bambu dengan panjang 10 sentimeter hingga 1,2 meter. Alat petik Charango memiliki 10 senar. Seni tari terbagi menjadi 2 jenis utama, yaitu tarian nasional Marinera pesisir dan tarian Huayno pegunungan.',
    fullNarrationEn:
      'Peru’s premier celebration is Inti Raymi held at Sacsayhuamán at an altitude of 3,700 meters. The Zampoña panpipe features between 13 and 17 bamboo pipes ranging in length from 10 centimeters to 1.2 meters. The Charango lute is strung with 10 strings. Dance traditions are led by two primary types: the coastal Marinera and the high-energy Andean Huayno.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapa jumlah tabung bambu pada alat musik tiup tradisional Zampoña?',
        questionEn: 'How many bamboo resonance pipes comprise a traditional Zampoña pan flute?',
        optionsId: ['2 tabung', '5 tabung', '13 hingga 17 tabung', '50 tabung'],
        optionsEn: ['2 pipes', '5 pipes', '13 to 17 pipes', '50 pipes'],
        correctIndex: 2,
        explanationId: 'Zampoña standar terdiri dari 2 baris (Ira dan Arka) dengan jumlah total 13 hingga 17 tabung bambu.',
        explanationEn: 'A standard Zampoña panpipe consists of two complementary rows totaling 13 to 17 pipes.',
        hintId: 'Antara tiga belas sampai tujuh belas tabung.',
        hintEn: 'Between 13 and 17 pipes.',
      },
      {
        id: 2,
        questionId: 'Berapa jumlah senar pada instrumen petik dawai tradisional Andes bernama Charango?',
        questionEn: 'How many strings are fitted onto the traditional Andean Charango lute?',
        optionsId: ['4 senar', '6 senar', '10 senar (5 nada ganda)', '12 senar'],
        optionsEn: ['4 strings', '6 strings', '10 strings (5 double courses)', '12 strings'],
        correctIndex: 2,
        explanationId: 'Charango memiliki 10 senar yang dikelompokkan ke dalam 5 pasang kurs nada ganda.',
        explanationEn: 'The Charango features 10 strings configured in 5 double courses.',
        hintId: 'Sepuluh senar.',
        hintEn: 'Ten strings.',
      },
      {
        id: 3,
        questionId: 'Berapa ketinggian benteng batu Sacsayhuamán tempat digelarnya upacara agung Inti Raymi setiap 24 Juni?',
        questionEn: 'What is the elevation of Sacsayhuamán fortress where Inti Raymi is staged every June 24?',
        optionsId: ['1.000 mdpl', '2.000 mdpl', '3.700 mdpl', '6.000 mdpl'],
        optionsEn: ['1,000 m', '2,000 m', '3,700 m', '6,000 m'],
        correctIndex: 2,
        explanationId: 'Benteng bersejarah Sacsayhuamán bertengger pada ketinggian 3.700 mdpl di atas kota Cusco.',
        explanationEn: 'Sacsayhuamán stands at 3,700 meters overlooking the city of Cusco.',
        hintId: 'Tiga ribu tujuh ratus meter di atas permukaan laut.',
        hintEn: 'Three thousand seven hundred meters.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Musik Akustik: Pengukuran Frekuensi dan Panjang Pipa Zampoña',
      titleEn: 'Acoustic Music Mini Project: Measurement of Zampoña Tube Lengths and Pitch',
      descriptionId:
        'Siswa mengukur data panjang pipa Zampoña dari 10 cm hingga 120 cm dan menganalisis hubungan panjang pipa terhadap tinggi-rendah nada.',
      descriptionEn:
        'Students record Zampoña pipe lengths from 10 cm to 120 cm, charting the inverse relationship between tube length and audio pitch.',
      stepsId: [
        'Catat data panjang pipa terpendek (10 cm untuk nada tinggi) dan terpanjang (120 cm untuk nada bas).',
        'Jelaskan fungsi 10 senar Charango dalam memainkan akor lagu El Cóndor Pasa.',
        'Dokumentasikan ketinggian 3.700 mdpl benteng Sacsayhuamán tempat perayaan Inti Raymi.',
      ],
      stepsEn: [
        'Log pipe lengths from shortest (10 cm high pitch) to longest (120 cm bass pitch).',
        'Diagram the 10-string pairing of the Charango for chord harmony.',
        'Record the 3,700m elevation of the Sacsayhuamán Inti Raymi ceremonial grounds.',
      ],
      outputLabelId: 'Lembar Data Sains Akustik Musik',
      outputLabelEn: 'Acoustic Music Science Data Sheet',
    },
  },
  {
    id: 6,
    number: 6,
    titleId: 'Makanan Khas Peru',
    titleEn: 'Traditional Peruvian Gastronomy',
    taglineId: 'Data Jumlah Varietas Kentang, Dimensi Jagung, dan Kedalaman Oven Pachamanca',
    taglineEn: 'Potato Heirloom Varieties, Corn Dimensions, and Pachamanca Oven Depth',
    duration: 60,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    fallbackPoster: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Ceviche Peru autentik: ikan laut segar dimarinasi air jeruk nipis dengan cabai ají dan jagung choclo',
        captionEn: 'Authentic Peruvian Ceviche: fresh ocean fish cured in lime juice with ají chilies and giant choclo corn',
      },
      {
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Lomo Saltado, hidangan tumis daging sapi teknik wok perpaduan budaya Peru dan Tionghoa (Chifa)',
        captionEn: 'Lomo Saltado, a sizzling beef wok stir-fry fusing Peruvian ingredients and Chinese Chifa heritage',
      },
      {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
        captionId: 'Causa Rellena dari kentang kuning tumbuk bumbu ají amarillo dan minuman segar Chicha Morada jagung ungu',
        captionEn: 'Causa Rellena made from yellow potatoes and ají amarillo, paired with purple corn Chicha Morada',
      },
    ],
    metrics: {
      nama: 'Ceviche Nasional, Lomo Saltado, Causa Rellena, Pachamanca, & Chicha Morada',
      jenis: 'Gastronomi Laut (Ceviche), Wok Fusion (Lomo Saltado), dan Oven Tanah Kuno (Pachamanca)',
      jumlah: 'Lebih dari 3.800 Jenis Varietas Kentang Asli Andes Peru',
      lebar: 'Diameter Biji Jagung Raksasa Choclo: 2 hingga 3 sentimeter per butir',
      kedalaman: 'Kedalaman Lubang Oven Bawah Tanah Pachamanca: 50 hingga 80 sentimeter',
      ketinggian: 'Habitat Tanam Jagung Ungu Maiz Morado: Ketinggian 3.000 mdpl di Lembah Andes',
    },
    metricsEn: {
      nama: 'National Ceviche, Lomo Saltado, Causa Rellena, Pachamanca, & Chicha Morada',
      jenis: 'Marine Gastronomy (Ceviche), Wok Fusion (Lomo Saltado), and Earth Oven (Pachamanca)',
      jumlah: 'Over 3,800 Heirloom Native Potato Varieties across the Andes',
      lebar: 'Giant Andean Choclo Corn Kernel Diameter: 2 to 3 cm each',
      kedalaman: 'Subterranean Pachamanca Earth Oven Pit Depth: 50 to 80 cm',
      ketinggian: 'Purple Corn (Maiz Morado) Habitat: 3,000m Elevation in Andean Valleys',
    },
    factualDataId: {
      makanan: {
        kulinerIkonik: 'Ceviche Ikan Segar Corvina, Lomo Saltado Wok Fusion, & Causa Rellena Kentang Kuning',
        ketinggianBahanTanam: 'Jagung Ungu Maiz Morado: Ketinggian 3.000 mdpl di Lembah Andes; >3.800 Varietas Kentang Asli',
        kedalamanTeknikMasak: 'Pachamanca: Dimasak Dalam Lubang Batu Vulkanik Panas Sedalam 50 hingga 80 cm di Bawah Tanah',
      },
    },
    factualDataEn: {
      makanan: {
        kulinerIkonik: 'Fresh Corvina Ceviche, Lomo Saltado Beef Stir-Fry, & Yellow Potato Causa Rellena',
        ketinggianBahanTanam: 'Purple Corn (Maiz Morado): 3,000m Elevation in Andean Valleys; >3,800 Native Potato Varieties',
        kedalamanTeknikMasak: 'Pachamanca: Slow-Cooked with Hot River Stones in Subterranean Pits 50 to 80 cm Deep',
      },
    },
    fullNarrationId:
      'Makanan nasional Peru adalah Ceviche dari jenis ikan laut segar Corvina dengan cairan Leche de Tigre dan jagung Choclo berbutir 2 sentimeter. Peru memiliki jumlah lebih dari 3.800 jenis varietas kentang Andes. Hidangan Lomo Saltado memadukan daging sapi dan kentang. Masakan kuno Pachamanca dimasak di lubang tanah sedalam 50 hingga 80 sentimeter, disajikan dengan Chicha Morada dari jagung ungu ketinggian 3.000 meter.',
    fullNarrationEn:
      'Peru’s national dish is Ceviche, prepared with fresh Corvina sea fish cured in Leche de Tigre and giant Choclo corn with 2-centimeter kernels. Peru cultivates over 3,800 heirloom potato varieties across the Andes. The stir-fry Lomo Saltado combines tender beef and golden fries. The ancient Pachamanca feast is slow-cooked in subterranean pits 50 to 80 centimeters deep, accompanied by Chicha Morada from purple corn grown at 3,000 meters.',
    triviaQuestions: [
      {
        id: 1,
        questionId: 'Berapakah perkiraan jumlah varietas kentang asli yang dibudidayakan di kawasan Andes Peru?',
        questionEn: 'How many native heirloom potato varieties are cultivated across the Peruvian Andes?',
        optionsId: ['Hanya 50 jenis', 'Sekitar 500 jenis', 'Lebih dari 3.800 jenis', 'Tepat 100 jenis'],
        optionsEn: ['Only 50', 'About 500', 'Over 3,800 varieties', 'Exactly 100'],
        correctIndex: 2,
        explanationId: 'Peru membudidayakan lebih dari 3.800 varietas kentang asli di Pegunungan Andes.',
        explanationEn: 'Peru cultivates over 3,800 heirloom potato varieties.',
        hintId: 'Lebih dari tiga ribu delapan ratus jenis.',
        hintEn: 'Over 3,800 varieties.',
      },
      {
        id: 2,
        questionId: 'Berapa diameter rata-rata butiran biji jagung raksasa Andes (Choclo) yang mendampingi Ceviche?',
        questionEn: 'What is the average diameter of giant Andean Choclo corn kernels served with Ceviche?',
        optionsId: ['2 hingga 3 milimeter', '2 hingga 3 sentimeter', '10 sentimeter', '50 sentimeter'],
        optionsEn: ['2 to 3 millimeters', '2 to 3 centimeters', '10 centimeters', '50 centimeters'],
        correctIndex: 1,
        explanationId: 'Biji jagung Choclo sangat besar dengan diameter mencapai 2 hingga 3 sentimeter.',
        explanationEn: 'Choclo kernels are famously giant, reaching 2 to 3 centimeters in diameter.',
        hintId: 'Dua hingga tiga sentimeter.',
        hintEn: 'Two to three centimeters.',
      },
      {
        id: 3,
        questionId: 'Berapakah kedalaman standar lubang tanah untuk memasak hidangan tradisional Pachamanca dengan batu panas?',
        questionEn: 'What is the standard pit depth dug into the earth for the ancient Pachamanca hot-stone feast?',
        optionsId: ['10 sentimeter', '50 hingga 80 sentimeter', '5 meter', '10 meter'],
        optionsEn: ['10 centimeters', '50 to 80 centimeters', '5 meters', '10 meters'],
        correctIndex: 1,
        explanationId: 'Lubang Pachamanca digali sedalam 50 hingga 80 cm lalu diisi batu sungai vulkanik yang dipanaskan.',
        explanationEn: 'Pachamanca pits are dug 50 to 80 cm deep and lined with heated volcanic river stones.',
        hintId: 'Setengah meter hingga delapan puluh sentimeter.',
        hintEn: 'Half a meter to eighty centimeters.',
      },
    ],
    miniProject: {
      titleId: 'Mini Proyek Sains Pangan: Tabel Data Metrik Bahan Kuliner Peru',
      titleEn: 'Food Science Mini Project: Metric Table of Peruvian Gastronomic Ingredients',
      descriptionId:
        'Siswa membuat tabel data kuantitatif: jumlah varietas kentang (>3.800), diameter jagung Choclo (2-3 cm), dan kedalaman lubang Pachamanca (50-80 cm).',
      descriptionEn:
        'Students compile a quantitative table of potato varieties (>3,800), choclo diameter (2-3 cm), and Pachamanca pit depth (50-80 cm).',
      stepsId: [
        'Dokumentasikan data 3.800 varietas kentang asli Andes.',
        'Ukur diameter 2-3 cm biji jagung Choclo dan bandingkan dengan jagung biasa.',
        'Catat kedalaman lubang 50-80 cm serta ketinggian 3.000 mdpl budidaya jagung ungu Maiz Morado.',
      ],
      stepsEn: [
        'Document the 3,800 native Andean potato varieties.',
        'Contrast the 2-3 cm giant Choclo kernel diameter with common sweet corn.',
        'Record the 50-80 cm pit depth and the 3,000m altitude of purple corn cultivation.',
      ],
      outputLabelId: 'Lembar Metrik Sains Gastronomi',
      outputLabelEn: 'Gastronomic Science Metric Sheet',
    },
  },
];
