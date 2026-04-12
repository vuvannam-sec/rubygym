import { getTrainerImage, imageCatalog } from '../services/imageUtils';

export const landingFeatures = [
  {
    title: 'Quản lý lịch tập',
    description: 'Sắp xếp lịch theo tuần, kiểm soát công suất phòng tập và theo dõi lịch huấn luyện viên theo thời gian thực.',
    image: imageCatalog.featureTraining
  },
  {
    title: 'Theo dõi tiến độ',
    description: 'Lưu trữ chỉ số cân nặng, BMI, mục tiêu luyện tập và lịch sử đánh giá để đưa ra quyết định chính xác.',
    image: imageCatalog.featureTracking
  },
  {
    title: 'Cộng đồng hội viên',
    description: 'Kết nối hội viên qua workshop, challenge và các hoạt động nội bộ giúp tăng mức độ gắn kết.',
    image: imageCatalog.featureCommunity
  }
];

export const adminStats = [
  { label: 'Tổng hội viên', value: '248', caption: '+18 trong 30 ngày' },
  { label: 'HLV đang hoạt động', value: '18', caption: '93% lịch được lấp đầy' },
  { label: 'Gói tập active', value: '189', caption: 'Tỷ lệ duy trì 82%' },
  { label: 'Doanh thu tháng', value: '245 triệu', caption: '+12% so với tháng trước' }
];

export const trainerStats = [
  { label: 'Số học viên', value: '24', caption: '6 học viên mới trong tháng' },
  { label: 'Buổi tập hôm nay', value: '7', caption: 'Buổi tiếp theo lúc 16:00' },
  { label: 'Giờ làm hôm nay', value: '5.5/8h', caption: 'Còn lại 2.5 giờ khả dụng' }
];

export const memberStats = [
  { label: 'Gói hiện tại', value: 'Premium 12 tháng', caption: 'Còn hiệu lực đến 31/12/2026' },
  { label: 'Buổi tiếp theo', value: '18:00 hôm nay', caption: 'Huấn luyện viên Trần Minh Anh' },
  { label: 'Tiến độ 90 ngày', value: '-4.2kg', caption: 'BMI giảm từ 25.8 xuống 23.9' }
];

export const recentActivities = [
  { id: 1, title: 'Nguyễn Minh Anh vừa kích hoạt gói Premium 12 tháng', time: '5 phút trước', tone: 'success' },
  { id: 2, title: 'Lớp HIIT 18:00 đã đạt 92% công suất', time: '18 phút trước', tone: 'info' },
  { id: 3, title: 'Huấn luyện viên Hoàng Nam hoàn thành 8 buổi đánh giá tháng', time: '40 phút trước', tone: 'neutral' },
  { id: 4, title: 'Doanh thu tuần này tăng 9,4% so với tuần trước', time: '1 giờ trước', tone: 'success' }
];

export const trainers = [
  { id: 1, name: 'Nguyễn Hoàng Nam', specialization: 'Tăng cơ', phone: '0901234567', status: 'Đang hoạt động', clients: 24, image: getTrainerImage({ id: 1 }) },
  { id: 2, name: 'Trần Minh Anh', specialization: 'Giảm mỡ', phone: '0912345678', status: 'Đang hoạt động', clients: 19, image: getTrainerImage({ id: 2 }) },
  { id: 3, name: 'Phạm Quốc Bảo', specialization: 'PT nam', phone: '0923456789', status: 'Đang hoạt động', clients: 21, image: getTrainerImage({ id: 3 }) },
  { id: 4, name: 'Đỗ Thu Hà', specialization: 'Yoga & recovery', phone: '0945678901', status: 'Đang hoạt động', clients: 16, image: getTrainerImage({ id: 4 }) },
  { id: 5, name: 'Lê Gia Huy', specialization: 'Functional training', phone: '0934567890', status: 'Tạm nghỉ', clients: 11, image: '' },
  { id: 6, name: 'Vũ Khánh Linh', specialization: 'Cardio', phone: '0956789012', status: 'Đang hoạt động', clients: 14, image: '' }
];

