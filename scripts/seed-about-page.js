require('dotenv').config({ path: './.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is not set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const aboutPageContent = {
  "hero.title": "من نحن",
  "hero.subtitle": "رحلتنا في عالم الموضة المحتشمة",
  "story.title": "قصتنا",
  "story.paragraph1": "بدأت رحلة مكة من حلم بسيط: توفير أزياء نسائية راقية تجمع بين الأناقة العصرية والاحتشام الأصيل. نؤمن بأن كل امرأة تستحق أن تشعر بالثقة والجمال في ملابسها، دون التنازل عن قيمها ومبادئها.",
  "story.paragraph2": "منذ انطلاقتنا، كرسنا جهودنا لتقديم تصاميم فريدة تعكس الذوق الرفيع والجودة العالية. نختار أقمشتنا بعناية فائقة، ونهتم بأدق التفاصيل في كل قطعة نقدمها لكِ.",
  "story.image_url": "https://i.postimg.cc/W3sT29vC/story-image.jpg",
  "values.title": "قيمنا",
  "values.passion.title": "الشغف",
  "values.passion.description": "نحب ما نقوم به ونسعى دائماً لتقديم الأفضل لعميلاتنا",
  "values.quality.title": "الجودة",
  "values.quality.description": "نختار أفضل الأقمشة ونهتم بأدق التفاصيل في كل منتج",
  "values.customers.title": "العملاء",
  "values.customers.description": "رضاكِ وسعادتكِ هما أولويتنا القصوى في كل ما نقدمه",
  "values.innovation.title": "الابتكار",
  "values.innovation.description": "نواكب أحدث صيحات الموضة مع الحفاظ على الأصالة",
  "team.title": "فريقنا وشغفنا",
  "team.paragraph1": "وراء كل قطعة فنية من مكة، يقف فريق من المصممين والحرفيين المهرة الذين يجمعهم شغف واحد: إبداع أزياء تعبر عنكِ. نحن عائلة تؤمن بقوة التفاصيل وتكرس وقتها لتحويل أجود الأقمشة إلى تصاميم تحاكي أحلامك.",
  "team.paragraph2": "كل خيط، كل قصة، وكل تطريزة هي جزء من حكايتنا معكِ.",
  "team.image_url": "https://i.postimg.cc/mD4x1gbP/team-image.jpg",
  "team.image_title": "مؤسسي مكة",
  "team.image_subtitle": "شغف يتوارثه الأجيال",
  "cta.title": "ابدئي رحلتكِ معنا",
  "cta.subtitle": "اكتشفي مجموعتنا الحصرية من الأزياء الراقية",
  "cta.button": "تسوقي الآن"
};

async function seedData() {
  console.log("Attempting to seed '/about/' page content...");
  
  const { data: page, error: findError } = await supabase
    .from('pages')
    .select('id, sections')
    .eq('path', '/about/')
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116: row not found, which is fine
    console.error('Error finding page:', findError.message);
    return;
  }
  
  // If page doesn't exist, create it with the seed content
  if (!page) {
      console.log("Page with path '/about/' not found. Creating it...");
      const { error: createError } = await supabase
        .from('pages')
        .insert([{ 
            path: '/about/', 
            title_ar: 'من نحن', 
            title_en: 'About Us', 
            sections: aboutPageContent 
        }]);
      
      if (createError) {
          console.error('Error creating page:', createError.message);
      } else {
          console.log("Successfully created and seeded '/about/' page.");
      }
      return;
  }
  
  // If page exists, merge the seed content with existing content
  // The seed content will NOT overwrite existing keys
  const existingSections = page.sections || {};
  const newSections = { ...aboutPageContent, ...existingSections };

  const { error: updateError } = await supabase
    .from('pages')
    .update({ sections: newSections })
    .eq('path', '/about/');

  if (updateError) {
    console.error('Error updating page content:', updateError.message);
  } else {
    console.log("'/about/' page content has been successfully seeded/merged into the database.");
  }
}

seedData();
