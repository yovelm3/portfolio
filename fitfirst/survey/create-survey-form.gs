/**
 * FitFirst – יוצר את שאלון המתאמנות ב-Google Forms
 *
 * איך משתמשים:
 * 1. נכנסים ל-script.google.com ולוחצים "פרויקט חדש".
 * 2. מוחקים את מה שכתוב שם ומדביקים את כל הקובץ הזה.
 * 3. בוחרים למעלה את הפונקציה createSurvey ולוחצים "הפעלה".
 *    בפעם הראשונה גוגל תבקש הרשאה ליצור טופס וגיליון בחשבון שלך.
 * 4. ב"יומן ההפעלה" למטה יופיעו שני קישורים: קישור לשליחה למשיבות, וקישור לעריכה.
 *
 * אחרי שיש תשובות: בוחרים את הפונקציה summarize ולוחצים "הפעלה".
 * היא בודקת את שלושת הקריטריונים ומונה את המותגים.
 */

function createSurvey() {
  var form = FormApp.create('שאלון קצר למתאמנות – בגדי ספורט ומידות');
  form.setDescription(
    'היי! אני עובד על כלי שיעזור למתאמנות להזמין בגדי ספורט במידה הנכונה כבר בפעם הראשונה, ובמחיר טוב. ' +
    'השאלון לוקח בערך חמש דקות, והתשובות שלך יעזרו לי להבין מה באמת חסר.\n\n' +
    'אין תשובות נכונות או לא נכונות, והשאלון אנונימי. רק בסוף אפשר להשאיר מייל, אם תרצי שאעדכן כשזה עולה. ' +
    'השאלון מיועד לבנות 18 ומעלה.\n\nתודה שאת עוזרת!'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);

  // ---------- חלק א ----------
  form.addPageBreakItem().setTitle('חלק א: עלייך ועל הקניות');

  choice(form, 'איזה אימון את עושה הכי הרבה?',
    ['פילאטיס', 'חדר כושר', 'יוגה', 'ריצה'], true);
  choice(form, 'כמה פעמים בשבוע את מתאמנת?',
    ['פחות מפעם בשבוע', 'פעם בשבוע', 'פעמיים עד שלוש', 'ארבע פעמים ויותר']);
  choice(form, 'מאיפה את קונה בגדי ספורט בדרך כלל?',
    ['באתרים של המותגים עצמם', 'באתרים שמוכרים כמה מותגים', 'בחנויות', 'באפליקציות כמו שיין או עליאקספרס'], true);
  choice(form, 'כמה פעמים קנית בגדי ספורט באינטרנט בחצי השנה האחרונה?',
    ['אף פעם', 'פעם אחת', 'שתיים עד שלוש', 'ארבע ויותר']);
  checkbox(form, 'מאילו מותגים קנית בשנה האחרונה? (אפשר לסמן כמה)',
    ['נייקי', 'אדידס', 'לולולמון', "ג'ימשארק", 'אלו יוגה', 'אנדר ארמור', 'פומה', 'דקטלון', 'זארה או H&M'], true);
  choice(form, 'המידה שלך זהה בכל המותגים?',
    ['כן, תמיד אותה מידה', 'ברוב המותגים', 'משתנה הרבה ממותג למותג', 'לא שמתי לב']);
  choice(form, 'איך את מחליטה איזו מידה להזמין?',
    ['מזמינה את המידה הרגילה שלי', 'בודקת את טבלת המידות באתר', 'קוראת מה כתבו בביקורות', 'מזמינה שתי מידות ומחזירה אחת'], true);
  form.addTextItem()
    .setTitle('באיזו מידה את קונה במותגים שאת הכי קונה?')
    .setHelpText('למשל: בנייקי S, בלולולמון 6. לא חובה.')
    .setRequired(false);

  // ---------- חלק ב ----------
  form.addPageBreakItem().setTitle('חלק ב: החזרות');

  choice(form, 'בשנה האחרונה, כמה פעמים החזרת בגד ספורט שהזמנת באינטרנט כי המידה לא התאימה?',
    ['אף פעם', 'פעם אחת', 'שתיים עד שלוש', 'ארבע ויותר']);
  choice(form, 'היה בגד שלא התאים לך ובכל זאת לא החזרת, כי היה מסובך או יקר?',
    ['כן, כמה פעמים', 'כן, פעם אחת', 'לא']);
  choice(form, 'ויתרת פעם על קנייה כי לא היית בטוחה במידה?',
    ['הרבה פעמים', 'לפעמים', 'אף פעם']);
  form.addScaleItem()
    .setTitle('כמה זה מציק לך כשבגד מגיע והמידה לא מתאימה?')
    .setBounds(1, 5)
    .setLabels('לא מפריע בכלל', 'מטריף אותי')
    .setRequired(true);
  checkbox(form, 'מה הכי מעצבן בהחזרה? (אפשר לסמן כמה)',
    ['לשלם על משלוח חזרה', 'לנסוע לדואר או לנקודת איסוף', 'לחכות לזיכוי', 'האכזבה שהבגד לא מתאים', 'לא מעצבן אותי'], false);

  // ---------- חלק ג ----------
  form.addPageBreakItem().setTitle('חלק ג: מחיר והרעיון');

  choice(form, 'את משווה מחירים בין אתרים לפני שאת קונה?',
    ['תמיד', 'לפעמים', 'כמעט אף פעם']);
  choice(form, 'יצא לך להרכיב לוק אימון מפריטים של כמה מותגים?',
    ['כן, הרבה', 'לפעמים', 'לא, בדרך כלל מותג אחד']);

  form.addSectionHeaderItem()
    .setTitle('קצת על הרעיון')
    .setHelpText(
      'את מכניסה את המידות שלך (או רק גובה, מידה רגילה ומבנה גוף), ומקבלת בובה עם הפרופורציות שלך. ' +
      'מלבישים עליה לוק מכמה מותגים, והאתר אומר לך איזו מידה להזמין בכל מותג ואיפה הלוק כולו הכי משתלם. ' +
      'המידות שלך נשארות בטלפון שלך בלבד.'
    );

  form.addScaleItem()
    .setTitle('כמה זה מעניין אותך?')
    .setBounds(1, 5)
    .setLabels('בכלל לא', 'מאוד')
    .setRequired(true);
  choice(form, 'מה היה הכי חשוב לך בכלי כזה?',
    ['לדעת איזו מידה להזמין', 'למצוא את המחיר הכי טוב', 'לראות איך הלוק נראה עליי', 'לחסוך זמן בחיפושים']);
  choice(form, 'איך היית מעדיפה להתחיל?',
    ['מהר: גובה, מידה רגילה ומבנה גוף', 'מדויק: שש מידות עם סרט מידה', 'הייתי מעדיפה לצלם ושהטלפון ימדוד', 'לא הייתי ממלאת פרטים בכלל']);
  choice(form, 'אם האתר היה אומר לך להזמין מידה אחרת מהרגילה, היית סומכת עליו?',
    ['כן', 'רק אחרי שהיה צודק פעם אחת', 'לא, הייתי מזמינה את הרגילה']);
  choice(form, 'אם זה היה עובד עם המותגים שאת קונה, היית קונה דרכו?',
    ['בטוח', 'כנראה', 'לא בטוחה', 'לא']);

  var email = form.addTextItem()
    .setTitle('רוצה שאעדכן אותך כשזה עולה? אפשר להשאיר מייל כאן.')
    .setHelpText('נשתמש בו רק כדי לעדכן על ההשקה. לא חובה.')
    .setRequired(false);
  email.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());

  form.setConfirmationMessage('תודה רבה! זה עוזר לי מאוד.');

  // גיליון שאליו נכנסות כל התשובות
  var sheet = SpreadsheetApp.create('תשובות – שאלון מתאמנות FitFirst');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());

  Logger.log('קישור לשליחה למשיבות: ' + form.getPublishedUrl());
  Logger.log('קישור לעריכת הטופס: ' + form.getEditUrl());
  Logger.log('גיליון התשובות: ' + sheet.getUrl());
}