export const members = [
  { id: 101, name: 'Nguyễn Thu Trang', gender: 'female', plan: 'Premium 12 tháng', trainer: 'Trần Minh Anh', joinDate: '2025-11-05', status: 'Đang hoạt động', avatar_url: '' },
  { id: 102, name: 'Lê Minh Khoa', gender: 'male', plan: 'Standard 6 tháng', trainer: 'Nguyễn Hoàng Nam', joinDate: '2025-10-21', status: 'Đang hoạt động', avatar_url: '' },
  { id: 103, name: 'Trần Đức Long', gender: 'male', plan: 'Premium 12 tháng', trainer: 'Phạm Quốc Bảo', joinDate: '2025-09-14', status: 'Tạm dừng', avatar_url: '' },
  { id: 104, name: 'Hoàng Bích Ngọc', gender: 'female', plan: 'Standard 3 tháng', trainer: 'Đỗ Thu Hà', joinDate: '2026-01-03', status: 'Đang hoạt động', avatar_url: '' },
  { id: 105, name: 'Phan Nhật Minh', gender: 'male', plan: 'Premium 12 tháng', trainer: 'Nguyễn Hoàng Nam', joinDate: '2025-12-11', status: 'Đang hoạt động', avatar_url: '' },
  { id: 106, name: 'Vũ Mai Anh', gender: 'female', plan: 'Standard 6 tháng', trainer: 'Vũ Khánh Linh', joinDate: '2025-08-01', status: 'Đang hoạt động', avatar_url: '' },
  { id: 107, name: 'Đặng Khánh Vy', gender: 'female', plan: 'Premium 12 tháng', trainer: 'Trần Minh Anh', joinDate: '2025-06-17', status: 'Đang hoạt động', avatar_url: '' }
];

export const subscriptions = [
  { id: 'SUB-001', member: 'Nguyễn Thu Trang', plan: 'Premium 12 tháng', start: '2026-01-01', end: '2026-12-31', status: 'Đang hoạt động', revenue: '18.900.000đ' },
  { id: 'SUB-002', member: 'Lê Minh Khoa', plan: 'Standard 6 tháng', start: '2026-02-15', end: '2026-08-15', status: 'Đang hoạt động', revenue: '7.500.000đ' },
  { id: 'SUB-003', member: 'Trần Đức Long', plan: 'Premium 12 tháng', start: '2025-05-01', end: '2026-04-30', status: 'Sắp hết hạn', revenue: '18.900.000đ' },
  { id: 'SUB-004', member: 'Hoàng Bích Ngọc', plan: 'Standard 3 tháng', start: '2026-03-01', end: '2026-06-01', status: 'Đang hoạt động', revenue: '4.200.000đ' },
  { id: 'SUB-005', member: 'Vũ Mai Anh', plan: 'Standard 6 tháng', start: '2025-12-10', end: '2026-06-10', status: 'Đang hoạt động', revenue: '7.500.000đ' }
];

export const events = [
  { id: 'EV-001', title: 'Yoga Sunrise cuối tuần', date: '2026-04-12 07:00', attendees: 36, status: 'Đang mở đăng ký', image_url: '' },
  { id: 'EV-002', title: 'Workshop Giảm Mỡ Bền Vững', date: '2026-04-18 09:30', attendees: 48, status: 'Đã đầy', image_url: '' },
  { id: 'EV-003', title: 'RubyGYM Challenge 30 ngày', date: '2026-05-01 06:00', attendees: 122, status: 'Sắp diễn ra', image_url: '' }
];

export const landingTrainers = trainers.slice(0, 4).map((trainer) => ({
  ...trainer,
  quote: trainer.specialization === 'Yoga & recovery'
    ? 'Tối ưu phục hồi và sự dẻo dai cho hội viên bận rộn.'
    : 'Thiết kế giáo án rõ ràng, dễ theo dõi và bám sát mục tiêu cá nhân.'
}));

export const facilityHighlights = [
  {
    title: 'Khu tạ sức mạnh',
    description: 'Không gian free-weight rộng rãi, phù hợp cho bài tập tăng cơ và sức mạnh.',
    image: imageCatalog.facilityWeights
  },
  {
    title: 'Khu cardio hiện đại',
    description: 'Trang bị máy chạy, xe đạp và khu HIIT cho các buổi đốt mỡ cường độ cao.',
    image: imageCatalog.facilityCardio
  },
  {
    title: 'Quầy lễ tân chuyên nghiệp',
    description: 'Check-in nhanh, hỗ trợ gói tập và tiếp nhận hội viên mới liền mạch.',
    image: imageCatalog.facilityReception
  }
];

export const reportRows = [
  { metric: 'Tỷ lệ giữ chân hội viên', value: '82%', change: '+4,1%' },
  { metric: 'Công suất khung giờ cao điểm', value: '91%', change: '+2,8%' },
  { metric: 'Tỷ lệ nâng cấp lên Premium', value: '36%', change: '+5,4%' },
  { metric: 'Số buổi PT trung bình / hội viên', value: '11,2', change: '+0,9' }
];

export const trainerMembers = [
  { id: 201, name: 'Nguyễn Thu Trang', gender: 'female', goal: 'Giảm 5kg', adherence: '92%', nextSession: '18:00 Thứ 2', avatar_url: '' },
  { id: 202, name: 'Vũ Mai Anh', gender: 'female', goal: 'Săn chắc vòng eo', adherence: '88%', nextSession: '07:00 Thứ 3', avatar_url: '' },
  { id: 203, name: 'Lê Minh Khoa', gender: 'male', goal: 'Tăng 3kg cơ', adherence: '95%', nextSession: '19:00 Thứ 4', avatar_url: '' },
  { id: 204, name: 'Đặng Khánh Vy', gender: 'female', goal: 'Cải thiện sức bền', adherence: '84%', nextSession: '16:00 Thứ 6', avatar_url: '' }
];

