/**
 * Google Apps Script لربط منصة Min Jadeed بـ Google Sheets
 * 
 * هذا الملف يحتوي على كود Google Apps Script الذي يجب نسخه ولصقه في مشروع Apps Script
 * المرتبط بملف Google Sheets الذي يعمل كقاعدة بيانات للمنصة.
 * 
 * يوفر هذا الكود واجهة برمجية تطبيقات ويب (Web API) تتيح للموقع التفاعل مع البيانات
 * المخزنة في Google Sheets.
 */

// المتغيرات العامة
let SPREADSHEET_ID = ''; // سيتم تعبئته تلقائياً عند تشغيل الكود
const USERS_SHEET_NAME = 'Users';
const QUOTES_SHEET_NAME = 'Quotes';
const COMMENTS_SHEET_NAME = 'Comments';
const RATINGS_SHEET_NAME = 'Ratings';

/**
 * تهيئة المشروع عند فتحه
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Min Jadeed')
    .addItem('تهيئة جداول البيانات', 'initializeSheets')
    .addItem('إنشاء بيانات تجريبية', 'createSampleData')
    .addToUi();
}

/**
 * تهيئة جداول البيانات
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SPREADSHEET_ID = ss.getId();
  
  // إنشاء جدول المستخدمين إذا لم يكن موجوداً
  let usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(USERS_SHEET_NAME);
    usersSheet.appendRow([
      'id', 'email', 'password', 'username', 'fullName', 'bio', 'avatar', 
      'favoriteCategories', 'createdAt', 'updatedAt'
    ]);
  }
  
  // إنشاء جدول الاقتباسات إذا لم يكن موجوداً
  let quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  if (!quotesSheet) {
    quotesSheet = ss.insertSheet(QUOTES_SHEET_NAME);
    quotesSheet.appendRow([
      'id', 'title', 'text', 'category', 'authorEmail', 'authorName', 
      'authorAvatar', 'createdAt', 'updatedAt'
    ]);
  }
  
  // إنشاء جدول التعليقات إذا لم يكن موجوداً
  let commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  if (!commentsSheet) {
    commentsSheet = ss.insertSheet(COMMENTS_SHEET_NAME);
    commentsSheet.appendRow([
      'id', 'quoteId', 'userEmail', 'userName', 'userAvatar', 'text', 'createdAt'
    ]);
  }
  
  // إنشاء جدول التقييمات إذا لم يكن موجوداً
  let ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  if (!ratingsSheet) {
    ratingsSheet = ss.insertSheet(RATINGS_SHEET_NAME);
    ratingsSheet.appendRow([
      'id', 'quoteId', 'userEmail', 'rating', 'createdAt', 'updatedAt'
    ]);
  }
  
  // تنسيق الجداول
  formatSheets([usersSheet, quotesSheet, commentsSheet, ratingsSheet]);
  
  return 'تم تهيئة جداول البيانات بنجاح';
}

/**
 * تنسيق الجداول
 * @param {Array} sheets - قائمة الجداول المراد تنسيقها
 */
function formatSheets(sheets) {
  sheets.forEach(sheet => {
    // تجميد الصف الأول
    sheet.setFrozenRows(1);
    
    // تنسيق صف العنوان
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    
    // ضبط عرض الأعمدة
    sheet.autoResizeColumns(1, sheet.getLastColumn());
  });
}

/**
 * إنشاء بيانات تجريبية للاختبار
 */
function createSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // إضافة مستخدمين تجريبيين
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow([
      generateUUID(), 'user1@example.com', hashPassword('password123'), 'user1', 
      'المستخدم الأول', 'نبذة عن المستخدم الأول', '', 'حكمة,تحفيز', 
      new Date().toISOString(), new Date().toISOString()
    ]);
    
    usersSheet.appendRow([
      generateUUID(), 'user2@example.com', hashPassword('password123'), 'user2', 
      'المستخدم الثاني', 'نبذة عن المستخدم الثاني', '', 'علم,فلسفة', 
      new Date().toISOString(), new Date().toISOString()
    ]);
  }
  
  // إضافة اقتباسات تجريبية
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  if (quotesSheet.getLastRow() <= 1) {
    quotesSheet.appendRow([
      generateUUID(), 'اقتباس تحفيزي', 'النجاح ليس نهائياً، والفشل ليس قاتلاً: إنها الشجاعة للاستمرار هي ما يهم.', 
      'تحفيز', 'user1@example.com', 'المستخدم الأول', '', 
      new Date().toISOString(), new Date().toISOString()
    ]);
    
    quotesSheet.appendRow([
      generateUUID(), 'اقتباس علمي', 'الخيال أهم من المعرفة. المعرفة محدودة. الخيال يطوق العالم.', 
      'علم', 'user2@example.com', 'المستخدم الثاني', '', 
      new Date().toISOString(), new Date().toISOString()
    ]);
  }
  
  // إضافة تعليقات تجريبية
  const commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  if (commentsSheet.getLastRow() <= 1) {
    const quoteId = quotesSheet.getRange(2, 1).getValue();
    
    commentsSheet.appendRow([
      generateUUID(), quoteId, 'user2@example.com', 'المستخدم الثاني', 
      '', 'اقتباس رائع!', new Date().toISOString()
    ]);
  }
  
  // إضافة تقييمات تجريبية
  const ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  if (ratingsSheet.getLastRow() <= 1) {
    const quoteId1 = quotesSheet.getRange(2, 1).getValue();
    const quoteId2 = quotesSheet.getRange(3, 1).getValue();
    
    ratingsSheet.appendRow([
      generateUUID(), quoteId1, 'user2@example.com', 5, 
      new Date().toISOString(), new Date().toISOString()
    ]);
    
    ratingsSheet.appendRow([
      generateUUID(), quoteId2, 'user1@example.com', 4, 
      new Date().toISOString(), new Date().toISOString()
    ]);
  }
  
  return 'تم إنشاء بيانات تجريبية بنجاح';
}

/**
 * نقطة النهاية الرئيسية للواجهة البرمجية
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * نقطة النهاية للطلبات POST
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * معالجة الطلبات الواردة
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function handleRequest(e) {
  try {
    // التحقق من وجود الإجراء المطلوب
    if (!e || !e.parameter || !e.parameter.action) {
      return createJsonResponse({ error: 'الإجراء غير محدد' });
    }
    
    const action = e.parameter.action;
    let data = {};
    
    // استخراج البيانات من الطلب
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }
    
    // توجيه الطلب إلى الوظيفة المناسبة
    let result;
    
    switch (action) {
      // وظائف المستخدمين
      case 'login':
        result = login(data);
        break;
      case 'signup':
        result = signup(data);
        break;
      case 'user':
        if (e.method === 'GET') {
          result = getUser(data);
        } else if (e.method === 'PUT') {
          result = updateUser(data);
        }
        break;
        
      // وظائف الاقتباسات
      case 'quotes':
        result = getQuotes(data);
        break;
      case 'quote':
        if (e.method === 'GET') {
          result = getQuote(data);
        } else if (e.method === 'POST') {
          result = createQuote(data);
        } else if (e.method === 'PUT') {
          result = updateQuote(data);
        } else if (e.method === 'DELETE') {
          result = deleteQuote(data);
        }
        break;
      case 'userQuotes':
        result = getUserQuotes(data);
        break;
      case 'relatedQuotes':
        result = getRelatedQuotes(data);
        break;
        
      // وظائف التقييمات
      case 'rating':
        result = rateQuote(data);
        break;
      case 'userRating':
        result = getUserRating(data);
        break;
        
      // وظائف التعليقات
      case 'comments':
        result = getComments(data);
        break;
      case 'comment':
        if (e.method === 'POST') {
          result = addComment(data);
        } else if (e.method === 'DELETE') {
          result = deleteComment(data);
        }
        break;
        
      default:
        result = { error: 'الإجراء غير معروف' };
    }
    
    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

/**
 * إنشاء استجابة JSON
 * @param {Object} data - البيانات المراد إرجاعها
 * @returns {Object} - كائن ContentService
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ======== وظائف المستخدمين ========

/**
 * تسجيل دخول المستخدم
 * @param {Object} data - بيانات تسجيل الدخول
 * @returns {Object} - بيانات المستخدم
 */
