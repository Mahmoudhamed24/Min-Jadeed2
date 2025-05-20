/**
 * utils.js - ملف الوظائف المساعدة لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف مساعدة عامة تستخدم في جميع أنحاء التطبيق
 * مثل التنسيق والتحقق من الصحة وإدارة التخزين المحلي وغيرها
 */

// ======== وظائف التحقق من الصحة ========

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان البريد الإلكتروني صالحاً
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة كلمة المرور (يجب أن تكون 8 أحرف على الأقل)
 * @param {string} password - كلمة المرور المراد التحقق منها
 * @returns {boolean} - صحيح إذا كانت كلمة المرور صالحة
 */
function isValidPassword(password) {
  return password && password.length >= 8;
}

/**
 * التحقق من صحة اسم المستخدم (يجب أن يكون 3 أحرف على الأقل، بدون مسافات أو رموز خاصة)
 * @param {string} username - اسم المستخدم المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان اسم المستخدم صالحاً
 */
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return username && username.length >= 3 && usernameRegex.test(username);
}

/**
 * التحقق من صحة رابط URL
 * @param {string} url - الرابط المراد التحقق منه
 * @returns {boolean} - صحيح إذا كان الرابط صالحاً
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// ======== وظائف التنسيق ========

/**
 * تنسيق التاريخ إلى صيغة مقروءة
 * @param {string|Date} dateString - التاريخ المراد تنسيقه
 * @returns {string} - التاريخ المنسق
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  
  // التحقق من صحة التاريخ
  if (isNaN(date.getTime())) {
    return 'تاريخ غير صالح';
  }
  
  // تنسيق التاريخ بالصيغة العربية
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ar-SA', options);
}

/**
 * تنسيق الوقت المنقضي منذ تاريخ معين
 * @param {string|Date} dateString - التاريخ المراد حساب الوقت المنقضي منه
 * @returns {string} - الوقت المنقضي بصيغة مقروءة (منذ دقيقة، منذ ساعة، إلخ)
 */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  // التحقق من صحة التاريخ
  if (isNaN(date.getTime())) {
    return 'وقت غير معروف';
  }
  
  const seconds = Math.floor((now - date) / 1000);
  
  // تحويل الثواني إلى وحدات زمنية مختلفة
  let interval = Math.floor(seconds / 31536000); // سنوات
  
  if (interval >= 1) {
    return interval === 1 ? 'منذ سنة' : `منذ ${interval} سنوات`;
  }
  
  interval = Math.floor(seconds / 2592000); // شهور
  if (interval >= 1) {
    return interval === 1 ? 'منذ شهر' : `منذ ${interval} أشهر`;
  }
  
  interval = Math.floor(seconds / 86400); // أيام
  if (interval >= 1) {
    return interval === 1 ? 'منذ يوم' : `منذ ${interval} أيام`;
  }
  
  interval = Math.floor(seconds / 3600); // ساعات
  if (interval >= 1) {
    return interval === 1 ? 'منذ ساعة' : `منذ ${interval} ساعات`;
  }
  
  interval = Math.floor(seconds / 60); // دقائق
  if (interval >= 1) {
    return interval === 1 ? 'منذ دقيقة' : `منذ ${interval} دقائق`;
  }
  
  return 'منذ لحظات';
}

/**
 * تحويل النص العادي إلى HTML مع تحويل الروابط إلى روابط قابلة للنقر
 * @param {string} text - النص المراد تحويله
 * @returns {string} - النص مع روابط قابلة للنقر
 */
