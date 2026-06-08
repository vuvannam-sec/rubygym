# RubyGYM API Documentation

## Base URL

- Local backend: `http://localhost:3000/api`
- Auth header format: `Authorization: Bearer <jwt-token>`

## Auth Rules Summary

| Role | Main Access |
| --- | --- |
| Public | `POST /auth/register`, `POST /auth/login`, `GET /events`, `GET /events/:id` |
| ADMIN | Full access to all modules |
| TRAINER | Own clients, own schedule, own evaluations, subscriptions of own clients |
| MEMBER | Own profile, own schedule, own evaluations, own subscriptions |

## Response Convention

- Success: JSON data or `{ message: "..." }`
- Error: `{ error: "..." }`

## Authentication

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | `email`, `password`, `full_name`, `phone`, `current_weight`, `height_cm`, `trainer_id?`, `referral_code?` | `201 { message, userId, memberId, current_weight, height_cm, current_bmi, onboarding_completed }` | `{"email":"new@rubygym.com","password":"123456","full_name":"Nguyen Van A","phone":"0901","current_weight":68.5,"height_cm":172,"trainer_id":1}` |
| POST | `/auth/login` | No | `email`, `password` | `200 { token, user }` | `{"email":"admin@rubygym.com","password":"admin123"}` |

## Trainers

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/trainers` | JWT | None | Array trainer objects | `GET /api/trainers` |
| GET | `/trainers/:id/clients` | JWT, admin or trainer owner | None | Array member objects of the trainer including current weight, height, and training goal | `GET /api/trainers/1/clients` |
| GET | `/trainers/:id` | JWT | None | Trainer detail object | `GET /api/trainers/1` |
| POST | `/trainers` | JWT admin | `email`, `password`, `full_name`, `phone`, `specialization`, `max_daily_hours?` | `201 { message, trainerId }` | `{"email":"trainer.new@rubygym.com","password":"trainer123","full_name":"Tran Linh","phone":"0902","specialization":"Yoga"}` |
| PUT | `/trainers/:id` | JWT admin or owner trainer | Optional `full_name`, `email`, `phone`, `specialization`, `max_daily_hours` | `200 { message }` | `{"full_name":"Tran Linh Updated","specialization":"Yoga Therapy"}` |
| DELETE | `/trainers/:id` | JWT admin | None | `200 { message }` | `DELETE /api/trainers/3` |

## Members

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/members` | JWT admin | None | Array member objects with trainer name | `GET /api/members` |
| GET | `/members/me/onboarding` | JWT member | None | Current onboarding state, missing steps (`PROFILE_METRICS`, `SUBSCRIPTION`), trainer list, subscription | `GET /api/members/me/onboarding` |
| PUT | `/members/me/onboarding` | JWT member | `current_weight`, `height_cm`, `plan_type`, `start_date`, optional `trainer_id` | `200 { message, completed, member, subscription }` | `{"current_weight":70.4,"height_cm":171,"trainer_id":2,"plan_type":"QUARTERLY","start_date":"2026-06-08"}` |
| GET | `/members/:id` | JWT admin, owner member, or assigned trainer | None | Member detail object | `GET /api/members/5` |
| POST | `/members` | JWT admin | `email`, `password`, `full_name`, `phone`, `trainer_id`, `join_date`, `current_weight?`, `height_cm?`, `is_loyal?`, `referred_by?` | `201 { message, memberId }` | `{"email":"member@rubygym.com","password":"member123","full_name":"Pham B","phone":"0903","trainer_id":1,"join_date":"2026-04-01","current_weight":62.5,"height_cm":165}` |
| PUT | `/members/:id` | JWT admin, owner member, or assigned trainer | Optional profile fields; admin may update `trainer_id`, `join_date`, `current_weight`, `height_cm`, `is_loyal`, `referred_by` | `200 { message }` | `{"phone":"0909888888","current_weight":61.8,"height_cm":165}` |
| DELETE | `/members/:id` | JWT admin | None | `200 { message }` | `DELETE /api/members/8` |

