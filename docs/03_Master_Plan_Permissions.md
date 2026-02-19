# 03_Master_Plan_Permissions

## Milestone 1: Backend API for Permission Requests
**Objective:** إنشاء مسار الـ Backend (Controller) المسؤول عن استقبال ومعالجة طلبات الاستئذان الجديدة.

### Task 1.1: Create PermissionsController (Execution & TDD)
* [ ] **Entry Criteria:** وجود ملف `01_PRD_Permissions.md` وملف `02_Database_Schema.md` في مجلد `docs`.
* [ ] **Agent Prompt (الصيغة التي ستُعطى لـ Antigravity):**
  > "أنت الآن مهندس برمجيات (Backend Developer). المهمة: إنشاء ملف `PermissionsController.php` في مسار `backend/controllers/`.
  > 1. اقرأ `01_PRD_Permissions.md` لفهم المنطق البرمجي.
  > 2. اقرأ `02_Database_Schema.md` (قسم permission_requests و system_settings).
  > 3. اقرأ `BaseController.php` لتفهم كيف نستخدم دالة `$this->store()`.
  > 4. قم ببرمجة دالة `createRequest($data)` كما هو مطلوب في الـ PRD، مع تطبيق أفضل ممارسات الأمان.
  > 5. قم بكتابة اختبار (Unit Test) مبسط أو استخدم cURL/Terminal لإنشاء طلب وهمي (Mock Request) والتأكد من أن كودك يمنع الطلبات التي تتجاوز الحد الشهري ويرجع 422.
  > 6. المراجعة الذاتية: تقمص دور مدقق أمني، راجع كودك للتأكد من عدم وجود استعلامات بطيئة (N+1) في حلقة، وأنك استخدمت (Indexes) لتواريخ الشهر."
* [ ] **Exit Criteria:** ملف `PermissionsController.php` يعمل بشكل سليم، يقوم بالمنع عند تجاوز الرصيد، ويحفظ البيانات عبر `BaseController` ليتم تسجيل Audit Log.

### Task 1.2: Commit changes
* [ ] **Agent Prompt:**
  > "قم بعمل `git commit` نظيف يحمل الرسالة التالية: `feat(permissions): add createRequest with limit validation`. ولا تدمجه في الـ Main إلا بعد موافقة مدير المشروع."

## Milestone 2: Frontend UI & API Integration

### Task 2.1: Build Permissions Form Component
* [ ] **Agent Prompt:** إنشاء صفحة/مكون لنموذج الاستئذان باستخدام React و Tailwind، وربطه بالخادم. معالجة حالات الخطأ (خاصة 422 Limit Exceeded) وعرضها للمستخدم بطريقة احترافية.

### Task 2.2: Routing & Sidebar Navigation
* [ ] **Objective:** جعل مكون `PermissionsForm.jsx` متاحاً عبر مسار (Route) مخصص، وإضافة رابط له في القائمة الجانبية (Sidebar) ليتمكن الموظف من الوصول إليه.
* [ ] **Agent Prompt:** توجيه الوكيل لتعديل ملفات الـ Routing (غالباً `App.jsx` أو `main.jsx`) وملف القائمة الجانبية (مثل `Layout.jsx` أو `Sidebar.jsx`) لإضافة مسار `/permissions`.