function login(data) {
  const { email, password } = data;
  
  // التحقق من وجود البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
  }
  
  // البحث عن المستخدم
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error('البريد الإلكتروني غير مسجل');
  }
  
  // التحقق من كلمة المرور
  if (!verifyPassword(password, user.password)) {
    throw new Error('كلمة المرور غير صحيحة');
  }
  
  // إزالة كلمة المرور من البيانات المرسلة
  delete user.password;
  
  return { success: true, user };
}

/**
 * إنشاء حساب مستخدم جديد
 * @param {Object} data - بيانات المستخدم
 * @returns {Object} - بيانات المستخدم الجديد
 */
function signup(data) {
  const { email, password, username, fullName, favoriteCategories } = data;
  
  // التحقق من وجود البيانات المطلوبة
  if (!email || !password || !username || !fullName) {
    throw new Error('جميع الحقول المطلوبة يجب تعبئتها');
  }
  
  // التحقق من عدم وجود المستخدم مسبقاً
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new Error('البريد الإلكتروني مسجل مسبقاً');
  }
  
  // التحقق من عدم وجود اسم المستخدم مسبقاً
  const existingUsername = findUserByUsername(username);
  if (existingUsername) {
    throw new Error('اسم المستخدم مستخدم مسبقاً');
  }
  
  // إنشاء المستخدم الجديد
  const now = new Date().toISOString();
  const newUser = {
    id: generateUUID(),
    email,
    password: hashPassword(password),
    username,
    fullName,
    bio: data.bio || '',
    avatar: data.avatar || '',
    favoriteCategories: favoriteCategories || '',
    createdAt: now,
    updatedAt: now
  };
  
  // إضافة المستخدم إلى جدول المستخدمين
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  usersSheet.appendRow([
    newUser.id, newUser.email, newUser.password, newUser.username, newUser.fullName,
    newUser.bio, newUser.avatar, newUser.favoriteCategories, newUser.createdAt, newUser.updatedAt
  ]);
  
  // إزالة كلمة المرور من البيانات المرسلة
  delete newUser.password;
  
  return { success: true, user: newUser };
}

/**
 * الحصول على بيانات مستخدم محدد
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - بيانات المستخدم
 */
function getUser(data) {
  const { email } = data;
  
  // التحقق من وجود البريد الإلكتروني
  if (!email) {
    throw new Error('البريد الإلكتروني مطلوب');
  }
  
  // البحث عن المستخدم
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }
  
  // إزالة كلمة المرور من البيانات المرسلة
  delete user.password;
  
  return { success: true, user };
}

/**
 * تحديث بيانات المستخدم
 * @param {Object} data - بيانات المستخدم المحدثة
 * @returns {Object} - بيانات المستخدم المحدثة
 */
function updateUser(data) {
  const { userEmail, fullName, username, bio, favoriteCategories } = data;
  
  // التحقق من وجود البريد الإلكتروني
  if (!userEmail) {
    throw new Error('البريد الإلكتروني مطلوب');
  }
  
  // البحث عن المستخدم
  const user = findUserByEmail(userEmail);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }
  
  // التحقق من عدم وجود اسم المستخدم مسبقاً (إذا تم تغييره)
  if (username && username !== user.username) {
    const existingUsername = findUserByUsername(username);
    if (existingUsername) {
      throw new Error('اسم المستخدم مستخدم مسبقاً');
    }
  }
  
  // تحديث بيانات المستخدم
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  // البحث عن صف المستخدم
  const usersData = usersSheet.getDataRange().getValues();
  let userRowIndex = -1;
  
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][1] === userEmail) {
      userRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1 في Sheets API
      break;
    }
  }
  
  if (userRowIndex === -1) {
    throw new Error('المستخدم غير موجود');
  }
  
  // تحديث البيانات
  if (fullName) usersSheet.getRange(userRowIndex, 5).setValue(fullName);
  if (username) usersSheet.getRange(userRowIndex, 4).setValue(username);
  if (bio !== undefined) usersSheet.getRange(userRowIndex, 6).setValue(bio);
  if (favoriteCategories !== undefined) usersSheet.getRange(userRowIndex, 8).setValue(favoriteCategories);
  
  // تحديث تاريخ التحديث
  const now = new Date().toISOString();
  usersSheet.getRange(userRowIndex, 10).setValue(now);
  
  // الحصول على البيانات المحدثة
  const updatedUser = findUserByEmail(userEmail);
  delete updatedUser.password;
  
  return { success: true, user: updatedUser };
}

