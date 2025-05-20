/**
 * auth.js - ملف المصادقة لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة المصادقة وتسجيل الدخول وإنشاء الحسابات
 * يتعامل مع تسجيل الدخول والخروج وإدارة جلسات المستخدمين
 */

// كائن المصادقة الرئيسي
const auth = (function() {
  // مفاتيح التخزين المحلي
  const REMEMBER_ME_KEY = 'min_jadeed_remember_me';
  
  // عناصر DOM المستخدمة في صفحات المصادقة
  let loginForm, signupForm, logoutBtn;
  
  /**
   * تهيئة وظائف المصادقة
   */
  function init() {
    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    checkAuthState();
    
    // البحث عن عناصر DOM المطلوبة
    loginForm = utils.$('#login-form');
    signupForm = utils.$('#signup-form');
    logoutBtn = utils.$('#logout-btn');
    
    // إضافة معالجات الأحداث
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignup);
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    // إضافة معالجات أحداث إضافية
    setupPasswordToggle();
    setupForgotPassword();
    setupTermsModal();
  }
  
  /**
   * التحقق من حالة تسجيل الدخول وتحديث واجهة المستخدم
   */
  function checkAuthState() {
    const isLoggedIn = api.isLoggedIn();
    const currentUser = api.getCurrentUser();
    
    // تحديث عناصر واجهة المستخدم بناءً على حالة تسجيل الدخول
    updateUIForAuthState(isLoggedIn, currentUser);
    
    // التحقق من "تذكرني" إذا لم يكن المستخدم مسجل الدخول
    if (!isLoggedIn) {
      checkRememberMe();
    }
    
    return isLoggedIn;
  }
  
  /**
   * تحديث واجهة المستخدم بناءً على حالة تسجيل الدخول
   * @param {boolean} isLoggedIn - ما إذا كان المستخدم مسجل الدخول
   * @param {Object} user - بيانات المستخدم
   */
  function updateUIForAuthState(isLoggedIn, user) {
    // العناصر التي تظهر فقط للمستخدمين المسجلين
    const userMenuElements = utils.$$('#user-menu, .user-only');
    // العناصر التي تظهر فقط للزوار
    const guestMenuElements = utils.$$('#guest-menu, .guest-only');
    
    if (isLoggedIn && user) {
      // تحديث معلومات المستخدم في واجهة المستخدم
      const usernameElements = utils.$$('#username');
      const userEmailElements = utils.$$('#user-email');
      
      usernameElements.forEach(el => {
        if (el) el.textContent = user.username || user.fullName;
      });
      
      userEmailElements.forEach(el => {
        if (el) el.textContent = user.email;
      });
      
      // إظهار عناصر المستخدمين المسجلين وإخفاء عناصر الزوار
      userMenuElements.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
      guestMenuElements.forEach(el => {
        if (el) el.classList.add('hidden');
      });
      
      // تحديث عناصر إضافية خاصة بالمستخدم
      const addCommentForm = utils.$('#add-comment-form');
      const loginToComment = utils.$('#login-to-comment');
      
      if (addCommentForm) addCommentForm.classList.remove('hidden');
      if (loginToComment) loginToComment.classList.add('hidden');
    } else {
      // إظهار عناصر الزوار وإخفاء عناصر المستخدمين المسجلين
      userMenuElements.forEach(el => {
        if (el) el.classList.add('hidden');
      });
      
      guestMenuElements.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
      // تحديث عناصر إضافية خاصة بالزوار
      const addCommentForm = utils.$('#add-comment-form');
      const loginToComment = utils.$('#login-to-comment');
      
      if (addCommentForm) addCommentForm.classList.add('hidden');
      if (loginToComment) loginToComment.classList.remove('hidden');
    }
  }
  
  /**
   * معالجة تسجيل الدخول
   * @param {Event} event - حدث النموذج
   */
  async function handleLogin(event) {
    event.preventDefault();
    
    // الحصول على بيانات النموذج
    const email = utils.$('#email').value.trim();
    const password = utils.$('#password').value;
    const rememberMe = utils.$('#remember-me')?.checked || false;
    
    // إعادة تعيين رسائل الخطأ
    utils.$('#email-error').textContent = '';
    utils.$('#password-error').textContent = '';
    utils.$('#login-error').textContent = '';
    
    // التحقق من صحة البيانات
    let isValid = true;
    
    if (!utils.isValidEmail(email)) {
      utils.$('#email-error').textContent = 'يرجى إدخال بريد إلكتروني صالح';
      isValid = false;
    }
    
    if (!password) {
      utils.$('#password-error').textContent = 'يرجى إدخال كلمة المرور';
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      // إظهار مؤشر التحميل
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading"></div>';
      
      // محاولة تسجيل الدخول
      const response = await api.login(email, password);
      
      // حفظ خيار "تذكرني" إذا تم تحديده
      if (rememberMe) {
        utils.saveToLocalStorage(REMEMBER_ME_KEY, { email, password });
      } else {
        utils.removeFromLocalStorage(REMEMBER_ME_KEY);
      }
      
      // إظهار إشعار نجاح
      utils.showNotification('تم تسجيل الدخول بنجاح!', 'success');
      
      // إعادة توجيه المستخدم إلى الصفحة الرئيسية
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
    } catch (error) {
      // إظهار رسالة الخطأ
      utils.$('#login-error').textContent = error.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.';
      
      // إعادة تمكين زر التسجيل
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  /**
   * معالجة إنشاء حساب جديد
   * @param {Event} event - حدث النموذج
   */
  async function handleSignup(event) {
    event.preventDefault();
    
    // الحصول على بيانات النموذج
    const fullName = utils.$('#fullname').value.trim();
    const username = utils.$('#username').value.trim();
    const email = utils.$('#email').value.trim();
    const password = utils.$('#password').value;
    const confirmPassword = utils.$('#confirm-password').value;
    const termsAgreement = utils.$('#terms-agreement')?.checked || false;
    
    // جمع الفئات المفضلة
    const favoriteCategories = [];
    utils.$$('.favorite-category:checked').forEach(checkbox => {
      favoriteCategories.push(checkbox.value);
    });
    
    // إعادة تعيين رسائل الخطأ
    utils.$('#fullname-error').textContent = '';
    utils.$('#username-error').textContent = '';
    utils.$('#email-error').textContent = '';
    utils.$('#password-error').textContent = '';
    utils.$('#confirm-password-error').textContent = '';
    utils.$('#terms-error').textContent = '';
    utils.$('#signup-error').textContent = '';
    
    // التحقق من صحة البيانات
    let isValid = true;
    
    if (!fullName) {
      utils.$('#fullname-error').textContent = 'يرجى إدخال الاسم الكامل';
      isValid = false;
    }
    
    if (!utils.isValidUsername(username)) {
      utils.$('#username-error').textContent = 'يرجى إدخال اسم مستخدم صالح (3 أحرف على الأقل، بدون مسافات أو رموز خاصة)';
      isValid = false;
    }
    
    if (!utils.isValidEmail(email)) {
      utils.$('#email-error').textContent = 'يرجى إدخال بريد إلكتروني صالح';
      isValid = false;
    }
    
    if (!utils.isValidPassword(password)) {
      utils.$('#password-error').textContent = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      utils.$('#confirm-password-error').textContent = 'كلمات المرور غير متطابقة';
      isValid = false;
    }
    
    if (!termsAgreement) {
      utils.$('#terms-error').textContent = 'يجب الموافقة على الشروط والأحكام';
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      // إظهار مؤشر التحميل
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading"></div>';
      
      // إعداد بيانات المستخدم
      const userData = {
        fullName,
        username,
        email,
        password,
        favoriteCategories: favoriteCategories.join(',')
      };
      
      // محاولة إنشاء حساب جديد
      const response = await api.signup(userData);
      
      // إظهار إشعار نجاح
      utils.showNotification('تم إنشاء الحساب بنجاح!', 'success');
      
      // إعادة توجيه المستخدم إلى الصفحة الرئيسية
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
    } catch (error) {
      // إظهار رسالة الخطأ
      utils.$('#signup-error').textContent = error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
      
      // إعادة تمكين زر التسجيل
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  /**
   * معالجة تسجيل الخروج
   * @param {Event} event - حدث النقر
   */
  async function handleLogout(event) {
    event.preventDefault();
    
    try {
      // تسجيل الخروج
      api.logout();
      
      // إظهار إشعار نجاح
      utils.showNotification('تم تسجيل الخروج بنجاح!', 'success');
      
      // تحديث واجهة المستخدم
      updateUIForAuthState(false, null);
      
      // إعادة توجيه المستخدم إلى الصفحة الرئيسية إذا كان في صفحة تتطلب تسجيل الدخول
      const currentPath = window.location.pathname;
      if (currentPath.includes('/profile.html') || currentPath.includes('/new-post.html')) {
        window.location.href = '../index.html';
      }
    } catch (error) {
      utils.showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
    }
  }
  
  /**
   * التحقق من "تذكرني" ومحاولة تسجيل الدخول تلقائياً
   */
  async function checkRememberMe() {
    const rememberedUser = utils.getFromLocalStorage(REMEMBER_ME_KEY);
    
    if (rememberedUser && rememberedUser.email && rememberedUser.password) {
      try {
        // محاولة تسجيل الدخول تلقائياً
        const response = await api.login(rememberedUser.email, rememberedUser.password);
        
        // تحديث واجهة المستخدم
        updateUIForAuthState(true, response.user);
        
        // إظهار إشعار نجاح
        utils.showNotification('تم تسجيل الدخول تلقائياً', 'success');
      } catch (error) {
        // حذف بيانات "تذكرني" إذا فشل تسجيل الدخول
        utils.removeFromLocalStorage(REMEMBER_ME_KEY);
      }
    }
  }
  
  /**
   * إعداد وظيفة إظهار/إخفاء كلمة المرور
   */
  function setupPasswordToggle() {
    const passwordToggles = utils.$$('.password-toggle');
    
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }
  
  /**
   * إعداد وظيفة "نسيت كلمة المرور"
   */
  function setupForgotPassword() {
    const forgotPasswordLink = utils.$('#forgot-password');
    const forgotPasswordModal = utils.$('#forgot-password-modal');
    const closeForgotModal = utils.$('#close-forgot-modal');
    const forgotPasswordForm = utils.$('#forgot-password-form');
    
    if (forgotPasswordLink && forgotPasswordModal) {
      // فتح النافذة المنبثقة عند النقر على الرابط
      forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        forgotPasswordModal.classList.remove('hidden');
      });
      
      // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
      if (closeForgotModal) {
        closeForgotModal.addEventListener('click', function() {
          forgotPasswordModal.classList.add('hidden');
        });
      }
      
      // معالجة نموذج استعادة كلمة المرور
      if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(event) {
          event.preventDefault();
          
          const email = utils.$('#recovery-email').value.trim();
          utils.$('#recovery-email-error').textContent = '';
          
          if (!utils.isValidEmail(email)) {
            utils.$('#recovery-email-error').textContent = 'يرجى إدخال بريد إلكتروني صالح';
            return;
          }
          
          try {
            // هنا يمكن إضافة وظيفة استعادة كلمة المرور الفعلية
            // في هذا المثال، نعرض فقط إشعاراً بالنجاح
            
            utils.showNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
            forgotPasswordModal.classList.add('hidden');
          } catch (error) {
            utils.$('#recovery-email-error').textContent = error.message || 'حدث خطأ أثناء إرسال رابط الاستعادة';
          }
        });
      }
    }
  }
  
  /**
   * إعداد وظيفة الشروط والأحكام
   */
  function setupTermsModal() {
    const termsLink = utils.$('#terms-link');
    const termsModal = utils.$('#terms-modal');
    const closeTermsModal = utils.$('#close-terms-modal');
    const acceptTerms = utils.$('#accept-terms');
    
    if (termsLink && termsModal) {
      // فتح النافذة المنبثقة عند النقر على الرابط
      termsLink.addEventListener('click', function(event) {
        event.preventDefault();
        termsModal.classList.remove('hidden');
      });
      
      // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
      if (closeTermsModal) {
        closeTermsModal.addEventListener('click', function() {
          termsModal.classList.add('hidden');
        });
      }
      
      // تحديد خانة الاختيار عند النقر على زر الموافقة
      if (acceptTerms) {
        acceptTerms.addEventListener('click', function() {
          const termsCheckbox = utils.$('#terms-agreement');
          if (termsCheckbox) {
            termsCheckbox.checked = true;
            utils.$('#terms-error').textContent = '';
          }
          termsModal.classList.add('hidden');
        });
      }
    }
  }
  
  // تصدير الوظائف العامة
  return {
    init,
    checkAuthState,
    updateUIForAuthState
  };
})();

// تهيئة وظائف المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  auth.init();
});

// تصدير كائن المصادقة للاستخدام في الملفات الأخرى
window.auth = auth;
