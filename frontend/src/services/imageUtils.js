const AVATAR_PLACEHOLDER_COLORS = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#264653', '#F4A261'];

export const imageCatalog = {
  heroPrimary: '/images/hero-banner.jpg',
  heroSecondary: '/images/hero-banner-2.jpg',
  featureTraining: '/images/feature-training.jpg',
  featureTracking: '/images/feature-tracking.jpg',
  featureCommunity: '/images/feature-community.jpg',
  trainerMale1: '/images/trainer-male-1.jpg',
  trainerMale2: '/images/trainer-male-2.jpg',
  trainerMale3: '/images/trainer-male-3.jpg',
  trainerFemale1: '/images/trainer-female-1.jpg',
  eventYoga: '/images/event-yoga.jpg',
  eventYoga2: '/images/event-yoga-2.jpg',
  eventWorkshop: '/images/event-workshop.jpg',
  eventWorkshop2: '/images/event-workshop-2.jpg',
  eventChallenge: '/images/event-challenge.jpg',
  eventChallenge2: '/images/event-challenge-2.jpg',
  memberMaleDefault: '/images/member-male-default.jpg',
  memberFemaleDefault: '/images/member-female-default.jpg',
  facilityWeights: '/images/facility-weights.jpg',
  facilityCardio: '/images/facility-cardio.jpg',
  facilityReception: '/images/facility-reception.jpg'
};

export const eventImagePool = [
  imageCatalog.eventYoga,
  imageCatalog.eventYoga2,
  imageCatalog.eventWorkshop,
  imageCatalog.eventWorkshop2,
  imageCatalog.eventChallenge,
  imageCatalog.eventChallenge2
];

const femaleMiddleNames = ['thị', 'mai', 'thu', 'ngọc', 'linh', 'hà', 'vy', 'trang', 'anh', 'phương', 'hương', 'lan'];
const maleMiddleNames = ['văn', 'hữu', 'đức', 'quốc', 'gia', 'hoàng', 'minh', 'nhật', 'tuấn', 'bảo', 'huy', 'khoa', 'long'];

export function getNumericId(value) {
  const match = String(value ?? '').match(/\d+/g);
  return match ? Number(match.join('')) : 0;
}

export function getRotatedEventImage(eventId, customImageUrl) {
  if (customImageUrl) {
    return customImageUrl;
  }

  const numericId = getNumericId(eventId);
  return eventImagePool[numericId % eventImagePool.length];
}

export function inferGenderFromName(name = '', explicitGender = '') {
  const normalized = explicitGender.toLowerCase();
  if (normalized === 'male' || normalized === 'nam') {
    return 'male';
  }
  if (normalized === 'female' || normalized === 'nữ' || normalized === 'nu') {
    return 'female';
  }

  const parts = String(name).toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (parts.some((part) => femaleMiddleNames.includes(part))) {
    return 'female';
  }
  if (parts.some((part) => maleMiddleNames.includes(part))) {
    return 'male';
  }

  const firstName = parts[parts.length - 1] || '';
  if (['trang', 'linh', 'hà', 'vy', 'anh', 'mai', 'ngọc', 'phương'].includes(firstName)) {
    return 'female';
  }
  return 'male';
}

export function getDefaultMemberAvatar(member = {}) {
  if (member.avatar_url) {
    return member.avatar_url;
  }

  const gender = inferGenderFromName(member.name || member.full_name, member.gender);
  return gender === 'female' ? imageCatalog.memberFemaleDefault : imageCatalog.memberMaleDefault;
}

export function getMemberInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'RG';
  }
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return `${first}${last}`.toUpperCase();
}

export function getAvatarPlaceholderColor(id) {
  const numericId = getNumericId(id);
  return AVATAR_PLACEHOLDER_COLORS[numericId % AVATAR_PLACEHOLDER_COLORS.length];
}

export function getTrainerImage(trainer = {}) {
  if (trainer.image_url) {
    return trainer.image_url;
  }

  const trainerImageMap = {
    1: imageCatalog.trainerMale1,
    2: imageCatalog.trainerMale2,
    3: imageCatalog.trainerMale3,
    4: imageCatalog.trainerFemale1
  };

  return trainerImageMap[getNumericId(trainer.id)] || '';
}