## Schedule

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/schedule/trainer/:trainerId` | JWT admin or owner trainer | None | Array sessions with member names | `GET /api/schedule/trainer/1` |
| GET | `/schedule/member/:memberId` | JWT admin, assigned trainer, or owner member | None | Array sessions with trainer name | `GET /api/schedule/member/4` |
| GET | `/schedule/:id` | JWT with access to the session | None | Session detail object | `GET /api/schedule/12` |
| POST | `/schedule` | JWT admin or trainer | `trainer_id`, `session_date`, `start_time`, `end_time`, `member_ids[]` | `201 { message, sessionId }` | `{"trainer_id":1,"session_date":"2026-04-14","start_time":"05:30:00","end_time":"06:30:00","member_ids":[1,2]}` |
| PUT | `/schedule/:id` | JWT admin or owner trainer | Optional same fields as create | `200 { message }` | `{"start_time":"14:00:00","end_time":"15:00:00","member_ids":[1,3]}` |
| DELETE | `/schedule/:id` | JWT admin or owner trainer | None | `200 { message }` | `DELETE /api/schedule/12` |

### Schedule Validation Rules

- Session must stay inside `05:00-11:30` or `13:30-20:00`
- Session duration must not exceed 2 hours
- A trainer cannot exceed 8 total training hours per day
- A session must include at least 1 member
- A session cannot contain more than 3 members
- A member must belong to the chosen trainer
- A member cannot exceed 3 sessions in one day

## Subscriptions

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/subscriptions` | JWT | None | Array subscriptions filtered by role | `GET /api/subscriptions` |
| GET | `/subscriptions/:id` | JWT with access to the subscription | None | Subscription detail object | `GET /api/subscriptions/2` |
| POST | `/subscriptions` | JWT admin or owner member | `member_id`, `plan_type`, `start_date` | `201 { message, subscriptionId, is_loyal, free_extension_months, end_date }` | `{"member_id":5,"plan_type":"ANNUAL","start_date":"2026-04-01"}` |
| PUT | `/subscriptions/:id` | JWT with access | Optional `member_id`, `plan_type`, `start_date`, `status` | `200 { message, is_loyal, free_extension_months, end_date }` | `{"plan_type":"SEMI_ANNUAL","start_date":"2026-04-01"}` |
| DELETE | `/subscriptions/:id` | JWT with access | None | `200 { message }` | `DELETE /api/subscriptions/5` |

### Subscription Business Logic

- `QUARTERLY` = 3 months
- `SEMI_ANNUAL` = 6 months
- `ANNUAL` = 12 months
- Loyal member: if joined at least 1 year earlier, auto-mark loyal and add 3 free months
- Referral bonus: add 1 free month for each member referred successfully

## Evaluations

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/evaluations` | JWT | None | Array evaluations filtered by role | `GET /api/evaluations` |
| GET | `/evaluations/:id` | JWT with access | None | Evaluation detail object | `GET /api/evaluations/1` |
| POST | `/evaluations` | JWT admin or trainer | `member_id`, `trainer_id?`, `month_year`, `target_weight`, `actual_weight`, `target_bmi`, `actual_bmi`, `notes` | `201 { message, evaluationId }` | `{"member_id":1,"trainer_id":1,"month_year":"2026-04-01","target_weight":68,"actual_weight":69,"target_bmi":22,"actual_bmi":22.5,"notes":"Tien bo tot"}` |
| PUT | `/evaluations/:id` | JWT admin or trainer owner | Optional same fields as create | `200 { message }` | `{"actual_weight":68.2,"actual_bmi":22.3,"notes":"Da on dinh hon"}` |
| DELETE | `/evaluations/:id` | JWT admin or trainer owner | None | `200 { message }` | `DELETE /api/evaluations/3` |

### Evaluation Rule

- Trainer can only create/update evaluations for members assigned to that trainer
- Member is read-only for evaluation endpoints

## Events

| Method | Path | Auth Required | Request Body | Response | Example |
| --- | --- | --- | --- | --- | --- |
| GET | `/events` | No | None | Array public events | `GET /api/events` |
| GET | `/events/:id` | No | None | Event detail object | `GET /api/events/1` |
| POST | `/events` | JWT admin | `title`, `description`, `event_date` | `201 { message, eventId }` | `{"title":"Yoga Morning","description":"Tap yoga ngoai troi","event_date":"2026-04-27 06:00:00"}` |
| PUT | `/events/:id` | JWT admin | Optional `title`, `description`, `event_date` | `200 { message }` | `{"title":"Yoga Morning Updated"}` |
| DELETE | `/events/:id` | JWT admin | None | `200 { message }` | `DELETE /api/events/2` |

## Example Success Responses

```json
{
  "message": "Session created",
  "sessionId": 88
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@rubygym.com",
    "role": "ADMIN"
  }
}
```

## Example Error Response

```json
{
  "error": "Access denied"
}
```
