# مهدیارشو | MahdiarShow

**وب‌سایت عمومی، استاتیک، فارسی و راست‌چین برای مرور احکام اجتماعی، اندیشه‌های اعتقادی، ارتباط مؤثر و رشد فردی.**

- **نسخهٔ آنلاین:** https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/
- **مخزن گیت‌هاب:** https://github.com/mohammadbarzegar9831-cmd/mahdiyarsho

## معرفی

مهدیارشو یک پروژهٔ محتوایی چندصفحه‌ای است. محتوای فعلی در چهار بخش سازمان‌دهی شده است:

- **احکام اجتماعی:** فهرست هشت موضوع، از جمله امر به معروف و نهی از منکر، همسایه‌داری، گناهان زبانی، فضای مجازی، کپی‌رایت، آرایش و زینت، ارتباط با نامحرم و مجالس شادی. در نسخهٔ فعلی، موضوع اول صفحهٔ اختصاصی دارد.
- **اعتقادی:** سه فصل علم و حکمت الهی، مهربانی و رأفت خدا، و خواست و قدرت الهی؛ همراه با زیرموضوع «هدف خلقت انسان» در فصل اول.
- **ارتباط مؤثر:** انواع ارتباط برقرار کردن، شامل حرف زدن، زبان بدن و فرا بدن؛ صفحهٔ فن بیان به‌عنوان زیرموضوع حرف زدن.
- **رشد فردی:** یک فصل فعلی با عنوان «قدرت تمرکز».

## امکانات

- تم تیره با رنگ‌های طلایی و فیروزه‌ای
- طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ، همراه با منوی موبایل و نشانگر صفحهٔ فعال
- جست‌وجوی درون‌سایتی با نرمال‌سازی حروف فارسی، تطبیق عبارت‌های چندواژه‌ای و میان‌بر `Ctrl+K` یا `⌘K`
- انیمیشن‌های ورود با نمایش درست محتوا در صورت غیرفعال بودن JavaScript و رعایت تنظیم کاهش حرکت سیستم
- بهبود دسترس‌پذیری صفحه‌کلید، فوکوس قابل‌مشاهده و پیوند پرش به محتوای اصلی
- کارت نقل‌قول چرخشی در صفحهٔ خانه و بخش رشد فردی
- فونت وزیرمتن با فونت‌های جایگزین در صورت قطع اتصال اینترنت
- وب‌سایت کاملاً استاتیک، بدون فریم‌ورک یا مرحلهٔ build
- بهینه‌سازی لوگو و آیکون اختصاصی مرورگر؛ نسخهٔ حجیم SVG در پروژه نگهداری نمی‌شود.
- متادیتای canonical، Open Graph و Twitter Card برای صفحات اصلی، تصویر پیش‌نمایش شبکه‌های اجتماعی، رنگ نوار مرورگر و صفحهٔ خطای 404.
- صفحهٔ یادداشت‌های جلسه‌ها (`jalase.html`) در رابط سایت فقط از طریق جست‌وجو پیوند دارد و در منوی اصلی و صفحات محتوایی لینک مستقیمی ندارد. این صفحه `noindex` است. بااین‌حال وب‌سایت و مخزن عمومی‌اند؛ `noindex` و پنهان‌کردن پیوند، دسترسی مستقیم به نشانی فایل یا مشاهدهٔ سورس مخزن را مسدود نمی‌کند.

## اجرای محلی

```bash
git clone https://github.com/mohammadbarzegar9831-cmd/mahdiyarsho.git
cd mahdiyarsho
```

سپس `index.html` را در مرورگر باز کنید. برای مشاهدهٔ فونت وزیرمتن اتصال اینترنت لازم است؛ در غیر این صورت، فونت‌های جایگزین استفاده می‌شوند.

## صفحه‌ها