export const trainerEvaluationRows = [
  { id: 1, member: 'Nguyễn Thu Trang', month: '03/2026', weight: '58kg', bmi: '22.1', note: 'Tiến độ ổn định' },
  { id: 2, member: 'Vũ Mai Anh', month: '03/2026', weight: '52kg', bmi: '20.3', note: 'Cần tăng cường cardio' },
  { id: 3, member: 'Lê Minh Khoa', month: '03/2026', weight: '71kg', bmi: '23.4', note: 'Tăng cơ tốt' }
];

export const memberEvaluationHistory = [
  { month: '12/2025', weight: '67.4kg', bmi: '25.8', note: 'Bắt đầu chương trình' },
  { month: '01/2026', weight: '66.1kg', bmi: '25.2', note: 'Duy trì tốt lịch tập' },
  { month: '02/2026', weight: '64.8kg', bmi: '24.6', note: 'Cải thiện sức bền rõ rệt' },
  { month: '03/2026', weight: '63.2kg', bmi: '23.9', note: 'Đạt 84% mục tiêu quý' }
];

export const weeklySlots = ['05:30', '07:00', '09:00', '14:00', '16:00', '18:00'];

export const weeklyDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export const trainerWeeklySchedule = {
  '05:30': { 'Thứ 2': 'Cardio nhóm', 'Thứ 3': '', 'Thứ 4': 'PT với Khoa', 'Thứ 5': '', 'Thứ 6': 'Strength class', 'Thứ 7': 'Bootcamp' },
  '07:00': { 'Thứ 2': '', 'Thứ 3': 'PT với Mai Anh', 'Thứ 4': '', 'Thứ 5': 'Đánh giá tháng', 'Thứ 6': '', 'Thứ 7': '' },
  '09:00': { 'Thứ 2': 'Tư vấn hội viên', 'Thứ 3': '', 'Thứ 4': '', 'Thứ 5': 'PT với Trang', 'Thứ 6': '', 'Thứ 7': '' },
  '14:00': { 'Thứ 2': '', 'Thứ 3': 'Lớp circuit', 'Thứ 4': '', 'Thứ 5': '', 'Thứ 6': 'Làm giáo án', 'Thứ 7': '' },
  '16:00': { 'Thứ 2': 'PT với Khánh Vy', 'Thứ 3': '', 'Thứ 4': 'Lớp HIIT', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '18:00': { 'Thứ 2': 'PT với Thu Trang', 'Thứ 3': 'Nhóm giảm mỡ', 'Thứ 4': '', 'Thứ 5': 'PT với Minh', 'Thứ 6': 'Lớp toàn thân', 'Thứ 7': '' }
};

export const memberWeeklySchedule = {
  '05:30': { 'Thứ 2': '', 'Thứ 3': '', 'Thứ 4': '', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '07:00': { 'Thứ 2': '', 'Thứ 3': 'Cardio 45 phút', 'Thứ 4': '', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '09:00': { 'Thứ 2': '', 'Thứ 3': '', 'Thứ 4': '', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '14:00': { 'Thứ 2': '', 'Thứ 3': '', 'Thứ 4': 'Mobility', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '16:00': { 'Thứ 2': '', 'Thứ 3': '', 'Thứ 4': '', 'Thứ 5': '', 'Thứ 6': '', 'Thứ 7': '' },
  '18:00': { 'Thứ 2': 'PT cùng Minh Anh', 'Thứ 3': '', 'Thứ 4': '', 'Thứ 5': 'Strength', 'Thứ 6': '', 'Thứ 7': 'Bootcamp cuối tuần' }
};

export const memberPlan = {
  name: 'Premium 12 tháng',
  trainer: 'Trần Minh Anh',
  status: 'Đang hoạt động',
  startedAt: '01/01/2026',
  expiresAt: '31/12/2026',
  sessionsLeft: 42,
  perks: ['Đặt lịch ưu tiên', '1 buổi PT riêng mỗi tuần', 'Miễn phí workshop nội bộ']
};

export const referralData = {
  code: 'RUBY-MINHANH-2026',
  link: 'https://rubygym.vn/invite/RUBY-MINHANH-2026',
  reward: '1 tháng tập miễn phí cho mỗi lượt giới thiệu thành công',
  friends: [
    { id: 1, name: 'Hoàng Đức Huy', status: 'Đã đăng ký', joinedAt: '03/04/2026' },
    { id: 2, name: 'Nguyễn Thu Phương', status: 'Đang dùng thử', joinedAt: '06/04/2026' },
    { id: 3, name: 'Lê Tuấn Anh', status: 'Đã gửi lời mời', joinedAt: '08/04/2026' }
  ]
};
