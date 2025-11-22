-- إضافة صفحة "من نحن" في جدول page_content

-- حذف الصفحة إذا كانت موجودة من قبل
DELETE FROM page_content WHERE page_path = '/about';

-- إضافة صفحة من نحن بالمحتوى الافتراضي
INSERT INTO page_content (
  page_path,
  page_title_ar,
  page_title_en,
  meta_title_ar,
  meta_title_en,
  meta_description_ar,
  meta_description_en,
  sections,
  is_published
) VALUES (
  '/about',
  'من نحن',
  'About Us',
  'من نحن - مكة للأزياء النسائية',
  'About Us - Mecca Fashion',
  'تعرفي على قصة مكة للأزياء النسائية الراقية وقيمنا ورؤيتنا',
  'Learn about Mecca Fashion story, values and vision',
  '{
    "hero.title": "من نحن",
    "hero.subtitle": "رحلتنا في عالم الموضة المحتشمة",
    "story.title": "قصتنا",
    "story.paragraph1": "بدأت رحلة مكة من حلم بسيط: توفير أزياء نسائية راقية تجمع بين الأناقة العصرية والاحتشام الأصيل. نؤمن بأن كل امرأة تستحق أن تشعر بالثقة والجمال في ملابسها، دون التنازل عن قيمها ومبادئها.",
    "story.paragraph2": "منذ انطلاقتنا، كرسنا جهودنا لتقديم تصاميم فريدة تعكس الذوق الرفيع والجودة العالية. نختار أقمشتنا بعناية فائقة، ونهتم بأدق التفاصيل في كل قطعة نقدمها لكِ.",
    "story.paragraph3": "اليوم، نفخر بخدمة آلاف العميلات اللواتي وثقن بنا لنكون جزءاً من إطلالاتهن المميزة. رضاكِ هو هدفنا، وأناقتكِ هي نجاحنا.",
    "values.title": "قيمنا",
    "values.passion.title": "الشغف",
    "values.passion.description": "نحب ما نقوم به ونسعى دائماً لتقديم الأفضل لعميلاتنا",
    "values.quality.title": "الجودة",
    "values.quality.description": "نختار أفضل الأقمشة ونهتم بأدق التفاصيل في كل منتج",
    "values.customers.title": "العملاء",
    "values.customers.description": "رضاكِ وسعادتكِ هما أولويتنا القصوى في كل ما نقدمه",
    "values.innovation.title": "الابتكار",
    "values.innovation.description": "نواكب أحدث صيحات الموضة مع الحفاظ على الأصالة",
    "cta.title": "ابدئي رحلتكِ معنا",
    "cta.subtitle": "اكتشفي مجموعتنا الحصرية من الأزياء الراقية",
    "cta.button": "تسوقي الآن"
  }'::jsonb,
  true
);
