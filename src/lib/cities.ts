export interface ThaiCity {
  value: string
  label: string
  region: 'central' | 'north' | 'south' | 'northeast'
}

export const THAI_CITIES: ThaiCity[] = [
  // Central
  { value: 'Bangkok', label: 'Bangkok (กรุงเทพฯ)', region: 'central' },
  { value: 'Pattaya', label: 'Pattaya (พัทยา)', region: 'central' },
  { value: 'Hua Hin', label: 'Hua Hin (หัวหิน)', region: 'central' },
  { value: 'Ayutthaya', label: 'Ayutthaya (อยุธยา)', region: 'central' },
  { value: 'Kanchanaburi', label: 'Kanchanaburi (กาญจนบุรี)', region: 'central' },
  // North
  { value: 'Chiang Mai', label: 'Chiang Mai (เชียงใหม่)', region: 'north' },
  { value: 'Chiang Rai', label: 'Chiang Rai (เชียงราย)', region: 'north' },
  { value: 'Pai', label: 'Pai (ปาย)', region: 'north' },
  // South – mainland & islands
  { value: 'Phuket', label: 'Phuket (ภูเก็ต)', region: 'south' },
  { value: 'Krabi', label: 'Krabi (กระบี่)', region: 'south' },
  { value: 'Koh Samui', label: 'Koh Samui (เกาะสมุย)', region: 'south' },
  { value: 'Koh Phangan', label: 'Koh Phangan (เกาะพะงัน)', region: 'south' },
  { value: 'Koh Tao', label: 'Koh Tao (เกาะเต่า)', region: 'south' },
  { value: 'Koh Lanta', label: 'Koh Lanta (เกาะลันตา)', region: 'south' },
  { value: 'Koh Chang', label: 'Koh Chang (เกาะช้าง)', region: 'south' },
  { value: 'Phi Phi', label: 'Phi Phi (เกาะพีพี)', region: 'south' },
  { value: 'Surat Thani', label: 'Surat Thani (สุราษฎร์ธานี)', region: 'south' },
  // Northeast
  { value: 'Nakhon Ratchasima', label: 'Korat / Nakhon Ratchasima (โคราช)', region: 'northeast' },
  { value: 'Udon Thani', label: 'Udon Thani (อุดรธานี)', region: 'northeast' },
  { value: 'Khon Kaen', label: 'Khon Kaen (ขอนแก่น)', region: 'northeast' },
]

export const THAI_CITY_VALUES = THAI_CITIES.map(c => c.value)

export const REGION_LABELS: Record<ThaiCity['region'], string> = {
  central: 'Central Thailand',
  north: 'North',
  south: 'South & Islands',
  northeast: 'Northeast (Isan)',
}