/**
 * البحث عن مستخدم بواسطة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {Object|null} - بيانات المستخدم أو null إذا لم يتم العثور عليه
 */
function findUserByEmail(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  const usersData = usersSheet.getDataRange().getValues();
  const headers = usersData[0];
  
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][1] === email) {
      const user = {};
      for (let j = 0; j < headers.length; j++) {
        user[headers[j]] = usersData[i][j];
      }
      return user;
    }
  }
  
  return null;
}

/**
 * البحث عن مستخدم بواسطة اسم المستخدم
 * @param {string} username - اسم المستخدم
 * @returns {Object|null} - بيانات المستخدم أو null إذا لم يتم العثور عليه
 */
function findUserByUsername(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
  
  const usersData = usersSheet.getDataRange().getValues();
  const headers = usersData[0];
  
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][3] === username) {
      const user = {};
      for (let j = 0; j < headers.length; j++) {
        user[headers[j]] = usersData[i][j];
      }
      return user;
    }
  }
  
  return null;
}

// ======== وظائف الاقتباسات ========

/**
 * الحصول على قائمة الاقتباسات
 * @param {Object} data - معلمات الاستعلام
 * @returns {Object} - قائمة الاقتباسات
 */
function getQuotes(data) {
  const page = parseInt(data.page) || 1;
  const limit = parseInt(data.limit) || 10;
  const sortBy = data.sort_by || 'newest';
  const categories = data.categories ? data.categories.split(',') : [];
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  // الحصول على جميع الاقتباسات
  const quotesData = quotesSheet.getDataRange().getValues();
  const headers = quotesData[0];
  
  // تحويل البيانات إلى مصفوفة من الكائنات
  let quotes = [];
  for (let i = 1; i < quotesData.length; i++) {
    const quote = {};
    for (let j = 0; j < headers.length; j++) {
      quote[headers[j]] = quotesData[i][j];
    }
    
    // إضافة متوسط التقييم وعدد التقييمات
    const ratingInfo = getQuoteRatingInfo(quote.id);
    quote.avgRating = ratingInfo.avgRating;
    quote.ratingsCount = ratingInfo.ratingsCount;
    
    quotes.push(quote);
  }
  
  // تصفية حسب الفئات إذا تم تحديدها
  if (categories.length > 0) {
    quotes = quotes.filter(quote => categories.includes(quote.category));
  }
  
  // ترتيب الاقتباسات
  if (sortBy === 'newest') {
    quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'top_rated') {
    quotes.sort((a, b) => b.avgRating - a.avgRating);
  }
  
  // تقسيم الصفحات
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuotes = quotes.slice(startIndex, endIndex);
  
  return {
    success: true,
    quotes: paginatedQuotes,
    total: quotes.length,
    page,
    limit,
    hasMore: endIndex < quotes.length
  };
}

/**
 * الحصول على اقتباس محدد
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - بيانات الاقتباس
 */
function getQuote(data) {
  const { id } = data;
  
  // التحقق من وجود المعرف
  if (!id) {
    throw new Error('معرف الاقتباس مطلوب');
  }
  
  // البحث عن الاقتباس
  const quote = findQuoteById(id);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // إضافة متوسط التقييم وعدد التقييمات
  const ratingInfo = getQuoteRatingInfo(id);
  quote.avgRating = ratingInfo.avgRating;
  quote.ratingsCount = ratingInfo.ratingsCount;
  
  return { success: true, quote };
}

/**
 * إنشاء اقتباس جديد
 * @param {Object} data - بيانات الاقتباس
 * @returns {Object} - بيانات الاقتباس الجديد
 */
function createQuote(data) {
  const { title, text, category, userEmail } = data;
  
  // التحقق من وجود البيانات المطلوبة
  if (!title || !text || !category) {
    throw new Error('جميع الحقول المطلوبة يجب تعبئتها');
  }
  
  // التحقق من وجود المستخدم
  const user = findUserByEmail(userEmail);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }
  
  // إنشاء الاقتباس الجديد
  const now = new Date().toISOString();
  const newQuote = {
    id: generateUUID(),
    title,
    text,
    category,
    authorEmail: userEmail,
    authorName: user.username || user.fullName,
    authorAvatar: user.avatar || '',
    createdAt: now,
    updatedAt: now
  };
  
  // إضافة الاقتباس إلى جدول الاقتباسات
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  quotesSheet.appendRow([
    newQuote.id, newQuote.title, newQuote.text, newQuote.category,
    newQuote.authorEmail, newQuote.authorName, newQuote.authorAvatar,
    newQuote.createdAt, newQuote.updatedAt
  ]);
  
  // إضافة متوسط التقييم وعدد التقييمات
  newQuote.avgRating = 0;
  newQuote.ratingsCount = 0;
  
  return { success: true, quote: newQuote };
}