function linkifyText(text) {
  if (!text) return '';
  
  // تعبير منتظم للعثور على الروابط في النص
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // استبدال الروابط بعلامات الروابط HTML
  return text.replace(urlRegex, url => {
    return `<a href="${url}" class="clickable-link" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

/**
 * اقتطاع النص إلى طول محدد مع إضافة علامة القطع
 * @param {string} text - النص المراد اقتطاعه
 * @param {number} maxLength - الحد الأقصى لطول النص
 * @returns {string} - النص المقتطع
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

// ======== وظائف التخزين المحلي ========

/**
 * حفظ بيانات في التخزين المحلي
 * @param {string} key - مفتاح التخزين
 * @param {any} value - القيمة المراد تخزينها
 */
function saveToLocalStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('خطأ في حفظ البيانات في التخزين المحلي:', error);
  }
}

/**
 * استرجاع بيانات من التخزين المحلي
 * @param {string} key - مفتاح التخزين
 * @param {any} defaultValue - القيمة الافتراضية إذا لم يتم العثور على البيانات
 * @returns {any} - البيانات المسترجعة أو القيمة الافتراضية
 */
function getFromLocalStorage(key, defaultValue = null) {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('خطأ في استرجاع البيانات من التخزين المحلي:', error);
    return defaultValue;
  }
}

/**
 * حذف بيانات من التخزين المحلي
 * @param {string} key - مفتاح التخزين
 */
function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('خطأ في حذف البيانات من التخزين المحلي:', error);
  }
}

// ======== وظائف DOM ========

/**
 * العثور على عنصر في الصفحة
 * @param {string} selector - محدد CSS للعنصر
 * @returns {HTMLElement|null} - العنصر أو null إذا لم يتم العثور عليه
 */
function $(selector) {
  return document.querySelector(selector);
}

/**
 * العثور على جميع العناصر المطابقة في الصفحة
 * @param {string} selector - محدد CSS للعناصر
 * @returns {NodeList} - قائمة بالعناصر المطابقة
 */
function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * إنشاء عنصر HTML جديد مع خصائص وأحداث
 * @param {string} tag - نوع العنصر (div, span, إلخ)
 * @param {Object} options - خيارات العنصر (الخصائص، الأحداث، إلخ)
 * @returns {HTMLElement} - العنصر الجديد
 */
function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  // تعيين الخصائص
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  // تعيين النص
  if (options.text) {
    element.textContent = options.text;
  }
  
  // تعيين HTML
  if (options.html) {
    element.innerHTML = options.html;
  }
  
  // تعيين الأحداث
  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }
  
  // إضافة الفئات
  if (options.classes) {
    if (Array.isArray(options.classes)) {
      options.classes.forEach(cls => element.classList.add(cls));
    } else {
      element.className = options.classes;
    }
  }
  
  // إضافة الأبناء
  if (options.children) {
    options.children.forEach(child => {
      element.appendChild(child);
    });
  }
  
  return element;
}

/**
 * إظهار إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 * @param {number} duration - مدة ظهور الإشعار بالمللي ثانية
 */
function showNotification(message, type = 'info', duration = 3000) {
  // العثور على حاوية الإشعارات أو إنشاؤها إذا لم تكن موجودة
  let container = $('#notification-container');
  if (!container) {
    container = createElement('div', {
      attributes: { id: 'notification-container' },
      classes: 'notification-container'
    });
    document.body.appendChild(container);
  }
  
  // إنشاء عنصر الإشعار
  const notification = createElement('div', {
    classes: ['notification', `notification-${type}`, 'notification-animation'],
    html: message
  });
  
  // إضافة الإشعار إلى الحاوية
  container.appendChild(notification);
  
  // إزالة الإشعار بعد المدة المحددة
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      container.removeChild(notification);
    }, 300);
  }, duration);
}

/**
 * تأكيد إجراء من المستخدم
 * @param {string} message - رسالة التأكيد
 * @returns {Promise<boolean>} - وعد يتم حله بـ true إذا تم التأكيد، وبـ false إذا تم الإلغاء
 */
function confirmAction(message) {
  return new Promise(resolve => {
    // إنشاء عناصر النافذة المنبثقة
    const overlay = createElement('div', { classes: 'overlay' });
    const modal = createElement('div', { classes: 'modal' });
    
    // إنشاء رأس النافذة
    const modalHeader = createElement('div', { classes: 'modal-header' });
    const modalTitle = createElement('h3', { 
      classes: 'modal-title',
      text: 'تأكيد الإجراء'
    });
    const closeButton = createElement('span', {
      classes: 'modal-close',
      text: '×',
      events: {
        click: () => {
          document.body.removeChild(overlay);
          resolve(false);
        }
      }
    });
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // إنشاء جسم النافذة
    const modalBody = createElement('div', {
      classes: 'modal-body',
      html: `<p>${message}</p>`
    });
    
    // إنشاء تذييل النافذة
    const modalFooter = createElement('div', { classes: 'modal-footer' });
    const cancelButton = createElement('button', {
      classes: 'btn btn-outline',
      text: 'إلغاء',
      events: {
        click: () => {
          document.body.removeChild(overlay);
          resolve(false);
        }
      }
    });
    const confirmButton = createElement('button', {
      classes: 'btn btn-primary',
      text: 'تأكيد',
      events: {
        click: () => {
          document.body.removeChild(overlay);
          resolve(true);
        }
      }
    });
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(confirmButton);
    
    // تجميع النافذة
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    overlay.appendChild(modal);
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(overlay);
  });
}

// ======== وظائف متنوعة ========

/**
 * إنشاء معرف فريد
 * @returns {string} - معرف فريد
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * تأخير تنفيذ وظيفة لفترة زمنية محددة
 * @param {number} ms - المدة بالمللي ثانية
 * @returns {Promise} - وعد يتم حله بعد المدة المحددة
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تحويل نص إلى سلسلة URL آمنة (slug)
 * @param {string} text - النص المراد تحويله
 * @returns {string} - سلسلة URL آمنة
 */
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// تصدير الوظائف للاستخدام في الملفات الأخرى
window.utils = {
  // وظائف التحقق من الصحة
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidUrl,
  
  // وظائف التنسيق
  formatDate,
  timeAgo,
  linkifyText,
  truncateText,
  
  // وظائف التخزين المحلي
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  
  // وظائف DOM
  $,
  $$,
  createElement,
  showNotification,
  confirmAction,
  
  // وظائف متنوعة
  generateUniqueId,
  delay,
  slugify
};
