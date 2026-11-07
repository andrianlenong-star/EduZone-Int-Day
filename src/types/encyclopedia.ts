/**
 * Audiovisual Encyclopedia Data Types
 */

import { DocumentaryScene, FactualMetrics } from '../data/peruScenesData';

export type VoicePersona = 'anak-perempuan' | 'anak-laki-laki' | 'guru-ramah';

// The 6 exact factual parameter groups requested by user:
export interface Scene1Geografi {
  benua: string;
  luasDaratan: string;
  garisPantai: string;
  titikTertinggi: string;
}

export interface Scene2Sejarah {
  situsWarisan: string;
  usiaPeradaban: string;
  dimensiMonumen: string;
}

export interface Scene3Bahasa {
  bahasaResmi: string;
  penuturAsli: string;
  ragamDialek: string;
}

export interface Scene4Pakaian {
  kainAdat: string;
  teknikTenun: string;
  bahanSeratAlami: string;
}

export interface Scene5MusikTarian {
  alatMusikTradisional: string;
  jumlahDawaiTabung: string;
  ragamTarian: string;
}

export interface Scene6Makanan {
  kulinerIkonik: string;
  ketinggianBahanTanam: string;
  kedalamanTeknikMasak: string;
}

export interface SceneFactualParameters {
  geografi?: Scene1Geografi;
  sejarah?: Scene2Sejarah;
  bahasa?: Scene3Bahasa;
  pakaian?: Scene4Pakaian;
  musikTarian?: Scene5MusikTarian;
  makanan?: Scene6Makanan;
}

export interface CountryProfile {
  id: string;
  name: string;
  nameEn?: string;
  officialName: string;
  officialNameEn?: string;
  flag: string;
  capital: string;
  capitalEn?: string;
  continent: string;
  continentEn?: string;
  population: string;
  populationEn?: string;
  area: string;
  areaEn?: string;
  currency: string;
  currencyEn?: string;
  wikiExtractId: string;
  wikiExtractEn: string;
  scenes: DocumentaryScene[];
}