/**
 * تحديث اقتباس
 * @param {Object} data - بيانات الاقتباس المحدثة
 * @returns {Object} - بيانات الاقتباس المحدثة
 */
function updateQuote(data) {
  const { id, title, text, category, userEmail } = data;
  
  // التحقق من وجود المعرف
  if (!id) {
    throw new Error('معرف الاقتباس مطلوب');
  }
  
  // البحث عن الاقتباس
  const quote = findQuoteById(id);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // التحقق من أن المستخدم هو مؤلف الاقتباس
  if (quote.authorEmail !== userEmail) {
    throw new Error('غير مصرح لك بتعديل هذا الاقتباس');
  }
  
  // تحديث بيانات الاقتباس
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  // البحث عن صف الاقتباس
  const quotesData = quotesSheet.getDataRange().getValues();
  let quoteRowIndex = -1;
  
  for (let i = 1; i < quotesData.length; i++) {
    if (quotesData[i][0] === id) {
      quoteRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1 في Sheets API
      break;
    }
  }
  
  if (quoteRowIndex === -1) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // تحديث البيانات
  if (title) quotesSheet.getRange(quoteRowIndex, 2).setValue(title);
  if (text) quotesSheet.getRange(quoteRowIndex, 3).setValue(text);
  if (category) quotesSheet.getRange(quoteRowIndex, 4).setValue(category);
  
  // تحديث تاريخ التحديث
  const now = new Date().toISOString();
  quotesSheet.getRange(quoteRowIndex, 9).setValue(now);
  
  // الحصول على البيانات المحدثة
  const updatedQuote = findQuoteById(id);
  
  // إضافة متوسط التقييم وعدد التقييمات
  const ratingInfo = getQuoteRatingInfo(id);
  updatedQuote.avgRating = ratingInfo.avgRating;
  updatedQuote.ratingsCount = ratingInfo.ratingsCount;
  
  return { success: true, quote: updatedQuote };
}

/**
 * حذف اقتباس
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - نتيجة الحذف
 */
function deleteQuote(data) {
  const { id, userEmail } = data;
  
  // التحقق من وجود المعرف
  if (!id) {
    throw new Error('معرف الاقتباس مطلوب');
  }
  
  // البحث عن الاقتباس
  const quote = findQuoteById(id);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // التحقق من أن المستخدم هو مؤلف الاقتباس
  if (quote.authorEmail !== userEmail) {
    throw new Error('غير مصرح لك بحذف هذا الاقتباس');
  }
  
  // حذف الاقتباس
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  // البحث عن صف الاقتباس
  const quotesData = quotesSheet.getDataRange().getValues();
  let quoteRowIndex = -1;
  
  for (let i = 1; i < quotesData.length; i++) {
    if (quotesData[i][0] === id) {
      quoteRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1 في Sheets API
      break;
    }
  }
  
  if (quoteRowIndex === -1) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // حذف الصف
  quotesSheet.deleteRow(quoteRowIndex);
  
  // حذف التعليقات والتقييمات المرتبطة بالاقتباس
  deleteCommentsForQuote(id);
  deleteRatingsForQuote(id);
  
  return { success: true, message: 'تم حذف الاقتباس بنجاح' };
}

/**
 * الحصول على اقتباسات مستخدم محدد
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - قائمة الاقتباسات
 */