/** שאלה עם תשובה אחת. withOther מוסיף "אחר" עם שדה טקסט. */
function choice(form, title, options, withOther) {
  var item = form.addMultipleChoiceItem().setTitle(title).setChoiceValues(options).setRequired(true);
  if (withOther) item.showOtherOption(true);
  return item;
}

/** שאלה שאפשר לסמן בה כמה תשובות. */
function checkbox(form, title, options, withOther) {
  var item = form.addCheckboxItem().setTitle(title).setChoiceValues(options).setRequired(true);
  if (withOther) item.showOtherOption(true);
  return item;
}

/**
 * סיכום התשובות מול הקריטריונים:
 * 1. לפחות 60% החזירו בגלל מידה או ויתרו על קנייה כי לא היו בטוחות במידה
 * 2. לפחות 50% נתנו לבעיה ציון 4 או 5
 * 3. לפחות 40% השאירו מייל
 */
function summarize() {
  var id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!id) { Logger.log('לא מצאתי את הטופס. קודם צריך להפעיל את createSurvey מאותו פרויקט.'); return; }
  var responses = FormApp.openById(id).getResponses();
  var n = responses.length;
  if (n === 0) { Logger.log('עדיין אין תשובות.'); return; }

  var pain = 0, highScore = 0, emails = 0, brands = {}, wouldBuy = 0;
  responses.forEach(function (r) {
    var a = {};
    r.getItemResponses().forEach(function (ir) { a[ir.getItem().getTitle()] = ir.getResponse(); });

    var returned = a['בשנה האחרונה, כמה פעמים החזרת בגד ספורט שהזמנת באינטרנט כי המידה לא התאימה?'];
    var gaveUp = a['ויתרת פעם על קנייה כי לא היית בטוחה במידה?'];
    if ((returned && returned !== 'אף פעם') || (gaveUp && gaveUp !== 'אף פעם')) pain++;

    var score = Number(a['כמה זה מציק לך כשבגד מגיע והמידה לא מתאימה?']);
    if (score >= 4) highScore++;

    if (a['רוצה שאעדכן אותך כשזה עולה? אפשר להשאיר מייל כאן.']) emails++;

    var buy = a['אם זה היה עובד עם המותגים שאת קונה, היית קונה דרכו?'];
    if (buy === 'בטוח' || buy === 'כנראה') wouldBuy++;

    (a['מאילו מותגים קנית בשנה האחרונה? (אפשר לסמן כמה)'] || []).forEach(function (b) {
      brands[b] = (brands[b] || 0) + 1;
    });
  });

  function pct(x) { return Math.round(x / n * 100); }
  function mark(ok) { return ok ? 'עומד ✓' : 'לא עומד ✗'; }

  Logger.log('מספר משיבות: ' + n);
  Logger.log('החזירו או ויתרו בגלל מידה: ' + pct(pain) + '% (יעד 60%) – ' + mark(pain / n >= 0.6));
  Logger.log('ציון 4 או 5 לבעיה: ' + pct(highScore) + '% (יעד 50%) – ' + mark(highScore / n >= 0.5));
  Logger.log('השאירו מייל: ' + pct(emails) + '% (יעד 40%) – ' + mark(emails / n >= 0.4));
  Logger.log('היו קונות דרכו (בטוח או כנראה): ' + pct(wouldBuy) + '%');

  var sorted = Object.keys(brands).sort(function (x, y) { return brands[y] - brands[x]; });
  Logger.log('המותגים הכי נקנים:');
  sorted.forEach(function (b) { Logger.log('  ' + b + ': ' + brands[b] + ' (' + pct(brands[b]) + '%)'); });
}
