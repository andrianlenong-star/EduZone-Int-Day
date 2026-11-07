/**
 * EduZone International Day - Centralized Quiz Registry (Final Assessment)
 * Compliant with Kurikulum Merdeka SD & Cambridge Primary Checkpoint standards.
 * Provides mutable quiz structures with local storage persistence for Admin Quiz Editor.
 */

export interface QuizQuestion {
  id: string;
  sceneContext: string; // Contoh: "[Scene 1]"
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export const DEFAULT_QUIZ_REGISTRY: Record<string, QuizQuestion[]> = {
  peru: [
    {
      id: 'peru-q1',
      sceneContext: '[Scene 1: Geografi & Pegunungan Andes]',
      questionText: 'Berapakah elevasi ketinggian benteng suku Inka Machu Picchu di atas permukaan laut?',
      options: ['1.200 meter dpl', '2.430 meter dpl', '4.800 meter dpl', '6.768 meter dpl'],
      correctAnswerIndex: 1,
    },
    {
      id: 'peru-q2',
      sceneContext: '[Scene 2: Sejarah Peradaban Kuno]',
      questionText: 'Situs peradaban tertua di Benua Amerika yang berusia lebih dari 5.000 tahun di Peru adalah?',
      options: ['Kota Suci Caral-Supe', 'Kuil Chavin de Huantar', 'Benteng Saksaywaman', 'Piramida Chan Chan'],
      correctAnswerIndex: 0,
    },
    {
      id: 'peru-q3',
      sceneContext: '[Scene 3: Bahasa Nasional & Pribumi]',
      questionText: 'Selain bahasa Spanyol, bahasa kuno apakah yang diakui resmi sebagai bahasa asli peradaban Inka di Peru?',
      options: ['Bahasa Guaraní', 'Bahasa Nahuatl', 'Bahasa Quechua', 'Bahasa Maya'],
      correctAnswerIndex: 2,
    },
    {
      id: 'peru-q4',
      sceneContext: '[Scene 4: Tekstil & Pakaian Adat]',
      questionText: 'Kain tenun Poncho khas Andes ditenun secara tradisional menggunakan serat bulu hewan apa?',
      options: ['Bulu domba Merino', 'Serat wol Alpaca dan Vicuña', 'Serat sutra ulat murbei', 'Serat wol unta Baktria'],
      correctAnswerIndex: 1,
    },
    {
      id: 'peru-q5',
      sceneContext: '[Scene 5: Musik & Tarian Tradisional]',
      questionText: 'Alat musik tiup tradisional Andes yang terdiri dari susunan tabung bambu bertingkat dinamakan?',
      options: ['Charango', 'Zampoña (Pan Flute)', 'Cajón Peru', 'Quena'],
      correctAnswerIndex: 1,
    },
    {
      id: 'peru-q6',
      sceneContext: '[Scene 6: Gastronomi Andes]',
      questionText: 'Teknik memasak tradisional Peru dengan memendam daging dan umbi di dalam lubang batu panas disebut?',
      options: ['Ceviche Marinado', 'Pachamanca', 'Lomo Saltado', 'Causa Rellena'],
      correctAnswerIndex: 1,
    },
  ],

  argentina: [
    {
      id: 'arg-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Puncak gunung tertinggi di seluruh Benua Amerika yang terletak di Argentina adalah?',
      options: ['Gunung Chimborazo', 'Gunung Huascarán', 'Gunung Aconcagua (6.961 mdpl)', 'Gunung Ojos del Salado'],
      correctAnswerIndex: 2,
    },
    {
      id: 'arg-q2',
      sceneContext: '[Scene 2: Cagar Budaya & Sejarah]',
      questionText: 'Gua prasejarah terkenal di Patagonia yang memuat cap tangan manusia berusia 12.000 tahun adalah?',
      options: ['Cueva de las Manos', 'Gua Altamira', 'Gua Lascaux', 'Gua Chauvet'],
      correctAnswerIndex: 0,
    },
    {
      id: 'arg-q3',
      sceneContext: '[Scene 3: Bahasa & Dialek]',
      questionText: 'Ciri dialek bahasa Spanyol khas Argentina (Castellano Rioplatense) yang sangat unik adalah penggunaan kata ganti?',
      options: ['Tú (tuteo)', 'Vos (voseo)', 'Usted', 'Vosotros'],
      correctAnswerIndex: 1,
    },
    {
      id: 'arg-q4',
      sceneContext: '[Scene 4: Pakaian Tradisional]',
      questionText: 'Penunggang kuda legendaris padang rumput Pampas di Argentina yang mengenakan Poncho dan Boina disebut?',
      options: ['Vaquero', 'Gaucho', 'Charro', 'Caballero'],
      correctAnswerIndex: 1,
    },
    {
      id: 'arg-q5',
      sceneContext: '[Scene 5: Seni Musik & Tari]',
      questionText: 'Instrumen akordeon kancing utama pengiring musik tarian Tango Argentina adalah?',
      options: ['Bandoneón', 'Harmonika', 'Melodika', 'Concertina'],
      correctAnswerIndex: 0,
    },
    {
      id: 'arg-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Tradisi memanggang daging di atas panggangan kayu arang lambat khas Argentina dikenal dengan nama?',
      options: ['Churrasco', 'Asado Parrilla', 'Barbacoa', 'Pastel de Choclo'],
      correctAnswerIndex: 1,
    },
  ],

  brasil: [
    {
      id: 'bra-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Sungai terpanjang dengan debit air tawar terbesar di dunia yang mengalir melintasi Brasil adalah?',
      options: ['Sungai Parana', 'Sungai Amazon', 'Sungai São Francisco', 'Sungai Tocantins'],
      correctAnswerIndex: 1,
    },
    {
      id: 'bra-q2',
      sceneContext: '[Scene 2: Monumen Bersejarah]',
      questionText: 'Patung raksasa setinggi 30 meter di puncak Gunung Corcovado kota Rio de Janeiro adalah?',
      options: ['Cristo Redentor (Kristus Penebus)', 'Monumento às Bandeiras', 'Patung Tiradentes', 'Obelisco de São Paulo'],
      correctAnswerIndex: 0,
    },
    {
      id: 'bra-q3',
      sceneContext: '[Scene 3: Bahasa Resmi]',
      questionText: 'Apakah bahasa resmi yang digunakan oleh seluruh masyarakat Brasil?',
      options: ['Bahasa Spanyol', 'Bahasa Portugis', 'Bahasa Tupi', 'Bahasa Prancis'],
      correctAnswerIndex: 1,
    },
    {
      id: 'bra-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Pakaian tradisional Baiana dari Bahia identik dengan rok putih mengembang lebar berbahan?',
      options: ['Kain wol tebal', 'Kain renda dan katun bordir', 'Kulit rusa', 'Anyaman rami kasar'],
      correctAnswerIndex: 1,
    },
    {
      id: 'bra-q5',
      sceneContext: '[Scene 5: Musik & Tari]',
      questionText: 'Irama musik dan tarian nasional Brasil yang paling terkenal di seluruh dunia saat Karnaval adalah?',
      options: ['Samba', 'Tango', 'Cumbia', 'Flamenco'],
      correctAnswerIndex: 0,
    },
    {
      id: 'bra-q6',
      sceneContext: '[Scene 6: Kuliner Khas]',
      questionText: 'Rebusan kacang hitam gurih dengan aneka daging asap yang menjadi hidangan kebangsaan Brasil adalah?',
      options: ['Moqueca', 'Feijoada', 'Acarajé', 'Pão de Queijo'],
      correctAnswerIndex: 1,
    },
  ],

  kolombia: [
    {
      id: 'col-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Pohon nasional Kolombia yang tumbuh menjulang hingga 60 meter di Lembah Cocora adalah?',
      options: ['Pohon Beringin', 'Palem Lilin Quindío (Wax Palm)', 'Pohon Mahoni', 'Pohon Karet'],
      correctAnswerIndex: 1,
    },
    {
      id: 'col-q2',
      sceneContext: '[Scene 2: Warisan Dunia]',
      questionText: 'Benteng pertahanan batu militer peninggalan Spanyol abad ke-16 di kota pesisir Kolombia adalah?',
      options: ['Castillo San Felipe de Barajas di Cartagena', 'Benteng Morro', 'Benteng San Juan', 'Kastel Chapultepec'],
      correctAnswerIndex: 0,
    },
    {
      id: 'col-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi Kolombia yang dikenal paling jernih artikulasinya di Amerika Latin adalah?',
      options: ['Bahasa Quechua', 'Bahasa Spanyol', 'Bahasa Katalan', 'Bahasa Wayuu'],
      correctAnswerIndex: 1,
    },
    {
      id: 'col-q4',
      sceneContext: '[Scene 4: Busana Adat]',
      questionText: 'Topi anyaman tradisional daun palem bergaris hitam-putih khas suku Zenú di Kolombia disebut?',
      options: ['Sombrero Vueltiao', 'Panama Hat', 'Fedora Andes', 'Boina Beret'],
      correctAnswerIndex: 0,
    },
    {
      id: 'col-q5',
      sceneContext: '[Scene 5: Musik & Tarian]',
      questionText: 'Dua aliran musik rakyat paling bergengsi yang diakui UNESCO dari Kolombia adalah?',
      options: ['Cumbia dan Vallenato', 'Reggaeton dan Bachata', 'Samba dan Bossa Nova', 'Tango dan Milonga'],
      correctAnswerIndex: 0,
    },
    {
      id: 'col-q6',
      sceneContext: '[Scene 6: Kuliner]',
      questionText: 'Hidangan piring besar khas Antioquia yang memadukan kacang merah, daging, chicharrón, dan arepa adalah?',
      options: ['Ajiaco Bogotá', 'Bandeja Paisa', 'Sancocho', 'Tamales'],
      correctAnswerIndex: 1,
    },
  ],

  jepang: [
    {
      id: 'jpn-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Gunung berapi tertinggi di Jepang yang disakralkan dan memiliki ketinggian 3.776 mdpl adalah?',
      options: ['Gunung Aso', 'Gunung Fuji', 'Gunung Kita', 'Gunung Haku'],
      correctAnswerIndex: 1,
    },
    {
      id: 'jpn-q2',
      sceneContext: '[Scene 2: Arsitektur Bersejarah]',
      questionText: 'Kastel megah berjuluk "Bangau Putih" dengan arsitektur kayu tanpa paku di Prefektur Hyogo adalah?',
      options: ['Kastel Osaka', 'Kastel Himeji', 'Kastel Matsumoto', 'Kastel Nagoya'],
      correctAnswerIndex: 1,
    },
    {
      id: 'jpn-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Tiga sistem aksara penulisan yang digunakan secara berdampingan dalam bahasa Jepang adalah?',
      options: ['Hangeul, Hanzi, Romaji', 'Hiragana, Katakana, dan Kanji', 'Devanagari, Arab, Latin', 'Katakana, Hangul, Cyrillic'],
      correctAnswerIndex: 1,
    },
    {
      id: 'jpn-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Pakaian tradisional sutra Jepang yang dilipat anggun dan diikat dengan sabuk Obi adalah?',
      options: ['Yukata Kasual', 'Kimono', 'Hanbok', 'Cheongsam'],
      correctAnswerIndex: 1,
    },
    {
      id: 'jpn-q5',
      sceneContext: '[Scene 5: Alat Musik Tradisional]',
      questionText: 'Alat musik petik panjang tradisional Jepang yang memiliki 13 dawai sutra adalah?',
      options: ['Shamisen', 'Koto', 'Biwa', 'Taiko'],
      correctAnswerIndex: 1,
    },
    {
      id: 'jpn-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Kaldu dasar masakan Jepang yang dibuat dari rebusan rumput laut kombu dan serutan ikan cakalang disebut?',
      options: ['Kaldu Miso', 'Dashi', 'Shoyu', 'Mirin'],
      correctAnswerIndex: 1,
    },
  ],

  india: [
    {
      id: 'ind-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Pegunungan tertinggi di dunia yang membentang di bagian utara India adalah?',
      options: ['Pegunungan Andes', 'Pegunungan Himalaya', 'Pegunungan Alpen', 'Pegunungan Ural'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ind-q2',
      sceneContext: '[Scene 2: Monumen Warisan Dunia]',
      questionText: 'Monumen makam marmer putih megah peninggalan Kaisar Shah Jahan di kota Agra adalah?',
      options: ['Qutub Minar', 'Taj Mahal', 'Benteng Merah Delhi', 'Hawa Mahal'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ind-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi pemerintahan federal India bersama dengan bahasa Inggris adalah?',
      options: ['Bahasa Bengali', 'Bahasa Hindi', 'Bahasa Tamil', 'Bahasa Telugu'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ind-q4',
      sceneContext: '[Scene 4: Pakaian Adat]',
      questionText: 'Kain panjang tradisional anggun wanita India sepanjang 5 hingga 9 meter yang dililitkan rapi disebut?',
      options: ['Salwar Kameez', 'Sari (Saree)', 'Lehenga', 'Kurti'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ind-q5',
      sceneContext: '[Scene 5: Musik & Instrumen]',
      questionText: 'Alat musik petik berleher panjang berkubah labu kering khas musik klasik Hindustani adalah?',
      options: ['Sarod', 'Sitar', 'Veena', 'Santur'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ind-q6',
      sceneContext: '[Scene 6: Kuliner Tradisional]',
      questionText: 'Hidangan nasi rempah wangi khas India yang dimasak bersama daging atau sayuran dan kunyit adalah?',
      options: ['Biryani', 'Roti Canai', 'Samosa', 'Chana Masala'],
      correctAnswerIndex: 0,
    },
  ],

  cina: [
    {
      id: 'chn-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Sungai terpanjang di Benua Asia yang mengalir melintasi seluruh daratan Tiongkok adalah?',
      options: ['Sungai Kuning (Huang He)', 'Sungai Yangtze (Chang Jiang)', 'Sungai Mekong', 'Sungai Mutiara'],
      correctAnswerIndex: 1,
    },
    {
      id: 'chn-q2',
      sceneContext: '[Scene 2: Keajaiban Arsitektur]',
      questionText: 'Struktur benteng pertahanan batu raksasa sepanjang lebih dari 20.000 km di Tiongkok adalah?',
      options: ['Kota Terlarang Beijing', 'Tembok Raksasa Tiongkok (Great Wall)', 'Kuil Surga', 'Tentara Terakota'],
      correctAnswerIndex: 1,
    },
    {
      id: 'chn-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi dan dialek standar nasional di Republik Rakyat Tiongkok adalah?',
      options: ['Bahasa Kanton', 'Bahasa Mandarin Standar (Putonghua)', 'Bahasa Hokkien', 'Bahasa Hakka'],
      correctAnswerIndex: 1,
    },
    {
      id: 'chn-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Gaun sutra berkerah tinggi pas badan khas wanita Tiongkok yang anggun dinamakan?',
      options: ['Hanfu Klasik', 'Cheongsam (Qipao)', 'Zhongshan Suit', 'Tangzhuang'],
      correctAnswerIndex: 1,
    },
    {
      id: 'chn-q5',
      sceneContext: '[Scene 5: Musik Tradisional]',
      questionText: 'Instrumen gesek berdawai dua berdinding kulit ular khas musik tradisional Tiongkok adalah?',
      options: ['Guzheng', 'Erhu', 'Pipa', 'Dizi'],
      correctAnswerIndex: 1,
    },
    {
      id: 'chn-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Seni memanggang bebek renyah legendaris dari ibu kota Beijing yang disajikan dengan kulit garing tipis adalah?',
      options: ['Bebek Panggang Beijing (Peking Duck)', 'Dim Sum Kanton', 'Hotpot Sichuan', 'Kung Pao Chicken'],
      correctAnswerIndex: 0,
    },
  ],

  korea_selatan: [
    {
      id: 'kor-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Gunung berapi perisai tertinggi di Korea Selatan yang berada di Pulau Jeju adalah?',
      options: ['Gunung Seoraksan', 'Gunung Hallasan (1.947 mdpl)', 'Gunung Jirisan', 'Gunung Bukhansan'],
      correctAnswerIndex: 1,
    },
    {
      id: 'kor-q2',
      sceneContext: '[Scene 2: Istana Bersejarah]',
      questionText: 'Istana utama terbesar Dinasti Joseon yang dibangun pada tahun 1395 di pusat kota Seoul adalah?',
      options: ['Istana Changdeokgung', 'Istana Gyeongbokgung', 'Istana Deoksugung', 'Istana Changgyeonggung'],
      correctAnswerIndex: 1,
    },
    {
      id: 'kor-q3',
      sceneContext: '[Scene 3: Sistem Bahasa]',
      questionText: 'Alfabet fonetik ilmiah Korea yang diciptakan oleh Raja Sejong yang Agung pada abad ke-15 dinamakan?',
      options: ['Hanja', 'Hangeul (한글)', 'Katakana', 'Cyrillic'],
      correctAnswerIndex: 1,
    },
    {
      id: 'kor-q4',
      sceneContext: '[Scene 4: Pakaian Tradisional]',
      questionText: 'Pakaian tradisional bangsa Korea yang terdiri atas atasan Jeogori dan rok Chima mengembang adalah?',
      options: ['Hanbok', 'Kimono', 'Ao Dai', 'Kebaya'],
      correctAnswerIndex: 0,
    },
    {
      id: 'kor-q5',
      sceneContext: '[Scene 5: Alat Musik]',
      questionText: 'Alat musik petik tradisional Korea dengan 12 senar sutra di atas kotak kayu paulownia adalah?',
      options: ['Geomungo', 'Gayageum', 'Haegeum', 'Daegeum'],
      correctAnswerIndex: 1,
    },
    {
      id: 'kor-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Sawi putih atau lobak fermentasi pedas khas Korea yang difermentasi dalam tempayan Onggi disebut?',
      options: ['Bibimbap', 'Kimchi', 'Bulgogi', 'Tteokbokki'],
      correctAnswerIndex: 1,
    },
  ],

  malaysia: [
    {
      id: 'mys-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Puncak tertinggi di Malaysia dan kepulauan Kalimantan yang berada di Sabah adalah?',
      options: ['Gunung Tahan', 'Gunung Kinabalu (4.095 mdpl)', 'Gunung Trusmadi', 'Gunung Murud'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mys-q2',
      sceneContext: '[Scene 2: Monumen Modern]',
      questionText: 'Menara kembar setinggi 452 meter di Kuala Lumpur yang menjadi ikon kemajuan Malaysia adalah?',
      options: ['Menara KL Tower', 'Menara Kembar Petronas', 'Merdeka 118', 'Exchange 106'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mys-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa kebangsaan resmi yang ditetapkan dalam konstitusi Malaysia adalah?',
      options: ['Bahasa Inggris', 'Bahasa Melayu (Bahasa Malaysia)', 'Bahasa Mandarin', 'Bahasa Tamil'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mys-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Baju tradisional pria Melayu yang dilengkapi dengan kain samping songket dan songkok adalah?',
      options: ['Baju Kurung', 'Baju Melayu Cekak Musang / Teluk Belanga', 'Baju Kebaya', 'Baju Batik'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mys-q5',
      sceneContext: '[Scene 5: Musik & Seni Pertunjukan]',
      questionText: 'Seni teater musik tari tradisional Kelantan yang diiringi rebab dan gong adalah?',
      options: ['Wayang Kulit Kelantan', 'Mak Yong', 'Dikir Barat', 'Kuda Kepang'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mys-q6',
      sceneContext: '[Scene 6: Makanan Khas]',
      questionText: 'Hidangan kebangsaan Malaysia berupa nasi gurih santan dengan sambal, ikan bilis, dan kacang goreng adalah?',
      options: ['Roti Canai', 'Nasi Lemak', 'Laksa Penang', 'Char Kway Teow'],
      correctAnswerIndex: 1,
    },
  ],

  vietnam: [
    {
      id: 'vnm-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Teluk perairan spektakuler di Vietnam utara dengan ribuan pulau batu kapur karst adalah?',
      options: ['Teluk Tonkin', 'Teluk Ha Long (Ha Long Bay)', 'Teluk Cam Ranh', 'Teluk Da Nang'],
      correctAnswerIndex: 1,
    },
    {
      id: 'vnm-q2',
      sceneContext: '[Scene 2: Sejarah & Cagar Budaya]',
      questionText: 'Kota pelabuhan kuno abad ke-15 di pesisir tengah Vietnam yang diakui UNESCO adalah?',
      options: ['Kota Kuno Hoi An', 'Ibu Kota Hue', 'Benteng Hanoi', 'My Son Sanctuary'],
      correctAnswerIndex: 0,
    },
    {
      id: 'vnm-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Sistem ortografi berhuruf Latin berdiakritik tonal yang digunakan untuk menulis bahasa Vietnam adalah?',
      options: ['Chu Nom', 'Quoc Ngu', 'Pinyin', 'Hangul'],
      correctAnswerIndex: 1,
    },
    {
      id: 'vnm-q4',
      sceneContext: '[Scene 4: Pakaian Adat]',
      questionText: 'Pakaian tunik panjang sutra berbelah samping yang dipadukan dengan celana panjang dan topi Non La adalah?',
      options: ['Ao Ba Ba', 'Ao Dai', 'Ao Tu Than', 'Hanfu'],
      correctAnswerIndex: 1,
    },
    {
      id: 'vnm-q5',
      sceneContext: '[Scene 5: Alat Musik Unik]',
      questionText: 'Alat musik tradisional Vietnam yang hanya memiliki satu senar tunggal dengan batang kelenturan nada adalah?',
      options: ['Dan Tranh', 'Dan Bau (Monochord)', 'Dan Nguyet', 'Sao Truc'],
      correctAnswerIndex: 1,
    },
    {
      id: 'vnm-q6',
      sceneContext: '[Scene 6: Kuliner]',
      questionText: 'Sup mi beras aromatik dengan kaldu sapi bening berempah kayu manis dan adas bintang khas Vietnam adalah?',
      options: ['Bun Cha', 'Pho Bo', 'Banh Mi', 'Goi Cuon'],
      correctAnswerIndex: 1,
    },
  ],

  filipina: [
    {
      id: 'phl-q1',
      sceneContext: '[Scene 1: Geografi Kepulauan]',
      questionText: 'Negara Filipina terdiri dari lebih dari berapa pulau dalam wilayah kepulauannya?',
      options: ['1.000 pulau', '7.641 pulau', '17.500 pulau', '300 pulau'],
      correctAnswerIndex: 1,
    },
    {
      id: 'phl-q2',
      sceneContext: '[Scene 2: Warisan Pertanian]',
      questionText: 'Terasering sawah kuno bertingkat berusia 2.000 tahun yang dipahat oleh suku Ifugao di pegunungan adalah?',
      options: ['Sawah Tegalalang', 'Banaue Rice Terraces', 'Sawah Yuanyang', 'Sawah Sa Pa'],
      correctAnswerIndex: 1,
    },
    {
      id: 'phl-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi nasional Filipina yang distandardisasi dari bahasa Tagalog adalah?',
      options: ['Bahasa Cebuano', 'Bahasa Filipino', 'Bahasa Ilocano', 'Bahasa Spanyol'],
      correctAnswerIndex: 1,
    },
    {
      id: 'phl-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Kemeja bordir tipis pria Filipina berbahan serat nanas (piña) yang dikenakan tanpa dimasukkan adalah?',
      options: ['Barong Tagalog', 'Baro\'t Saya', 'Malong', 'Terno'],
      correctAnswerIndex: 0,
    },
    {
      id: 'phl-q5',
      sceneContext: '[Scene 5: Seni Tari Tradisional]',
      questionText: 'Tarian rakyat Filipina yang dilakukan dengan melompati sepasang batang bambu yang saling diketukkan adalah?',
      options: ['Singkil', 'Tinikling', 'Pandanggo sa Ilaw', 'Maglalatik'],
      correctAnswerIndex: 1,
    },
    {
      id: 'phl-q6',
      sceneContext: '[Scene 6: Kuliner Khas]',
      questionText: 'Metode memasak daging ayam atau babi dengan kuah cuka, kecap kedelai, bawang putih, dan lada adalah?',
      options: ['Sinigang', 'Chicken / Pork Adobo', 'Kare-Kare', 'Lechon'],
      correctAnswerIndex: 1,
    },
  ],

  thailand: [
    {
      id: 'tha-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Sungai utama yang mengalir membelah ibu kota Bangkok dan menyuburkan dataran tengah Thailand adalah?',
      options: ['Sungai Mekong', 'Sungai Chao Phraya', 'Sungai Salween', 'Sungai Ping'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tha-q2',
      sceneContext: '[Scene 2: Kuil & Arsitektur]',
      questionText: 'Kuil suci terpenting di Bangkok yang menyimpan patung Buddha Zamrud (Phra Kaew) adalah?',
      options: ['Wat Arun', 'Wat Phra Kaew (Grand Palace)', 'Wat Pho', 'Wat Traimit'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tha-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi negara Thailand yang memiliki sistem aksara unik bersuku kata tonal adalah?',
      options: ['Bahasa Lao', 'Bahasa Thai (ภาษาไทย)', 'Bahasa Khmer', 'Bahasa Melayu'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tha-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Kain selendang sutra lipat anggun yang disampirkan di dada wanita dalam busana Chut Thai disebut?',
      options: ['Chong Kraben', 'Sabai', 'Sinh', 'Sarong'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tha-q5',
      sceneContext: '[Scene 5: Seni Musik & Bela Diri]',
      questionText: 'Seni bela diri nasional Thailand berjuluk "Seni Delapan Tungkai" yang diiringi musik Sarama adalah?',
      options: ['Krabi Krabong', 'Muay Thai', 'Silat', 'Taekwondo'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tha-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Sup udang berkuah asam pedas aromatik beraroma serai, daun jeruk, dan lengkuas khas Thailand adalah?',
      options: ['Pad Thai', 'Tom Yum Goong', 'Green Curry (Gaeng Keow Wan)', 'Som Tum'],
      correctAnswerIndex: 1,
    },
  ],

  italia: [
    {
      id: 'ita-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Gunung berapi aktif di daratan Eropa yang meletus dan mengubur kota Pompeii pada tahun 79 Masehi adalah?',
      options: ['Gunung Etna', 'Gunung Vesuvius', 'Gunung Stromboli', 'Gunung Vulcano'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ita-q2',
      sceneContext: '[Scene 2: Monumen Kuno]',
      questionText: 'Amfiteater batu raksasa peninggalan Kekaisaran Romawi berkapasitas 50.000 penonton di kota Roma adalah?',
      options: ['Circus Maximus', 'Colosseum (Amphitheatrum Flavium)', 'Pantheon', 'Forum Romanum'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ita-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa Italia modern berakar dari dialek Toskana yang dipopulerkan oleh sastrawan ternama?',
      options: ['Petrarca', 'Dante Alighieri (Divina Commedia)', 'Boccaccio', 'Machiavelli'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ita-q4',
      sceneContext: '[Scene 4: Seni Mode & Tekstil]',
      questionText: 'Kota di Italia utara yang diakui sebagai salah satu ibu kota mode dan desain tekstil dunia adalah?',
      options: ['Napoli', 'Milano', 'Genova', 'Palermo'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ita-q5',
      sceneContext: '[Scene 5: Musik Klasik]',
      questionText: 'Pencipta alat musik biola paling bernilai tinggi di dunia yang berasal dari Cremona, Italia adalah?',
      options: ['Bartolomeo Cristofori', 'Antonio Stradivari', 'Niccolò Paganini', 'Giacomo Puccini'],
      correctAnswerIndex: 1,
    },
    {
      id: 'ita-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Pizza tradisional Napoli yang menggunakan saus tomat San Marzano, keju mozzarella, dan daun basil segar adalah?',
      options: ['Pizza Marinara', 'Pizza Margherita', 'Pizza Quattro Stagioni', 'Pizza Diavola'],
      correctAnswerIndex: 1,
    },
  ],

  jerman: [
    {
      id: 'deu-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Kawasan hutan lebat pegunungan di barat daya Jerman yang menjadi sumber mata air Sungai Donau adalah?',
      options: ['Hutan Bavaria', 'Schwarzwald (Black Forest)', 'Pegunungan Harz', 'Hutan Thuringia'],
      correctAnswerIndex: 1,
    },
    {
      id: 'deu-q2',
      sceneContext: '[Scene 2: Monumen Bersejarah]',
      questionText: 'Monumen neoklasik di Berlin yang menjadi lambang reunifikasi dan persatuan bangsa Jerman adalah?',
      options: ['Gedung Reichstag', 'Gerbang Brandenburg (Brandenburger Tor)', 'Katedral Köln', 'Tugu Kemenangan Siegessäule'],
      correctAnswerIndex: 1,
    },
    {
      id: 'deu-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa Jerman baku yang diajarkan secara resmi di seluruh lembaga pendidikan disebut?',
      options: ['Plattdeutsch', 'Hochdeutsch (Bahasa Jerman Standar)', 'Bayerisch', 'Schwäbisch'],
      correctAnswerIndex: 1,
    },
    {
      id: 'deu-q4',
      sceneContext: '[Scene 4: Pakaian Tradisional]',
      questionText: 'Celana pendek kulit khas kaum pria dan gaun berenda khas wanita di kawasan Bavaria adalah?',
      options: ['Kilt dan Sash', 'Lederhosen dan Dirndl', 'Poncho dan Boina', 'Tuxedo dan Corset'],
      correctAnswerIndex: 1,
    },
    {
      id: 'deu-q5',
      sceneContext: '[Scene 5: Komponis Musik Klasik]',
      questionText: 'Komponis jenius kelahiran kota Bonn, Jerman yang menciptakan Simfoni No. 9 "Ode to Joy" adalah?',
      options: ['Johann Sebastian Bach', 'Ludwig van Beethoven', 'Johannes Brahms', 'Richard Wagner'],
      correctAnswerIndex: 1,
    },
    {
      id: 'deu-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Roti gurih simpul bertabur kristal garam khas Jerman yang dipanggang kecokelatan mengilap adalah?',
      options: ['Pumpernickel', 'Pretzel (Brezel)', 'Baguette', 'Brioche'],
      correctAnswerIndex: 1,
    },
  ],

  belanda: [
    {
      id: 'nld-q1',
      sceneContext: '[Scene 1: Geografi & Tanggul]',
      questionText: 'Istilah geografi untuk daratan rendah yang direklamasi dari laut dan dilindungi oleh tanggul di Belanda adalah?',
      options: ['Fjord', 'Polder', 'Delta', 'Atol'],
      correctAnswerIndex: 1,
    },
    {
      id: 'nld-q2',
      sceneContext: '[Scene 2: Teknologi Kincir Angin]',
      questionText: 'Situs warisan dunia UNESCO dengan jajaran 19 kincir angin drainase air abad ke-18 di Belanda adalah?',
      options: ['Zaanse Schans', 'Kinderdijk', 'Keukenhof', 'Giethoorn'],
      correctAnswerIndex: 1,
    },
    {
      id: 'nld-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Bahasa resmi kerajaan Belanda yang berakar dari rumpun bahasa Jermanik Barat adalah?',
      options: ['Bahasa Frisia', 'Bahasa Belanda (Nederlands)', 'Bahasa Flam', 'Bahasa Jerman'],
      correctAnswerIndex: 1,
    },
    {
      id: 'nld-q4',
      sceneContext: '[Scene 4: Sepatu Tradisional]',
      questionText: 'Sepatu kayu tradisional Belanda yang diukir dari sebatang kayu pohon poplar atau dedalu adalah?',
      options: ['Sandal Getah', 'Klompen (Wooden Shoes)', 'Moccasin', 'Espadrille'],
      correctAnswerIndex: 1,
    },
    {
      id: 'nld-q5',
      sceneContext: '[Scene 5: Seni Lukis Golden Age]',
      questionText: 'Pelukis legendaris Zaman Keemasan Belanda yang melukis mahakarya "The Night Watch" adalah?',
      options: ['Vincent van Gogh', 'Rembrandt van Rijn', 'Johannes Vermeer', 'Frans Hals'],
      correctAnswerIndex: 1,
    },
    {
      id: 'nld-q6',
      sceneContext: '[Scene 6: Kuliner]',
      questionText: 'Wafel tipis bundar berlapis sirup karamel manis hangat khas kota Gouda Belanda adalah?',
      options: ['Poffertjes', 'Stroopwafel', 'Bitterballen', 'Oliebollen'],
      correctAnswerIndex: 1,
    },
  ],

  prancis: [
    {
      id: 'fra-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Puncak gunung tertinggi di kawasan Pegunungan Alpen yang berada di wilayah Prancis adalah?',
      options: ['Matterhorn', 'Mont Blanc (4.808 mdpl)', 'Monte Rosa', 'Jungfrau'],
      correctAnswerIndex: 1,
    },
    {
      id: 'fra-q2',
      sceneContext: '[Scene 2: Monumen Ikonik]',
      questionText: 'Menara kisi besi tempa setinggi 330 meter yang dibangun oleh Gustave Eiffel untuk Pameran Dunia 1889 adalah?',
      options: ['Arc de Triomphe', 'Menara Eiffel (Tour Eiffel)', 'Museum Louvre', 'Katedral Notre-Dame'],
      correctAnswerIndex: 1,
    },
    {
      id: 'fra-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Lembaga resmi kenegaraan yang bertugas menjaga kemurnian dan standardisasi tata bahasa Prancis adalah?',
      options: ['Sorbonne University', 'Académie Française', 'Bibliothèque Nationale', 'Collège de France'],
      correctAnswerIndex: 1,
    },
    {
      id: 'fra-q4',
      sceneContext: '[Scene 4: Budaya Mode]',
      questionText: 'Topi bundar datar tanpa tepi berbahan wol felt yang menjadi simbol khas Prancis adalah?',
      options: ['Fedora', 'Beret (Béret)', 'Top Hat', 'Panama'],
      correctAnswerIndex: 1,
    },
    {
      id: 'fra-q5',
      sceneContext: '[Scene 5: Musik & Tari]',
      questionText: 'Alat musik tiup tradisional Auvergne berbahan kulit kambing dan pipa kayu yang mendahului akordeon adalah?',
      options: ['Musette', 'Cabrette', 'Hurdy-gurdy', 'Bombarde'],
      correctAnswerIndex: 1,
    },
    {
      id: 'fra-q6',
      sceneContext: '[Scene 6: Gastronomi UNESCO]',
      questionText: 'Roti tongkat renyah khas Prancis berkerak emas dengan remah lembut di dalamnya dinamakan?',
      options: ['Croissant', 'Baguette', 'Brioche', 'Pain de Campagne'],
      correctAnswerIndex: 1,
    },
  ],

  inggris: [
    {
      id: 'gbr-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Sungai bersejarah yang mengalir melintasi pusat kota London adalah?',
      options: ['Sungai Severn', 'Sungai Thames', 'Sungai Mersey', 'Sungai Trent'],
      correctAnswerIndex: 1,
    },
    {
      id: 'gbr-q2',
      sceneContext: '[Scene 2: Monumen Megalitikum]',
      questionText: 'Lingkaran batu megalitikum misterius berusia lebih dari 4.500 tahun di Dataran Salisbury adalah?',
      options: ['Avebury Ring', 'Stonehenge', 'Newgrange', 'Karnak Menhir'],
      correctAnswerIndex: 1,
    },
    {
      id: 'gbr-q3',
      sceneContext: '[Scene 3: Sastra & Bahasa]',
      questionText: 'Dramawan dan penyair terbesar sastra Inggris yang menulis karya legendaris "Hamlet" dan "Romeo and Juliet" adalah?',
      options: ['Geoffrey Chaucer', 'William Shakespeare', 'Charles Dickens', 'John Milton'],
      correctAnswerIndex: 1,
    },
    {
      id: 'gbr-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Rok lipit bermotif kotak-kotak tartan wol khas dataran tinggi Skotlandia (Highlands) dinamakan?',
      options: ['Tweed', 'Kilt', 'Toga', 'Sari'],
      correctAnswerIndex: 1,
    },
    {
      id: 'gbr-q5',
      sceneContext: '[Scene 5: Instrumen Musik]',
      questionText: 'Alat musik tiup kantung udara khas Skotlandia yang dimainkan pada upacara kehormatan adalah?',
      options: ['Flute', 'Bagpipe (Great Highland Bagpipe)', 'Clarinet', 'Oboe'],
      correctAnswerIndex: 1,
    },
    {
      id: 'gbr-q6',
      sceneContext: '[Scene 6: Tradisi Teh]',
      questionText: 'Tradisi bangsawan minum teh petang yang disajikan dengan roti scone, krim kental, dan selai adalah?',
      options: ['High Lunch', 'Afternoon Tea', 'Morning Roast', 'Royal Supper'],
      correctAnswerIndex: 1,
    },
  ],

  spanyol: [
    {
      id: 'esp-q1',
      sceneContext: '[Scene 1: Geografi Semenanjung]',
      questionText: 'Pegunungan yang menjadi batas bentang alam pemisah alami antara Spanyol dan Prancis adalah?',
      options: ['Pegunungan Sierra Nevada', 'Pegunungan Pirenia (Pyrenees)', 'Pegunungan Cantabria', 'Pegunungan Alpen'],
      correctAnswerIndex: 1,
    },
    {
      id: 'esp-q2',
      sceneContext: '[Scene 2: Arsitektur Mahakarya]',
      questionText: 'Basilika mahakarya arsitek Antoni Gaudí yang pembangunannya dimulai sejak 1882 di Barcelona adalah?',
      options: ['Katedral Sevilla', 'Basílica de la Sagrada Família', 'Istana Alhambra', 'Mezquita de Córdoba'],
      correctAnswerIndex: 1,
    },
    {
      id: 'esp-q3',
      sceneContext: '[Scene 3: Bahasa Resmi]',
      questionText: 'Selain bahasa Spanyol Kastilia, bahasa apakah yang dituturkan di wilayah otonom Catalunya?',
      options: ['Bahasa Basque', 'Bahasa Katalan (Català)', 'Bahasa Galisia', 'Bahasa Asturia'],
      correctAnswerIndex: 1,
    },
    {
      id: 'esp-q4',
      sceneContext: '[Scene 4: Pakaian Adat]',
      questionText: 'Gaun rumbai bertumpuk indah berenda yang dikenakan oleh penari Flamenco di Andalusia dinamakan?',
      options: ['Traje de Luces', 'Traje de Flamenca (Bata de Cola)', 'Mantilla', 'Pollera'],
      correctAnswerIndex: 1,
    },
    {
      id: 'esp-q5',
      sceneContext: '[Scene 5: Seni Musik & Tari]',
      questionText: 'Seni perpaduan petikan gitar klasik, nyanyian cante jondo, dan hentakan tumit zapateado adalah?',
      options: ['Fado', 'Flamenco', 'Paso Doble', 'Bolero'],
      correctAnswerIndex: 1,
    },
    {
      id: 'esp-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Masakan nasi wangi kuning kunyit yang dimasak di wajan datar lebar dengan makanan laut atau ayam adalah?',
      options: ['Gazpacho', 'Paella Valenciana', 'Tortilla Española', 'Churros'],
      correctAnswerIndex: 1,
    },
  ],

  rusia: [
    {
      id: 'rus-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Danau air tawar terdalam dan tertua di dunia yang berada di kawasan Siberia Rusia adalah?',
      options: ['Danau Ladoga', 'Danau Baikal (1.642 meter)', 'Danau Onega', 'Laut Kaspia'],
      correctAnswerIndex: 1,
    },
    {
      id: 'rus-q2',
      sceneContext: '[Scene 2: Monumen Lapangan Merah]',
      questionText: 'Katedral berkubah bawang warna-warni yang dibangun oleh Ivan yang Mengerikan di Lapangan Merah Moskow adalah?',
      options: ['Katedral Kristus Penyelamat', 'Katedral Santo Basil (Saint Basil)', 'Katedral Kazan', 'Katedral Saint Isaac'],
      correctAnswerIndex: 1,
    },
    {
      id: 'rus-q3',
      sceneContext: '[Scene 3: Aksara Bahasa]',
      questionText: 'Sistem alfabet aksara yang digunakan dalam penulisan bahasa Rusia adalah?',
      options: ['Aksara Latin', 'Aksara Kiril (Cyrillic)', 'Aksara Yunani', 'Aksara Glagolitik'],
      correctAnswerIndex: 1,
    },
    {
      id: 'rus-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Gaun pinafore panjang tradisional tanpa lengan yang dipadukan dengan mahkota hiasan kepala Kokoshnik adalah?',
      options: ['Kaftan', 'Sarafan', 'Ushanka', 'Kosovorotka'],
      correctAnswerIndex: 1,
    },
    {
      id: 'rus-q5',
      sceneContext: '[Scene 5: Alat Musik Tradisional]',
      questionText: 'Instrumen petik tradisional Rusia yang memiliki badan berbentuk segitiga unik berdawai tiga adalah?',
      options: ['Gusli', 'Balalaika', 'Domra', 'Bayan'],
      correctAnswerIndex: 1,
    },
    {
      id: 'rus-q6',
      sceneContext: '[Scene 6: Kuliner]',
      questionText: 'Sup tradisional berwarna merah keunguan yang dibuat dari rebusan umbi bit dan daging sapi adalah?',
      options: ['Shchi', 'Borscht', 'Pelmeni', 'Beef Stroganoff'],
      correctAnswerIndex: 1,
    },
  ],

  portugal: [
    {
      id: 'prt-q1',
      sceneContext: '[Scene 1: Geografi Samudra]',
      questionText: 'Tanjung tebing karang paling barat dari seluruh benua daratan Eropa yang berada di Portugal adalah?',
      options: ['Cabo de São Vicente', 'Cabo da Roca', 'Cabo Espichel', 'Ponta da Piedade'],
      correctAnswerIndex: 1,
    },
    {
      id: 'prt-q2',
      sceneContext: '[Scene 2: Monumen Pelayaran]',
      questionText: 'Menara pertahanan batu putih bergaya arsitektur Manueline di muara Sungai Tagus kota Lisboa adalah?',
      options: ['Kastel São Jorge', 'Menara Belém (Torre de Belém)', 'Biara Jerónimos', 'Istana Pena'],
      correctAnswerIndex: 1,
    },
    {
      id: 'prt-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Penyair nasional terbesar Portugal yang menulis epos petualangan samudra "Os Lusíadas" adalah?',
      options: ['Fernando Pessoa', 'Luís de Camões', 'José Saramago', 'Eça de Queirós'],
      correctAnswerIndex: 1,
    },
    {
      id: 'prt-q4',
      sceneContext: '[Scene 4: Seni Keramik Azulejo]',
      questionText: 'Seni dekorasi ubin keramik berglasur lukisan biru-putih khas bangunan bersejarah Portugal disebut?',
      options: ['Talavera', 'Azulejos', 'Mosaik Ravenna', 'Zellij'],
      correctAnswerIndex: 1,
    },
    {
      id: 'prt-q5',
      sceneContext: '[Scene 5: Musik Tradisional]',
      questionText: 'Genre musik balada melankolis penuh penghayatan kerinduan (saudade) yang diakui UNESCO adalah?',
      options: ['Choro', 'Fado', 'Modinha', 'Ranchera'],
      correctAnswerIndex: 1,
    },
    {
      id: 'prt-q6',
      sceneContext: '[Scene 6: Kue Tradisional]',
      questionText: 'Tart telur panggang renyah berkaramel kayu manis yang resep aslinya dirahasiakan sejak abad ke-19 adalah?',
      options: ['Bolo de Arroz', 'Pastel de Nata (Pastéis de Belém)', 'Queijada', 'Bolo de Berlim'],
      correctAnswerIndex: 1,
    },
  ],

  amerika_serikat: [
    {
      id: 'usa-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Ngarai raksasa spektakuler sepanjang 446 km yang dibentuk oleh erosi Sungai Colorado di Arizona adalah?',
      options: ['Yosemite Valley', 'Grand Canyon', 'Bryce Canyon', 'Zion Canyon'],
      correctAnswerIndex: 1,
    },
    {
      id: 'usa-q2',
      sceneContext: '[Scene 2: Monumen Kebebasan]',
      questionText: 'Patung perunggu neoklasik setinggi 93 meter di pelabuhan New York hadiah persahabatan dari Prancis adalah?',
      options: ['Monumen Washington', 'Patung Liberty (Statue of Liberty)', 'Gunung Rushmore', 'Lincoln Memorial'],
      correctAnswerIndex: 1,
    },
    {
      id: 'usa-q3',
      sceneContext: '[Scene 3: Bahasa]',
      questionText: 'Meskipun tidak memiliki bahasa resmi tertulis dalam konstitusi federal, bahasa de facto nasional AS adalah?',
      options: ['Bahasa Spanyol', 'Bahasa Inggris (American English)', 'Bahasa Prancis', 'Bahasa Cherokee'],
      correctAnswerIndex: 1,
    },
    {
      id: 'usa-q4',
      sceneContext: '[Scene 4: Busana Kasual Dunia]',
      questionText: 'Celana berbahan kain denim biru kokoh yang dipatenkan oleh Levi Strauss dan Jacob Davis pada 1873 adalah?',
      options: ['Khakis', 'Blue Jeans', 'Chinos', 'Cargo Pants'],
      correctAnswerIndex: 1,
    },
    {
      id: 'usa-q5',
      sceneContext: '[Scene 5: Kelahiran Aliran Musik]',
      questionText: 'Aliran musik improvisasi yang lahir dari komunitas Afrika-Amerika di kota New Orleans awal abad ke-20 adalah?',
      options: ['Rock and Roll', 'Jazz', 'Country', 'Bluegrass'],
      correctAnswerIndex: 1,
    },
    {
      id: 'usa-q6',
      sceneContext: '[Scene 6: Gastronomi Tradisional]',
      questionText: 'Pai buah manis tradisional berkerak mentega renyah yang menjadi simbol ungkapan budaya Amerika adalah?',
      options: ['Pecan Pie', 'Apple Pie', 'Pumpkin Pie', 'Key Lime Pie'],
      correctAnswerIndex: 1,
    },
  ],

  canada: [
    {
      id: 'can-q1',
      sceneContext: '[Scene 1: Geografi & Danau Glasial]',
      questionText: 'Danau glasial berwarna biru toska cemerlang yang dikelilingi puncak salju di Taman Nasional Banff adalah?',
      options: ['Danau Superior', 'Lake Louise', 'Danau Huron', 'Danau Athabasca'],
      correctAnswerIndex: 1,
    },
    {
      id: 'can-q2',
      sceneContext: '[Scene 2: Lambang Nasional]',
      questionText: 'Simbol alam yang menghiasi bendera nasional Kanada sejak tahun 1965 adalah?',
      options: ['Pohon Pinus', 'Daun Maple (Maple Leaf)', 'Bunga Lily', 'Pohon Oak'],
      correctAnswerIndex: 1,
    },
    {
      id: 'can-q3',
      sceneContext: '[Scene 3: Status Bahasa Resmi]',
      questionText: 'Dua bahasa resmi yang memiliki kesetaraan status federal di seluruh lembaga kenegaraan Kanada adalah?',
      options: ['Inggris dan Spanyol', 'Inggris dan Prancis (English & French)', 'Inggris dan Inuktitut', 'Prancis dan Jerman'],
      correctAnswerIndex: 1,
    },
    {
      id: 'can-q4',
      sceneContext: '[Scene 4: Busana Polisi Berkuda]',
      questionText: 'Seragam jas merah kirmizi bersejarah yang dikenakan Polisi Berkuda Kerajaan Kanada (RCMP) adalah?',
      options: ['Kilt Tartan', 'Red Serge', 'Tweed Blazer', 'Parka Fur'],
      correctAnswerIndex: 1,
    },
    {
      id: 'can-q5',
      sceneContext: '[Scene 5: Olahraga Musim Dingin]',
      questionText: 'Olahraga musim dingin resmi paling dicintai masyarakat yang dimainkan di atas lapisan es menggunakan keping puck adalah?',
      options: ['Curling', 'Ice Hockey', 'Bobsleigh', 'Snowboarding'],
      correctAnswerIndex: 1,
    },
    {
      id: 'can-q6',
      sceneContext: '[Scene 6: Kuliner]',
      questionText: 'Hidangan khas Québec berupa kentang goreng renyah bertabur gumpalan keju dadih dan kuah kaldu kental gurih adalah?',
      options: ['Tourtière', 'Poutine', 'Butter Tart', 'Bannock'],
      correctAnswerIndex: 1,
    },
  ],

  texas: [
    {
      id: 'tx-q1',
      sceneContext: '[Scene 1: Geografi & Julukan]',
      questionText: 'Julukan resmi negara bagian Texas yang mengacu pada satu bintang tunggal pada benderanya adalah?',
      options: ['Sunshine State', 'The Lone Star State', 'Golden State', 'Empire State'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tx-q2',
      sceneContext: '[Scene 2: Sejarah Perjuangan]',
      questionText: 'Misi benteng bersejarah di San Antonio yang menjadi simbol perjuangan kemerdekaan Republik Texas 1836 adalah?',
      options: ['Benteng Goliad', 'The Alamo (Misi San Antonio de Valero)', 'Benteng Sam Houston', 'San Jacinto Battleground'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tx-q3',
      sceneContext: '[Scene 3: Bahasa & Budaya Bilingual]',
      questionText: 'Perpaduan dialek bahasa Inggris dan Spanyol yang jamak dituturkan di perbatasan selatan Texas dinamakan?',
      options: ['Creole', 'Spanglish / Tejano Spanish', 'Patois', 'Cajun'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tx-q4',
      sceneContext: '[Scene 4: Pakaian Koboi]',
      questionText: 'Topi bertepi lebar melengkung tinggi berbahan bulu laken yang dipopulerkan oleh John B. Stetson adalah?',
      options: ['Fedora Hat', 'Cowboy Hat (Stetson)', 'Boina', 'Sombrero'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tx-q5',
      sceneContext: '[Scene 5: Musik Tradisional]',
      questionText: 'Aliran musik country berdansa ceria dengan perpaduan akordeon dan biola khas Texas adalah?',
      options: ['Bluegrass', 'Western Swing & Tejano Music', 'Delta Blues', 'Cajun Zydeco'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tx-q6',
      sceneContext: '[Scene 6: Gastronomi]',
      questionText: 'Teknik pengasapan daging sapi brisket lambat selama 12 hingga 16 jam dengan kayu ek keras adalah?',
      options: ['Carolina Pulled Pork', 'Texas Smoked Barbecue (Brisket)', 'Kansas Ribs', 'Memphis Dry Rub'],
      correctAnswerIndex: 1,
    },
  ],

  meksiko: [
    {
      id: 'mex-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Semenanjung batu kapur di Meksiko tenggara yang memisahkan Teluk Meksiko dan Laut Karibia adalah?',
      options: ['Semenanjung Baja California', 'Semenanjung Yucatan', 'Semenanjung Florida', 'Semenanjung Tehuantepec'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mex-q2',
      sceneContext: '[Scene 2: Piramida Peradaban Maya]',
      questionText: 'Piramida berundak peradaban Maya El Castillo yang menjadi salah satu Keajaiban Dunia Baru adalah?',
      options: ['Teotihuacan', 'Chichen Itza', 'Palenque', 'Tikal'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mex-q3',
      sceneContext: '[Scene 3: Bahasa Asli]',
      questionText: 'Bahasa asli peradaban Aztek yang menyumbang kata seperti cokelat, tomat, dan alpukat ke bahasa dunia adalah?',
      options: ['Bahasa Maya', 'Bahasa Nahuatl', 'Bahasa Zapotek', 'Bahasa Mixtek'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mex-q4',
      sceneContext: '[Scene 4: Busana Tradisional]',
      questionText: 'Topi bertepi sangat lebar berhias sulaman benang emas perak khas penunggang kuda Charro Meksiko adalah?',
      options: ['Panama Hat', 'Sombrero Charro', 'Boina', 'Fedora'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mex-q5',
      sceneContext: '[Scene 5: Musik Rakyat]',
      questionText: 'Kelompok pemusik tradisional Meksiko yang mengenakan setelan Charro dengan terompet, biola, dan guitarrón adalah?',
      options: ['Tango Orquesta', 'Mariachi', 'Conjunto Vallenato', 'Banda Sinaloense'],
      correctAnswerIndex: 1,
    },
    {
      id: 'mex-q6',
      sceneContext: '[Scene 6: Gastronomi UNESCO]',
      questionText: 'Roti pipih berbahan dasar jagung yang dipanggang di atas comal sebagai wadah taco dan quesadilla adalah?',
      options: ['Arepa', 'Tortilla Jagung', 'Pita', 'Naan'],
      correctAnswerIndex: 1,
    },
  ],

  indonesia: [
    {
      id: 'idn-q1',
      sceneContext: '[Scene 1: Geografi Nusantara]',
      questionText: 'Sebagai negara kepulauan terbesar di dunia, Indonesia memiliki lebih dari berapa pulau?',
      options: ['5.000 pulau', '17.000 pulau', '10.000 pulau', '25.000 pulau'],
      correctAnswerIndex: 1,
    },
    {
      id: 'idn-q2',
      sceneContext: '[Scene 2: Candi Warisan UNESCO]',
      questionText: 'Candi Buddha terbesar di dunia yang dibangun pada abad ke-8 oleh Wangsa Syailendra di Magelang adalah?',
      options: ['Candi Prambanan', 'Candi Borobudur', 'Candi Mendut', 'Candi Sewu'],
      correctAnswerIndex: 1,
    },
    {
      id: 'idn-q3',
      sceneContext: '[Scene 3: Bahasa Persatuan]',
      questionText: 'Bahasa Indonesia diikrarkan sebagai bahasa persatuan bangsa Indonesia pada peristiwa bersejarah?',
      options: ['Proklamasi 17 Agustus 1945', 'Sumpah Pemuda 28 Oktober 1928', 'Hari Kebangkitan Nasional 1908', 'Sidang BPUPKI 1945'],
      correctAnswerIndex: 1,
    },
    {
      id: 'idn-q4',
      sceneContext: '[Scene 4: Warisan Kemanusiaan]',
      questionText: 'Kain bergambar yang dibuat dengan malam (lilin) menggunakan canting dan diakui warisan budaya dunia UNESCO adalah?',
      options: ['Kain Ulos', 'Batik Indonesia', 'Kain Songket', 'Kain Tenun Ikat'],
      correctAnswerIndex: 1,
    },
    {
      id: 'idn-q5',
      sceneContext: '[Scene 5: Alat Musik Tradisional]',
      questionText: 'Ansambel musik tradisional yang terdiri atas gong, kenong, saron, dan kendang di Jawa dan Bali adalah?',
      options: ['Kolintang', 'Gamelan', 'Angklung', 'Sasando'],
      correctAnswerIndex: 1,
    },
    {
      id: 'idn-q6',
      sceneContext: '[Scene 6: Kuliner Terlezat Dunia]',
      questionText: 'Masakan daging sapi kaya rempah asal Minangkabau yang dimasak perlahan dengan santan hingga berminyak hitam adalah?',
      options: ['Gudeg', 'Rendang', 'Sate Maranggi', 'Rawon'],
      correctAnswerIndex: 1,
    },
  ],

  mesir: [
    {
      id: 'egy-q1',
      sceneContext: '[Scene 1: Geografi]',
      questionText: 'Sungai terpanjang di benua Afrika yang menjadi sumber denyut kehidupan peradaban Mesir kuno adalah?',
      options: ['Sungai Kongo', 'Sungai Nil', 'Sungai Niger', 'Sungai Zambezi'],
      correctAnswerIndex: 1,
    },
    {
      id: 'egy-q2',
      sceneContext: '[Scene 2: Monumen Kuno]',
      questionText: 'Piramida tertua dan terbesar dari Tiga Piramida Giza yang dibangun untuk Firaun Khufu adalah?',
      options: ['Piramida Khafre', 'Piramida Agung Giza (Great Pyramid of Giza)', 'Piramida Menkaure', 'Piramida Bertingkat Djoser'],
      correctAnswerIndex: 1,
    },
    {
      id: 'egy-q3',
      sceneContext: '[Scene 3: Aksara Kuno]',
      questionText: 'Sistem tulisan lambang bergambar yang dipahatkan oleh bangsa Mesir kuno pada dinding makam dan papirus adalah?',
      options: ['Paku (Cuneiform)', 'Hieroglif Mesir', 'Fenisia', 'Demotik'],
      correctAnswerIndex: 1,
    },
    {
      id: 'egy-q4',
      sceneContext: '[Scene 4: Pakaian Tradisional]',
      questionText: 'Jubah panjang longgar berbahan katun yang nyaman dikenakan masyarakat di Mesir sehari-hari adalah?',
      options: ['Kaftan', 'Galabeya (Jellabiya)', 'Thobe', 'Burnous'],
      correctAnswerIndex: 1,
    },
    {
      id: 'egy-q5',
      sceneContext: '[Scene 5: Instrumen Musik Kuno]',
      questionText: 'Seruling bambu tiup berongga terbuka yang telah dimainkan di lembah Sungai Nil sejak zaman firaun adalah?',
      options: ['Darbuka', 'Ney (Nay)', 'Qanun', 'Riq'],
      correctAnswerIndex: 1,
    },
    {
      id: 'egy-q6',
      sceneContext: '[Scene 6: Kuliner Rakyat]',
      questionText: 'Hidangan rakyat Mesir yang memadukan nasi, lentil hitam, makaroni, buncis, dan saus tomat pedas berbawang goreng adalah?',
      options: ['Ful Medames', 'Koshari (Kushari)', 'Molokhia', 'Shawarma'],
      correctAnswerIndex: 1,
    },
  ],

  yunani: [
    {
      id: 'grc-q1',
      sceneContext: '[Scene 1: Geografi Maritim]',
      questionText: 'Laut yang mengelilingi ribuan pulau indah di sebelah timur daratan Yunani adalah?',
      options: ['Laut Ionia', 'Laut Aegea (Aegean Sea)', 'Laut Adriatik', 'Laut Tirenia'],
      correctAnswerIndex: 1,
    },
    {
      id: 'grc-q2',
      sceneContext: '[Scene 2: Arsitektur Klasik]',
      questionText: 'Kuil pualam putih berketinggian bukit Akropolis Athena yang dipersembahkan untuk Dewi Athena adalah?',
      options: ['Kuil Zeus', 'Parthenon', 'Erechtheion', 'Kuil Apollo di Delphi'],
      correctAnswerIndex: 1,
    },
    {
      id: 'grc-q3',
      sceneContext: '[Scene 3: Bahasa & Huruf]',
      questionText: 'Alfabet tertua di Eropa yang melahirkan huruf Alpha, Beta, dan Gamma adalah?',
      options: ['Alfabet Latin', 'Alfabet Yunani (Greek Alphabet)', 'Aksara Fenisia', 'Aksara Etruria'],
      correctAnswerIndex: 1,
    },
    {
      id: 'grc-q4',
      sceneContext: '[Scene 4: Busana Pengawal Kehormatan]',
      questionText: 'Rok lipit putih 400 lipatan bersejarah yang dikenakan pasukan pengawal Evzones Yunani dinamakan?',
      options: ['Chiton', 'Foustanella', 'Toga', 'Himation'],
      correctAnswerIndex: 1,
    },
    {
      id: 'grc-q5',
      sceneContext: '[Scene 5: Musik & Tari Rakyat]',
      questionText: 'Alat musik petik dawai logam berleher panjang yang mengiringi tarian Syrtaki Zorba adalah?',
      options: ['Mandolin', 'Bouzouki', 'Lira Kreta', 'Baglamas'],
      correctAnswerIndex: 1,
    },
    {
      id: 'grc-q6',
      sceneContext: '[Scene 6: Kuliner Mediterania]',
      questionText: 'Pangsit lapis terung, kentang, dan daging cincang berlumur saus bechamel lembut khas Yunani adalah?',
      options: ['Souvlaki', 'Moussaka', 'Spanakopita', 'Gyros'],
      correctAnswerIndex: 1,
    },
  ],

  australia: [
    {
      id: 'aus-q1',
      sceneContext: '[Scene 1: Terumbu Karang Terbesar]',
      questionText: 'Sistem terumbu karang laut terbesar di dunia sepanjang 2.300 km di lepas pantai Queensland adalah?',
      options: ['Ningaloo Reef', 'Great Barrier Reef', 'Lord Howe Island', 'Coral Triangle'],
      correctAnswerIndex: 1,
    },
    {
      id: 'aus-q2',
      sceneContext: '[Scene 2: Ikon Arsitektur Dunia]',
      questionText: 'Gedung pertunjukan dengan atap berbentuk cangkang layar kapal di pelabuhan Sydney adalah?',
      options: ['Sydney Harbour Bridge', 'Sydney Opera House', 'Centrepoint Tower', 'Crown Sydney'],
      correctAnswerIndex: 1,
    },
    {
      id: 'aus-q3',
      sceneContext: '[Scene 3: Kearifan Aborigin]',
      questionText: 'Formasi batu pasir merah raksasa yang disakralkan oleh suku asli Anangu di pedalaman gurun Australia adalah?',
      options: ['Klaasies River', 'Uluru (Ayers Rock)', 'Bungle Bungles', 'Cradle Mountain'],
      correctAnswerIndex: 1,
    },
    {
      id: 'aus-q4',
      sceneContext: '[Scene 4: Topi Peternak]',
      questionText: 'Topi laken bulu kelinci bertepi lebar khas koboi peternak Outback Australia adalah?',
      options: ['Fedora', 'Akubra Hat', 'Boina', 'Sombrero'],
      correctAnswerIndex: 1,
    },
    {
      id: 'aus-q5',
      sceneContext: '[Scene 5: Alat Musik Tertua]',
      questionText: 'Instrumen tiup pipa kayu eukaliptus beresonansi dengung yang diciptakan penduduk asli Aborigin adalah?',
      options: ['Boomerang', 'Didgeridoo (Yidaki)', 'Bullroarer', 'Gumleaf'],
      correctAnswerIndex: 1,
    },
    {
      id: 'aus-q6',
      sceneContext: '[Scene 6: Makanan Ikonik]',
      questionText: 'Kue busa panggang renyah berhias krim kental dan potongan buah segar seperti kiwi dan stroberi adalah?',
      options: ['Lamington', 'Pavlova', 'Meat Pie', 'Anzac Biscuit'],
      correctAnswerIndex: 1,
    },
  ],

  afrika_selatan: [
    {
      id: 'zaf-q1',
      sceneContext: '[Scene 1: Geografi Ikonik]',
      questionText: 'Gunung berpermukaan puncak datar mirip meja yang menjulang di kota Cape Town adalah?',
      options: ['Gunung Drakensberg', 'Table Mountain (Tafelberg)', 'Lion\'s Head', 'Gunung Cederberg'],
      correctAnswerIndex: 1,
    },
    {
      id: 'zaf-q2',
      sceneContext: '[Scene 2: Sejarah Perjuangan]',
      questionText: 'Tokoh perdamaian dan presiden kulit hitam pertama yang memimpin penghapusan sistem Apartheid adalah?',
      options: ['Desmond Tutu', 'Nelson Mandela (Madiba)', 'Steve Biko', 'Oliver Tambo'],
      correctAnswerIndex: 1,
    },
    {
      id: 'zaf-q3',
      sceneContext: '[Scene 3: Keragaman Bahasa]',
      questionText: 'Berapakah jumlah bahasa resmi kenegaraan yang diakui dalam konstitusi Afrika Selatan?',
      options: ['2 bahasa', '11 bahasa resmi', '5 bahasa', '1 bahasa'],
      correctAnswerIndex: 1,
    },
    {
      id: 'zaf-q4',
      sceneContext: '[Scene 4: Tekstil Tradisional]',
      questionText: 'Kain katun bermotif cetak geometris khas yang menjadi pakaian adat di Afrika Selatan disebut?',
      options: ['Kente', 'Shweshwe Fabric', 'Ankara', 'Bogolan'],
      correctAnswerIndex: 1,
    },
    {
      id: 'zaf-q5',
      sceneContext: '[Scene 5: Paduan Suara & Musik]',
      questionText: 'Gaya bernyanyi akapela harmoni empat suara suku Zulu tanpa instrumen pengiring disebut?',
      options: ['Kwaito', 'Isicathamiya (seperti Ladysmith Black Mambazo)', 'Mbaqanga', 'Marabi'],
      correctAnswerIndex: 1,
    },
    {
      id: 'zaf-q6',
      sceneContext: '[Scene 6: Budaya Kuliner]',
      questionText: 'Tradisi memanggang aneka daging bersama kerabat di atas bara api kayu keras di Afrika Selatan dinamakan?',
      options: ['Potjiekos', 'Braai (Barbeque Tradisional)', 'Bobotie', 'Biltong'],
      correctAnswerIndex: 1,
    },
  ],

  turki: [
    {
      id: 'tur-q1',
      sceneContext: '[Scene 1: Geografi Lintas Benua]',
      questionText: 'Selat perairan strategis yang membelah kota Istanbul dan menghubungkan Benua Asia serta Eropa adalah?',
      options: ['Selat Dardanella', 'Selat Bosporus', 'Selat Gibraltar', 'Selat Messina'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tur-q2',
      sceneContext: '[Scene 2: Monumen Bersejarah]',
      questionText: 'Bangunan kubah megah berusia 1.500 tahun di Istanbul yang awalnya katedral Bizantium kemudian masjid adalah?',
      options: ['Masjid Biru (Sultan Ahmed)', 'Hagia Sophia (Ayasofya)', 'Istana Topkapi', 'Menara Galata'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tur-q3',
      sceneContext: '[Scene 3: Reformasi Bahasa]',
      questionText: 'Pemimpin yang memodernisasi Turki dan mengganti huruf Arab ke alfabet Latin pada tahun 1928 adalah?',
      options: ['Sultan Mehmed II', 'Mustafa Kemal Atatürk', 'Suleiman the Magnificent', 'İsmet İnönü'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tur-q4',
      sceneContext: '[Scene 4: Seni Permadani]',
      questionText: 'Seni anyaman karpet simpul ganda (Ghiordes knot) khas Turki yang mendunia sejak era Seljuk adalah?',
      options: ['Kilim & Karpet Anatolia', 'Batik Halus', 'Songket Tenun', 'Tapestry Gobelins'],
      correctAnswerIndex: 0,
    },
    {
      id: 'tur-q5',
      sceneContext: '[Scene 5: Tarian Sufi]',
      questionText: 'Tarian meditatif berputar melingkar yang diiringi tiupan seruling Ney terinspirasi oleh penyair Jalaluddin Rumi adalah?',
      options: ['Halay', 'Whirling Dervishes (Tari Sema Sufi)', 'Zeybek', 'Horon'],
      correctAnswerIndex: 1,
    },
    {
      id: 'tur-q6',
      sceneContext: '[Scene 6: Kudapan Manis]',
      questionText: 'Pastri renyah berlapis filo tipis berisi cincangan kacang pistachio atau kenari berlumur sirup madu adalah?',
      options: ['Lokum (Turkish Delight)', 'Baklava', 'Kunefe', 'Tulumba'],
      correctAnswerIndex: 1,
    },
  ],
};

const STORAGE_KEY = 'eduzone_admin_quiz_registry';

/**
 * Normalizes input string to matched country keys.
 */
export function normalizeCountryKey(key: string): string {
  const clean = key.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (DEFAULT_QUIZ_REGISTRY[clean]) return clean;

  const aliases: Record<string, string> = {
    colombia: 'kolombia',
    germany: 'jerman',
    japan: 'jepang',
    france: 'prancis',
    china: 'cina',
    south_korea: 'korea_selatan',
    korea: 'korea_selatan',
    philippines: 'filipina',
    spain: 'spanyol',
    russia: 'rusia',
    united_states: 'amerika_serikat',
    usa: 'amerika_serikat',
    uk: 'inggris',
    united_kingdom: 'inggris',
    netherlands: 'belanda',
    egypt: 'mesir',
    greece: 'yunani',
    south_africa: 'afrika_selatan',
    turkey: 'turki',
    brazil: 'brasil',
    mexico: 'meksiko',
  };

  if (aliases[clean]) return aliases[clean];

  // Try finding substring match
  const found = Object.keys(DEFAULT_QUIZ_REGISTRY).find(
    (k) => clean.includes(k) || k.includes(clean)
  );
  return found || 'peru';
}

/**
 * Retrieves the mutable quiz questions for a given country.
 * Prioritizes LocalStorage saved modifications made in Admin Mode.
 */
export function getCountryQuiz(countryIdOrName: string): QuizQuestion[] {
  const countryKey = normalizeCountryKey(countryIdOrName);
  
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed[countryKey]) && parsed[countryKey].length > 0) {
          return parsed[countryKey];
        }
      }
    } catch (err) {
      console.warn('[QuizRegistry] Failed to read from localStorage:', err);
    }
  }

  // Fallback to defaults
  const fallback = DEFAULT_QUIZ_REGISTRY[countryKey] || DEFAULT_QUIZ_REGISTRY['peru'];
  // Clone to avoid accidental in-place mutation of the frozen constant
  return JSON.parse(JSON.stringify(fallback));
}

/**
 * Saves updated quiz questions for a country into LocalStorage.
 */
export function saveCountryQuiz(countryIdOrName: string, questions: QuizQuestion[]): void {
  const countryKey = normalizeCountryKey(countryIdOrName);
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    existing[countryKey] = questions;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[QuizRegistry] Failed to save quiz questions to localStorage:', err);
  }
}

/**
 * Resets a country's quiz questions back to the pristine default set.
 */
export function resetCountryQuizToDefault(countryIdOrName: string): QuizQuestion[] {
  const countryKey = normalizeCountryKey(countryIdOrName);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existing = JSON.parse(stored);
        delete existing[countryKey];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
    } catch {
      // ignore
    }
  }
  const defaultList = DEFAULT_QUIZ_REGISTRY[countryKey] || DEFAULT_QUIZ_REGISTRY['peru'];
  return JSON.parse(JSON.stringify(defaultList));
}

/**
 * Returns all 30 supported country keys in the registry.
 */
export function getAllRegisteredCountries(): string[] {
  return Object.keys(DEFAULT_QUIZ_REGISTRY);
}