function getUserQuotes(data) {
  const { email } = data;
  
  // التحقق من وجود البريد الإلكتروني
  if (!email) {
    throw new Error('البريد الإلكتروني مطلوب');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  // الحصول على جميع الاقتباسات
  const quotesData = quotesSheet.getDataRange().getValues();
  const headers = quotesData[0];
  
  // تحويل البيانات إلى مصفوفة من الكائنات
  let quotes = [];
  for (let i = 1; i < quotesData.length; i++) {
    if (quotesData[i][4] === email) {
      const quote = {};
      for (let j = 0; j < headers.length; j++) {
        quote[headers[j]] = quotesData[i][j];
      }
      
      // إضافة متوسط التقييم وعدد التقييمات
      const ratingInfo = getQuoteRatingInfo(quote.id);
      quote.avgRating = ratingInfo.avgRating;
      quote.ratingsCount = ratingInfo.ratingsCount;
      
      quotes.push(quote);
    }
  }
  
  // ترتيب الاقتباسات حسب تاريخ الإنشاء (الأحدث أولاً)
  quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return { success: true, quotes };
}

/**
 * الحصول على اقتباسات مشابهة
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - قائمة الاقتباسات المشابهة
 */
function getRelatedQuotes(data) {
  const { id, limit } = data;
  const maxLimit = parseInt(limit) || 5;
  
  // التحقق من وجود المعرف
  if (!id) {
    throw new Error('معرف الاقتباس مطلوب');
  }
  
  // البحث عن الاقتباس
  const quote = findQuoteById(id);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  // الحصول على جميع الاقتباسات
  const quotesData = quotesSheet.getDataRange().getValues();
  const headers = quotesData[0];
  
  // تحويل البيانات إلى مصفوفة من الكائنات
  let quotes = [];
  for (let i = 1; i < quotesData.length; i++) {
    if (quotesData[i][0] !== id && quotesData[i][3] === quote.category) {
      const relatedQuote = {};
      for (let j = 0; j < headers.length; j++) {
        relatedQuote[headers[j]] = quotesData[i][j];
      }
      
      // إضافة متوسط التقييم وعدد التقييمات
      const ratingInfo = getQuoteRatingInfo(relatedQuote.id);
      relatedQuote.avgRating = ratingInfo.avgRating;
      relatedQuote.ratingsCount = ratingInfo.ratingsCount;
      
      quotes.push(relatedQuote);
    }
  }
  
  // ترتيب الاقتباسات حسب التقييم (الأعلى أولاً)
  quotes.sort((a, b) => b.avgRating - a.avgRating);
  
  // تحديد عدد الاقتباسات المرجعة
  quotes = quotes.slice(0, maxLimit);
  
  return { success: true, quotes };
}

/**
 * البحث عن اقتباس بواسطة المعرف
 * @param {string} id - معرف الاقتباس
 * @returns {Object|null} - بيانات الاقتباس أو null إذا لم يتم العثور عليه
 */
function findQuoteById(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const quotesSheet = ss.getSheetByName(QUOTES_SHEET_NAME);
  
  const quotesData = quotesSheet.getDataRange().getValues();
  const headers = quotesData[0];
  
  for (let i = 1; i < quotesData.length; i++) {
    if (quotesData[i][0] === id) {
      const quote = {};
      for (let j = 0; j < headers.length; j++) {
        quote[headers[j]] = quotesData[i][j];
      }
      return quote;
    }
  }
  
  return null;
}

// ======== وظائف التقييمات ========

/**
 * إضافة أو تحديث تقييم
 * @param {Object} data - بيانات التقييم
 * @returns {Object} - نتيجة التقييم
 */
function rateQuote(data) {
  const { quoteId, rating, userEmail } = data;
  
  // التحقق من وجود البيانات المطلوبة
  if (!quoteId || !rating || !userEmail) {
    throw new Error('جميع الحقول المطلوبة يجب تعبئتها');
  }
  
  // التحقق من وجود الاقتباس
  const quote = findQuoteById(quoteId);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // التحقق من وجود المستخدم
  const user = findUserByEmail(userEmail);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }
  
  // التحقق من قيمة التقييم
  const ratingValue = parseInt(rating);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new Error('قيمة التقييم يجب أن تكون بين 1 و 5');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  
  // البحث عن تقييم المستخدم الحالي للاقتباس
  const ratingsData = ratingsSheet.getDataRange().getValues();
  let ratingRowIndex = -1;
  
  for (let i = 1; i < ratingsData.length; i++) {
    if (ratingsData[i][1] === quoteId && ratingsData[i][2] === userEmail) {
      ratingRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1 في Sheets API
      break;
    }
  }
  
  const now = new Date().toISOString();
  
  if (ratingRowIndex === -1) {
    // إضافة تقييم جديد
    ratingsSheet.appendRow([
      generateUUID(), quoteId, userEmail, ratingValue, now, now
    ]);
  } else {
    // تحديث التقييم الحالي
    ratingsSheet.getRange(ratingRowIndex, 4).setValue(ratingValue);
    ratingsSheet.getRange(ratingRowIndex, 6).setValue(now);
  }
  
  // الحصول على متوسط التقييم وعدد التقييمات
  const ratingInfo = getQuoteRatingInfo(quoteId);
  
  return {
    success: true,
    quoteId,
    avgRating: ratingInfo.avgRating,
    ratingsCount: ratingInfo.ratingsCount
  };
}