| فایل | توضیح |
| --- | --- |
| `index.html` | صفحهٔ خانه و معرفی چهار بخش |
| `ahkam.html` | فهرست هشت موضوع احکام اجتماعی |
| `amr-marouf.html` | امر به معروف و نهی از منکر |
| `aqeedeh.html` | فهرست سه فصل بخش اعتقادی |
| `hadaf.html` | هدف خلقت انسان؛ زیرموضوع فصل اول اعتقادی |
| `ertebat.html` | انواع ارتباط برقرار کردن |
| `fan-bayan.html` | فن بیان و تمرین خوب دیدن |
| `roshd.html` | بخش رشد فردی با یک فصل فعلی |
| `tamarkoz.html` | فصل قدرت تمرکز |
| `jalase.html` | یادداشت‌های پنج جلسه؛ در رابط سایت فقط از طریق جست‌وجو قابل یافتن است و برای موتورهای جست‌وجو `noindex` شده است. این صفحه خصوصی یا محافظت‌شده نیست. |
| `404.html` | صفحهٔ راهنمای آدرس‌های ناموجود |

## ساختار پروژه

```text
mahdiyarsho/
├── index.html
├── ahkam.html
├── amr-marouf.html
├── aqeedeh.html
├── hadaf.html
├── ertebat.html
├── fan-bayan.html
├── roshd.html
├── tamarkoz.html
├── jalase.html       # در رابط سایت فقط از طریق جست‌وجو
├── 404.html
├── README.md
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── images/
        ├── logo.webp
        ├── og-cover.jpg
        ├── favicon.ico
        ├── favicon-32.png
        ├── favicon-16.png
        └── apple-touch-icon.png
```

## متادیتا و پیش‌نمایش اشتراک‌گذاری

صفحه‌های عمومی دارای `canonical` مطلق، `theme-color`، متادیتای Open Graph و Twitter Card هستند. آدرس پایهٔ فعلی این است:

`https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/`

نمونهٔ تنظیمات صفحهٔ خانه در `<head>`:

```html
<meta name="theme-color" content="#080d18">
<meta name="author" content="مهدیارشو">
<link rel="icon" href="assets/images/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
<link rel="canonical" href="https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/">
<meta property="og:locale" content="fa_IR">
<meta property="og:site_name" content="مهدیارشو">
<meta property="og:type" content="website">
<meta property="og:title" content="مهدیارشو | خانه">
<meta property="og:description" content="مهدیارشو؛ مجموعه‌ای فارسی و راست‌چین برای مرور احکام اجتماعی، اندیشه‌های اعتقادی، ارتباط مؤثر و رشد فردی.">
<meta property="og:url" content="https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/">
<meta property="og:image" content="https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/assets/images/og-cover.jpg">
<meta property="og:image:secure_url" content="https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/assets/images/og-cover.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="پیش‌نمایش مهدیارشو با لوگو و چهار بخش سایت">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="مهدیارشو | خانه">
<meta name="twitter:description" content="مهدیارشو؛ مجموعه‌ای فارسی و راست‌چین برای مرور احکام اجتماعی، اندیشه‌های اعتقادی، ارتباط مؤثر و رشد فردی.">
<meta name="twitter:image" content="https://mohammadbarzegar9831-cmd.github.io/mahdiyarsho/assets/images/og-cover.jpg">
```

برای هر صفحه، `canonical` و `og:url` باید آدرس همان صفحه باشند و `og:title` و توضیحات نیز باید با محتوای همان صفحه هماهنگ شوند؛ این موارد از قبل در فایل‌های HTML تنظیم شده‌اند. اگر نام کاربری یا مخزن GitHub تغییر کرد، تمام URLهای مطلق متادیتا را هم به‌روزرسانی کن. فایل `jalase.html` عمداً `noindex, nofollow` باقی مانده و متادیتای اشتراک‌گذاری عمومی ندارد.

## فناوری‌ها

- HTML5 معنایی
- CSS سفارشی با متغیرها، Grid، Flexbox و media query
- JavaScript خالص برای جست‌وجو، منوی موبایل و انیمیشن‌های ورود
- WebP بهینه‌شده برای نمایش لوگو در صفحات سایت

## کارهای آینده

- تکمیل محتوای صفحه‌های موضوعات دیگر احکام
- تکمیل محتوای فصل‌های دوم و سوم اعتقادی
- توسعهٔ محتوا در بخش ارتباط مؤثر
- افزودن فصل یا موضوع تازه به رشد فردی، فقط در صورت آماده‌شدن محتوا

---

© ۱۴۰۵ مهدیارشو — تمامی حقوق محفوظ است.
