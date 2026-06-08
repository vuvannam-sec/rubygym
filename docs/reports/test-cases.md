# RubyGYM Test Cases

| ID | Module | Test Case | Input | Expected Output | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-AUTH-01 | Auth | Dang ky hoi vien hop le | Email moi, mat khau, ho ten, so dien thoai | Tao user moi, tra ve `201` va `userId` | High |
| TC-AUTH-02 | Auth | Dang ky voi email da ton tai | Email trung | Tra ve loi DB/tu choi tao moi | High |
| TC-AUTH-03 | Auth | Dang nhap voi thong tin hop le | `admin@rubygym.com`, `admin123` | Tra ve JWT token va thong tin user | High |
| TC-AUTH-04 | Auth | Dang nhap sai mat khau | Email hop le, password sai | Tra ve `401 Invalid credentials` | High |
| TC-AUTH-05 | Auth | Dang nhap voi email khong ton tai | Email la, password bat ky | Tra ve `401 Invalid credentials` | High |
| TC-AUTH-06 | Auth | Goi API bao ve khi khong co token | GET `/api/trainers` khong Authorization | Tra ve `401 No token provided` | High |
| TC-TRAINER-01 | Trainers | Admin xem danh sach HLV | JWT admin | Tra ve danh sach HLV co `full_name`, `email`, `specialization` | High |
| TC-TRAINER-02 | Trainers | Trainer xem danh sach HLV | JWT trainer | Tra ve danh sach HLV | Medium |
| TC-TRAINER-03 | Trainers | Member xem danh sach HLV | JWT member | Tra ve danh sach HLV | Medium |
| TC-TRAINER-04 | Trainers | Admin xem chi tiet HLV | GET `/api/trainers/:id` | Tra ve thong tin day du cua HLV | High |
| TC-TRAINER-05 | Trainers | Lay chi tiet HLV khong ton tai | ID khong hop le | Tra ve `404 Trainer not found` | High |
| TC-TRAINER-06 | Trainers | Admin tao HLV moi | Email, password, phone, specialization | Tao user role TRAINER va trainer record moi | High |
| TC-TRAINER-07 | Trainers | Trainer cap nhat chinh minh | PUT `/api/trainers/:id` dung ID cua minh | Tra ve `200 Trainer updated` | High |
| TC-TRAINER-08 | Trainers | Trainer cap nhat HLV khac | PUT voi ID khac minh | Tra ve `403 Access denied` | High |
| TC-TRAINER-09 | Trainers | Admin xem client cua HLV | GET `/api/trainers/:id/clients` | Danh sach hoi vien thuoc HLV do | High |
| TC-TRAINER-10 | Trainers | Member xem client cua HLV | JWT member | Tra ve `403 Access denied` | Medium |
| TC-TRAINER-11 | Trainers | Admin xoa HLV khong con rang buoc | DELETE `/api/trainers/:id` | Xoa trainer, lich tap, user lien quan | High |
| TC-MEMBER-01 | Members | Admin xem danh sach hoi vien | JWT admin | Tra ve danh sach hoi vien va ten HLV | High |
| TC-MEMBER-02 | Members | Trainer xem danh sach hoi vien tong | GET `/api/members` bang JWT trainer | Tra ve `403 Access denied` | Medium |
| TC-MEMBER-03 | Members | Admin xem chi tiet hoi vien | GET `/api/members/:id` | Tra ve thong tin chi tiet | High |
| TC-MEMBER-04 | Members | Member xem chinh profile cua minh | GET `/api/members/:id` dung ID cua minh | Tra ve `200` | High |
| TC-MEMBER-05 | Members | Member xem profile nguoi khac | ID khac tai khoan dang nhap | Tra ve `403 Access denied` | High |
| TC-MEMBER-06 | Members | Trainer xem hoi vien thuoc client cua minh | JWT trainer va member co `trainer_id` phu hop | Tra ve `200` | High |
| TC-MEMBER-07 | Members | Trainer xem hoi vien khong phai client | Member cua trainer khac | Tra ve `403 Access denied` | High |
| TC-MEMBER-08 | Members | Admin tao hoi vien moi | Email, password, join_date, trainer_id | Tao user role MEMBER va member record moi | High |
| TC-MEMBER-09 | Members | Member cap nhat so dien thoai cua minh | PUT `/api/members/:id` voi `phone` moi | Cap nhat thanh cong | Medium |
| TC-MEMBER-10 | Members | Admin cap nhat trainer cho hoi vien | PUT voi `trainer_id` moi | Hoi vien duoc doi trainer | High |
| TC-MEMBER-11 | Members | Admin xoa hoi vien | DELETE `/api/members/:id` | Xoa subscriptions, evaluations, user lien quan | High |
| TC-SCHEDULE-01 | Schedule | HLV xem lich cua chinh minh | GET `/api/schedule/trainer/:trainerId` | Tra ve danh sach session sap xep theo ngay gio | High |
| TC-SCHEDULE-02 | Schedule | HLV xem lich HLV khac | JWT trainer, `trainerId` khac | Tra ve `403 Access denied` | High |
| TC-SCHEDULE-03 | Schedule | Hoi vien xem lich cua minh | GET `/api/schedule/member/:memberId` | Tra ve lich tap ca nhan | High |
| TC-SCHEDULE-04 | Schedule | Tao session hop le | Trainer, ngay hop le, 1-3 member thuoc dung HLV | Tra ve `201 Session created` | High |
| TC-SCHEDULE-05 | Schedule | Tao session ngoai gio hoat dong | `12:00-13:00` | Tra ve `400 Session must be within operating hours` | High |
| TC-SCHEDULE-06 | Schedule | Tao session qua 2 gio | `05:00-07:30` | Tra ve `400 Session duration cannot exceed 2 hours` | High |
| TC-SCHEDULE-07 | Schedule | Tao session co hon 3 hoi vien | `member_ids` co 4 phan tu | Tra ve `400 A session can have at most 3 members` | High |
| TC-SCHEDULE-08 | Schedule | Tao session khien HLV vuot 8 gio/ngay | Tong phut da co + session moi > 480 | Tra ve `400 Trainer has reached 8h limit for this day` | High |
| TC-SCHEDULE-09 | Schedule | Tao session co member khong thuoc HLV | `member_ids` chua member cua trainer khac | Tra ve `400 Member must belong to the selected trainer` | High |
| TC-SCHEDULE-10 | Schedule | Tao session khien member vuot 3 buoi/ngay | Member da co 3 sessions trong ngay | Tra ve `400 Member has reached 3 sessions for this day` | High |
| TC-SCHEDULE-11 | Schedule | Cap nhat session hop le | PUT session voi gio moi trong gio hoat dong | Tra ve `200 Session updated` | Medium |
| TC-SCHEDULE-12 | Schedule | Xoa session | DELETE `/api/schedule/:id` | Xoa session va session_members | Medium |
| TC-SUB-01 | Subscriptions | Admin xem tat ca goi tap | GET `/api/subscriptions` | Tra ve danh sach goi tap | High |
| TC-SUB-02 | Subscriptions | Member xem goi tap cua minh | JWT member | Tra ve chi cac goi tap cua member do | High |
| TC-SUB-03 | Subscriptions | Tao goi quy thong thuong | Member, `QUARTERLY`, khong loyalty/referral | End date = start + 3 thang | High |
| TC-SUB-04 | Subscriptions | Tao goi cho hoi vien loyal | Hoi vien join tren 1 nam | `members.is_loyal = 1`, cong them 3 thang mien phi | High |
| TC-SUB-05 | Subscriptions | Tao goi co referral bonus | Hoi vien co 2 nguoi duoc gioi thieu | Cong them 2 thang mien phi | High |
| TC-SUB-06 | Subscriptions | Member tao goi cho nguoi khac | JWT member, `member_id` khac | Tra ve `403 Access denied` | High |
| TC-SUB-07 | Subscriptions | Cap nhat goi tap va tinh lai han | PUT doi plan/start_date | End date moi duoc tinh lai dung theo luat | High |
| TC-SUB-08 | Subscriptions | Xoa goi tap ton tai | DELETE `/api/subscriptions/:id` | Goi tap bi xoa khoi DB | Medium |
| TC-EVAL-01 | Evaluations | Admin xem tat ca danh gia | GET `/api/evaluations` | Tra ve danh sach danh gia | High |
| TC-EVAL-02 | Evaluations | Trainer xem danh gia do minh tao | JWT trainer | Chi hien danh gia cua trainer do | High |
| TC-EVAL-03 | Evaluations | Member xem danh gia cua minh | JWT member | Chi hien danh gia cua member do | High |
| TC-EVAL-04 | Evaluations | Trainer tao danh gia cho client cua minh | `member_id` thuoc `trainer_id` | Tra ve `201 Evaluation created` | High |
| TC-EVAL-05 | Evaluations | Trainer tao danh gia cho client khong thuoc minh | Member cua trainer khac | Tra ve `400 Trainer can only evaluate their own clients` | High |
| TC-EVAL-06 | Evaluations | Cap nhat danh gia hop le | PUT du lieu BMI/can nang moi | Tra ve `200 Evaluation updated` | Medium |
| TC-EVAL-07 | Evaluations | Member xoa danh gia | JWT member DELETE | Tra ve `403 Access denied` | Medium |
| TC-EVAL-08 | Evaluations | Admin xoa danh gia | DELETE `/api/evaluations/:id` | Tra ve `200 Evaluation deleted` | Medium |
| TC-EVENT-01 | Events | Khach xem danh sach su kien | GET `/api/events` khong can token | Tra ve danh sach su kien cong khai | High |
| TC-EVENT-02 | Events | Khach xem chi tiet su kien | GET `/api/events/:id` | Tra ve chi tiet su kien | Medium |
| TC-EVENT-03 | Events | Admin tao su kien | POST voi title, description, event_date | Tra ve `201 Event created` | High |
| TC-EVENT-04 | Events | Trainer tao su kien | JWT trainer POST `/api/events` | Tra ve `403 Access denied` | Medium |
| TC-EVENT-05 | Events | Admin cap nhat su kien | PUT `/api/events/:id` | Tra ve `200 Event updated` | Medium |
| TC-EVENT-06 | Events | Admin xoa su kien | DELETE `/api/events/:id` | Tra ve `200 Event deleted` | Medium |