/**
 * الحصول على تقييم المستخدم لاقتباس محدد
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - بيانات التقييم
 */
function getUserRating(data) {
  const { quoteId, userEmail } = data;
  
  // التحقق من وجود البيانات المطلوبة
  if (!quoteId || !userEmail) {
    throw new Error('معرف الاقتباس والبريد الإلكتروني مطلوبان');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  
  // البحث عن تقييم المستخدم
  const ratingsData = ratingsSheet.getDataRange().getValues();
  
  for (let i = 1; i < ratingsData.length; i++) {
    if (ratingsData[i][1] === quoteId && ratingsData[i][2] === userEmail) {
      return {
        success: true,
        rating: ratingsData[i][3]
      };
    }
  }
  
  return {
    success: true,
    rating: 0
  };
}

/**
 * الحصول على معلومات تقييم اقتباس محدد
 * @param {string} quoteId - معرف الاقتباس
 * @returns {Object} - متوسط التقييم وعدد التقييمات
 */
function getQuoteRatingInfo(quoteId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  
  // الحصول على جميع التقييمات
  const ratingsData = ratingsSheet.getDataRange().getValues();
  
  let totalRating = 0;
  let ratingsCount = 0;
  
  for (let i = 1; i < ratingsData.length; i++) {
    if (ratingsData[i][1] === quoteId) {
      totalRating += ratingsData[i][3];
      ratingsCount++;
    }
  }
  
  const avgRating = ratingsCount > 0 ? totalRating / ratingsCount : 0;
  
  return {
    avgRating,
    ratingsCount
  };
}

/**
 * حذف جميع التقييمات المرتبطة باقتباس محدد
 * @param {string} quoteId - معرف الاقتباس
 */
function deleteRatingsForQuote(quoteId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ratingsSheet = ss.getSheetByName(RATINGS_SHEET_NAME);
  
  // الحصول على جميع التقييمات
  const ratingsData = ratingsSheet.getDataRange().getValues();
  
  // تحديد الصفوف المراد حذفها (من الأسفل إلى الأعلى لتجنب مشاكل الفهرسة)
  const rowsToDelete = [];
  for (let i = 1; i < ratingsData.length; i++) {
    if (ratingsData[i][1] === quoteId) {
      rowsToDelete.push(i + 1); // +1 لأن الصفوف تبدأ من 1 في Sheets API
    }
  }
  
  // حذف الصفوف من الأسفل إلى الأعلى
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    ratingsSheet.deleteRow(rowsToDelete[i]);
  }
}

// ======== وظائف التعليقات ========

/**
 * الحصول على تعليقات اقتباس محدد
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - قائمة التعليقات
 */
function getComments(data) {
  const { quoteId } = data;
  
  // التحقق من وجود معرف الاقتباس
  if (!quoteId) {
    throw new Error('معرف الاقتباس مطلوب');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  
  // الحصول على جميع التعليقات
  const commentsData = commentsSheet.getDataRange().getValues();
  const headers = commentsData[0];
  
  // تحويل البيانات إلى مصفوفة من الكائنات
  let comments = [];
  for (let i = 1; i < commentsData.length; i++) {
    if (commentsData[i][1] === quoteId) {
      const comment = {};
      for (let j = 0; j < headers.length; j++) {
        comment[headers[j]] = commentsData[i][j];
      }
      comments.push(comment);
    }
  }
  
  // ترتيب التعليقات حسب تاريخ الإنشاء (الأحدث أولاً)
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return { success: true, comments };
}

/**
 * إضافة تعليق جديد
 * @param {Object} data - بيانات التعليق
 * @returns {Object} - بيانات التعليق الجديد
 */
function addComment(data) {
  const { quoteId, text, userEmail } = data;
  
  // التحقق من وجود البيانات المطلوبة
  if (!quoteId || !text || !userEmail) {
    throw new Error('جميع الحقول المطلوبة يجب تعبئتها');
  }
  
  // التحقق من وجود الاقتباس
  const quote = findQuoteById(quoteId);
  if (!quote) {
    throw new Error('الاقتباس غير موجود');
  }
  
  // التحقق من وجود المستخدم
  const user = findUserByEmail(userEmail);
  if (!user) {
    throw new Error('المستخدم غير موجود');
  }
  
  // إنشاء التعليق الجديد
  const now = new Date().toISOString();
  const newComment = {
    id: generateUUID(),
    quoteId,
    userEmail,
    userName: user.username || user.fullName,
    userAvatar: user.avatar || '',
    text,
    createdAt: now
  };
  
  // إضافة التعليق إلى جدول التعليقات
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  
  commentsSheet.appendRow([
    newComment.id, newComment.quoteId, newComment.userEmail,
    newComment.userName, newComment.userAvatar, newComment.text, newComment.createdAt
  ]);
  
  return { success: true, comment: newComment };
}

/**
 * حذف تعليق
 * @param {Object} data - بيانات الطلب
 * @returns {Object} - نتيجة الحذف
 */
function deleteComment(data) {
  const { id, userEmail } = data;
  
  // التحقق من وجود المعرف
  if (!id) {
    throw new Error('معرف التعليق مطلوب');
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  
  // البحث عن التعليق
  const commentsData = commentsSheet.getDataRange().getValues();
  let commentRowIndex = -1;
  let isAuthor = false;
  
  for (let i = 1; i < commentsData.length; i++) {
    if (commentsData[i][0] === id) {
      commentRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1 في Sheets API
      isAuthor = commentsData[i][2] === userEmail;
      break;
    }
  }
  
  if (commentRowIndex === -1) {
    throw new Error('التعليق غير موجود');
  }
  
  // التحقق من أن المستخدم هو صاحب التعليق
  if (!isAuthor) {
    throw new Error('غير مصرح لك بحذف هذا التعليق');
  }
  
  // حذف الصف
  commentsSheet.deleteRow(commentRowIndex);
  
  return { success: true, message: 'تم حذف التعليق بنجاح' };
}

/**
 * حذف جميع التعليقات المرتبطة باقتباس محدد
 * @param {string} quoteId - معرف الاقتباس
 */
function deleteCommentsForQuote(quoteId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const commentsSheet = ss.getSheetByName(COMMENTS_SHEET_NAME);
  
  // الحصول على جميع التعليقات
  const commentsData = commentsSheet.getDataRange().getValues();
  
  // تحديد الصفوف المراد حذفها (من الأسفل إلى الأعلى لتجنب مشاكل الفهرسة)
  const rowsToDelete = [];
  for (let i = 1; i < commentsData.length; i++) {
    if (commentsData[i][1] === quoteId) {
      rowsToDelete.push(i + 1); // +1 لأن الصفوف تبدأ من 1 في Sheets API
    }
  }
  
  // حذف الصفوف من الأسفل إلى الأعلى
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    commentsSheet.deleteRow(rowsToDelete[i]);
  }
}

// ======== وظائف مساعدة ========

/**
 * إنشاء معرف فريد (UUID)
 * @returns {string} - معرف فريد
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * تشفير كلمة المرور
 * @param {string} password - كلمة المرور
 * @returns {string} - كلمة المرور المشفرة
 */
function hashPassword(password) {
  // ملاحظة: هذه ليست طريقة آمنة للتشفير في بيئة الإنتاج
  // في بيئة الإنتاج، يجب استخدام خوارزميات تشفير أكثر أماناً
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
}

/**
 * التحقق من صحة كلمة المرور
 * @param {string} password - كلمة المرور
 * @param {string} hashedPassword - كلمة المرور المشفرة
 * @returns {boolean} - صحيح إذا كانت كلمة المرور صحيحة
 */
function verifyPassword(password, hashedPassword) {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}
