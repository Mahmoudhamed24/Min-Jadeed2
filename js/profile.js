/**
 * profile.js - ملف إدارة الملف الشخصي لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة الملف الشخصي للمستخدم
 * مثل عرض وتحديث بيانات المستخدم وعرض اقتباساته وإحصائياته
 */

// كائن إدارة الملف الشخصي الرئيسي
const profile = (function() {
  // متغيرات عامة
  let profileContainer, userQuotesContainer, quoteTemplate;
  let currentUser = null;
  
  /**
   * تهيئة وظائف إدارة الملف الشخصي
   */
  function init() {
    // التحقق مما إذا كنا في صفحة الملف الشخصي
    const isProfilePage = window.location.pathname.includes('profile.html');
    if (!isProfilePage) return;
    
    // البحث عن عناصر DOM المطلوبة
    profileContainer = utils.$('#profile-container');
    userQuotesContainer = utils.$('#user-quotes-container');
    quoteTemplate = utils.$('#user-quote-template');
    
    // التحقق من تسجيل الدخول
    currentUser = api.getCurrentUser();
    if (!currentUser) {
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      window.location.href = 'login.html';
      return;
    }
    
    // تحميل بيانات الملف الشخصي
    loadProfileData();
    
    // إعداد معالجات الأحداث
    setupEventListeners();
  }
  
  /**
   * إعداد معالجات الأحداث
   */
  function setupEventListeners() {
    // نموذج تحديث الملف الشخصي
    const updateProfileForm = utils.$('#update-profile-form');
    if (updateProfileForm) {
      updateProfileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // نموذج تغيير كلمة المرور
    const changePasswordForm = utils.$('#change-password-form');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // زر تحميل صورة الملف الشخصي
    const uploadAvatarBtn = utils.$('#upload-avatar-btn');
    const avatarInput = utils.$('#avatar-input');
    if (uploadAvatarBtn && avatarInput) {
      uploadAvatarBtn.addEventListener('click', function() {
        avatarInput.click();
      });
      
      avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // علامات تبويب الملف الشخصي
    const profileTabs = utils.$$('.profile-tab');
    const profileTabContents = utils.$$('.profile-tab-content');
    
    profileTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // تحديث التبويب النشط
        profileTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // تحديث المحتوى النشط
        const tabId = this.getAttribute('data-tab');
        profileTabContents.forEach(content => {
          if (content.getAttribute('id') === tabId) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      });
    });
  }
  
  /**
   * تحميل بيانات الملف الشخصي
   */
  async function loadProfileData() {
    try {
      // إظهار مؤشر التحميل
      if (profileContainer) {
        profileContainer.innerHTML = '<div class="text-center p-lg"><div class="loading loading-lg"></div><p class="mt-sm">جاري تحميل بيانات الملف الشخصي...</p></div>';
      }
      
      // جلب بيانات المستخدم المحدثة من الخادم
      const userResponse = await api.getUser(currentUser.email);
      currentUser = userResponse.user;
      
      // تحديث بيانات المستخدم في التخزين المحلي
      utils.saveToLocalStorage('min_jadeed_user', currentUser);
      
      // تحديث واجهة المستخدم
      updateProfileUI(currentUser);
      
      // تحميل اقتباسات المستخدم
      loadUserQuotes(currentUser.email);
      
      // تحميل إحصائيات المستخدم
      loadUserStats(currentUser.email);
    } catch (error) {
      console.error('خطأ في تحميل بيانات الملف الشخصي:', error);
      utils.showNotification('حدث خطأ أثناء تحميل بيانات الملف الشخصي', 'error');
    }
  }
  
  /**
   * تحديث واجهة المستخدم للملف الشخصي
   * @param {Object} user - بيانات المستخدم
   */
  function updateProfileUI(user) {
    if (!profileContainer) return;
    
    // تحديث صورة الملف الشخصي
    const profileAvatar = utils.$('#profile-avatar');
    if (profileAvatar) {
      profileAvatar.src = user.avatar || '../img/placeholders/avatar.jpg';
    }
    
    // تحديث اسم المستخدم
    const profileUsername = utils.$('#profile-username');
    if (profileUsername) {
      profileUsername.textContent = user.username;
    }
    
    // تحديث الاسم الكامل
    const profileFullName = utils.$('#profile-fullname');
    if (profileFullName) {
      profileFullName.textContent = user.fullName;
    }
    
    // تحديث البريد الإلكتروني
    const profileEmail = utils.$('#profile-email');
    if (profileEmail) {
      profileEmail.textContent = user.email;
    }
    
    // تحديث تاريخ الانضمام
    const profileJoinDate = utils.$('#profile-join-date');
    if (profileJoinDate) {
      profileJoinDate.textContent = utils.formatDate(user.createdAt);
    }
    
    // تحديث الفئات المفضلة
    const profileCategories = utils.$('#profile-categories');
    if (profileCategories) {
      const categories = user.favoriteCategories ? user.favoriteCategories.split(',') : [];
      if (categories.length > 0) {
        profileCategories.innerHTML = categories.map(category => `<span class="category-badge">${category}</span>`).join('');
      } else {
        profileCategories.innerHTML = '<p class="text-medium">لم يتم تحديد فئات مفضلة</p>';
      }
    }
    
    // تحديث حقول نموذج تحديث الملف الشخصي
    const fullNameInput = utils.$('#fullname');
    const usernameInput = utils.$('#username');
    const bioInput = utils.$('#bio');
    
    if (fullNameInput) fullNameInput.value = user.fullName || '';
    if (usernameInput) usernameInput.value = user.username || '';
    if (bioInput) bioInput.value = user.bio || '';
    
    // تحديث خانات اختيار الفئات المفضلة
    const categoryCheckboxes = utils.$$('.favorite-category');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = categories.includes(checkbox.value);
    });
  }
  
  /**
   * تحميل اقتباسات المستخدم
   * @param {string} email - البريد الإلكتروني للمستخدم
   */
  async function loadUserQuotes(email) {
    try {
      // التحقق من وجود حاوية الاقتباسات
      if (!userQuotesContainer || !quoteTemplate) return;
      
      // إظهار مؤشر التحميل
      userQuotesContainer.innerHTML = '<div class="text-center p-lg"><div class="loading"></div><p class="mt-sm">جاري تحميل الاقتباسات...</p></div>';
      
      // جلب اقتباسات المستخدم من الخادم
      const response = await api.getUserQuotes(email);
      
      // التحقق من وجود اقتباسات
      if (!response.quotes || response.quotes.length === 0) {
        userQuotesContainer.innerHTML = '<div class="text-center p-lg"><p>لم تقم بنشر أي اقتباسات بعد</p><a href="new-post.html" class="btn btn-primary mt-md">إضافة اقتباس جديد</a></div>';
        return;
      }
      
      // إفراغ حاوية الاقتباسات
      userQuotesContainer.innerHTML = '';
      
      // إضافة الاقتباسات إلى الحاوية
      response.quotes.forEach(quote => {
        appendQuoteToList(quote);
      });
      
      // تحديث عدد الاقتباسات
      const quotesCount = utils.$('#quotes-count');
      if (quotesCount) {
        quotesCount.textContent = response.quotes.length;
      }
    } catch (error) {
      console.error('خطأ في تحميل اقتباسات المستخدم:', error);
      userQuotesContainer.innerHTML = '<div class="text-center p-lg"><p class="text-error">حدث خطأ أثناء تحميل الاقتباسات</p></div>';
    }
  }
  
  /**
   * إضافة اقتباس إلى قائمة اقتباسات المستخدم
   * @param {Object} quote - بيانات الاقتباس
   */
  function appendQuoteToList(quote) {
    // التحقق من وجود القالب وحاوية الاقتباسات
    if (!quoteTemplate || !userQuotesContainer) return;
    
    // إنشاء نسخة من قالب الاقتباس
    const quoteElement = quoteTemplate.cloneNode(true);
    quoteElement.removeAttribute('id');
    quoteElement.style.display = '';
    quoteElement.setAttribute('data-quote-id', quote.id);
    
    // تعبئة بيانات الاقتباس
    quoteElement.querySelector('.user-quote-title').textContent = quote.title;
    quoteElement.querySelector('.category-badge').textContent = quote.category;
    quoteElement.querySelector('.user-quote-text').innerHTML = utils.linkifyText(utils.truncateText(quote.text, 150));
    quoteElement.querySelector('.rating-value').textContent = quote.avgRating.toFixed(1);
    quoteElement.querySelector('.user-quote-date').textContent = utils.formatDate(quote.createdAt);
    
    // تحديث نجوم التقييم
    const stars = quoteElement.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      if (index < Math.floor(quote.avgRating)) {
        star.classList.add('filled');
      }
    });
    
    // إضافة معالجات الأحداث لأزرار التعديل والحذف
    const editBtn = quoteElement.querySelector('.edit-quote');
    const deleteBtn = quoteElement.querySelector('.delete-quote');
    
    if (editBtn) {
      editBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        editQuote(quote.id);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        deleteQuote(quote.id);
      });
    }
    
    // إضافة معالج النقر لفتح تفاصيل الاقتباس
    quoteElement.addEventListener('click', function() {
      window.location.href = `quote-detail.html?id=${quote.id}`;
    });
    
    // إضافة الاقتباس إلى الحاوية
    userQuotesContainer.appendChild(quoteElement);
  }
  
  /**
   * تحميل إحصائيات المستخدم
   * @param {string} email - البريد الإلكتروني للمستخدم
   */
  async function loadUserStats(email) {
    try {
      // جلب إحصائيات المستخدم من الخادم
      // هذه الوظيفة ستحتاج إلى إضافتها إلى واجهة برمجة التطبيق
      // في هذا المثال، نستخدم بيانات وهمية
      
      const stats = {
        totalQuotes: 0,
        totalRatings: 0,
        totalComments: 0,
        avgRating: 0,
        topCategories: []
      };
      
      // تحديث إحصائيات المستخدم في واجهة المستخدم
      updateUserStats(stats);
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات المستخدم:', error);
    }
  }
  
  /**
   * تحديث إحصائيات المستخدم في واجهة المستخدم
   * @param {Object} stats - إحصائيات المستخدم
   */
  function updateUserStats(stats) {
    // تحديث عدد الاقتباسات
    const quotesCount = utils.$('#stats-quotes-count');
    if (quotesCount) {
      quotesCount.textContent = stats.totalQuotes;
    }
    
    // تحديث عدد التقييمات
    const ratingsCount = utils.$('#stats-ratings-count');
    if (ratingsCount) {
      ratingsCount.textContent = stats.totalRatings;
    }
    
    // تحديث عدد التعليقات
    const commentsCount = utils.$('#stats-comments-count');
    if (commentsCount) {
      commentsCount.textContent = stats.totalComments;
    }
    
    // تحديث متوسط التقييم
    const avgRating = utils.$('#stats-avg-rating');
    if (avgRating) {
      avgRating.textContent = stats.avgRating.toFixed(1);
    }
    
    // تحديث الفئات الأكثر استخداماً
    const topCategories = utils.$('#stats-top-categories');
    if (topCategories) {
      if (stats.topCategories.length > 0) {
        topCategories.innerHTML = stats.topCategories.map(category => `<span class="category-badge">${category}</span>`).join('');
      } else {
        topCategories.innerHTML = '<p class="text-medium">لا توجد بيانات كافية</p>';
      }
    }
  }
  
  /**
   * معالجة تحديث الملف الشخصي
   * @param {Event} event - حدث النموذج
   */
  async function handleProfileUpdate(event) {
    event.preventDefault();
    
    // جمع بيانات النموذج
    const fullName = utils.$('#fullname').value.trim();
    const username = utils.$('#username').value.trim();
    const bio = utils.$('#bio').value.trim();
    
    // جمع الفئات المفضلة
    const favoriteCategories = [];
    utils.$$('.favorite-category:checked').forEach(checkbox => {
      favoriteCategories.push(checkbox.value);
    });
    
    // إعادة تعيين رسائل الخطأ
    utils.$('#fullname-error').textContent = '';
    utils.$('#username-error').textContent = '';
    utils.$('#profile-update-error').textContent = '';
    
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
    
    if (!isValid) return;
    
    try {
      // إظهار مؤشر التحميل
      const submitBtn = utils.$('#update-profile-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading"></div>';
      
      // إعداد بيانات المستخدم
      const userData = {
        fullName,
        username,
        bio,
        favoriteCategories: favoriteCategories.join(',')
      };
      
      // تحديث بيانات المستخدم
      const response = await api.updateUser(userData);
      
      // تحديث بيانات المستخدم الحالي
      currentUser = response.user;
      
      // إظهار إشعار نجاح
      utils.showNotification('تم تحديث الملف الشخصي بنجاح!', 'success');
      
      // إعادة تحميل بيانات الملف الشخصي
      loadProfileData();
    } catch (error) {
      // إظهار رسالة الخطأ
      utils.$('#profile-update-error').textContent = error.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
    } finally {
      // إعادة تمكين زر التحديث
      const submitBtn = utils.$('#update-profile-btn');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  /**
   * معالجة تغيير كلمة المرور
   * @param {Event} event - حدث النموذج
   */
  async function handlePasswordChange(event) {
    event.preventDefault();
    
    // جمع بيانات النموذج
    const currentPassword = utils.$('#current-password').value;
    const newPassword = utils.$('#new-password').value;
    const confirmPassword = utils.$('#confirm-password').value;
    
    // إعادة تعيين رسائل الخطأ
    utils.$('#current-password-error').textContent = '';
    utils.$('#new-password-error').textContent = '';
    utils.$('#confirm-password-error').textContent = '';
    utils.$('#password-change-error').textContent = '';
    
    // التحقق من صحة البيانات
    let isValid = true;
    
    if (!currentPassword) {
      utils.$('#current-password-error').textContent = 'يرجى إدخال كلمة المرور الحالية';
      isValid = false;
    }
    
    if (!utils.isValidPassword(newPassword)) {
      utils.$('#new-password-error').textContent = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';
      isValid = false;
    }
    
    if (newPassword !== confirmPassword) {
      utils.$('#confirm-password-error').textContent = 'كلمات المرور غير متطابقة';
      isValid = false;
    }
    
    if (!isValid) return;
    
    try {
      // إظهار مؤشر التحميل
      const submitBtn = utils.$('#change-password-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading"></div>';
      
      // إعداد بيانات تغيير كلمة المرور
      const passwordData = {
        currentPassword,
        newPassword
      };
      
      // تغيير كلمة المرور
      // هذه الوظيفة ستحتاج إلى إضافتها إلى واجهة برمجة التطبيق
      // في هذا المثال، نفترض نجاح العملية
      
      // إظهار إشعار نجاح
      utils.showNotification('تم تغيير كلمة المرور بنجاح!', 'success');
      
      // إفراغ حقول النموذج
      utils.$('#current-password').value = '';
      utils.$('#new-password').value = '';
      utils.$('#confirm-password').value = '';
    } catch (error) {
      // إظهار رسالة الخطأ
      utils.$('#password-change-error').textContent = error.message || 'حدث خطأ أثناء تغيير كلمة المرور';
    } finally {
      // إعادة تمكين زر التغيير
      const submitBtn = utils.$('#change-password-btn');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  /**
   * معالجة تحميل صورة الملف الشخصي
   * @param {Event} event - حدث تغيير الملف
   */
  async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      utils.showNotification('يرجى اختيار صورة بتنسيق JPEG أو PNG أو GIF', 'error');
      return;
    }
    
    // التحقق من حجم الملف (الحد الأقصى: 2 ميجابايت)
    const maxSize = 2 * 1024 * 1024; // 2 ميجابايت
    if (file.size > maxSize) {
      utils.showNotification('يجب أن يكون حجم الصورة أقل من 2 ميجابايت', 'error');
      return;
    }
    
    try {
      // إظهار مؤشر التحميل
      const avatarPreview = utils.$('#profile-avatar');
      if (avatarPreview) {
        avatarPreview.src = '../img/loading.gif';
      }
      
      // قراءة الملف كـ Data URL
      const reader = new FileReader();
      reader.onload = async function(e) {
        const dataUrl = e.target.result;
        
        // تحديث صورة الملف الشخصي
        // هذه الوظيفة ستحتاج إلى إضافتها إلى واجهة برمجة التطبيق
        // في هذا المثال، نفترض نجاح العملية ونحدث الصورة محلياً فقط
        
        if (avatarPreview) {
          avatarPreview.src = dataUrl;
        }
        
        // إظهار إشعار نجاح
        utils.showNotification('تم تحديث صورة الملف الشخصي بنجاح!', 'success');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      utils.showNotification('حدث خطأ أثناء تحميل الصورة', 'error');
      
      // إعادة الصورة الأصلية
      const avatarPreview = utils.$('#profile-avatar');
      if (avatarPreview) {
        avatarPreview.src = currentUser.avatar || '../img/placeholders/avatar.jpg';
      }
    }
  }
  
  /**
   * تعديل اقتباس محدد
   * @param {string} quoteId - معرف الاقتباس
   */
  async function editQuote(quoteId) {
    // استخدام وظيفة تعديل الاقتباس من كائن quotes
    if (typeof quotes !== 'undefined' && quotes.editQuote) {
      quotes.editQuote(quoteId);
    } else {
      // تنفيذ وظيفة التعديل هنا إذا لم يكن كائن quotes متاحاً
      try {
        // جلب تفاصيل الاقتباس من الخادم
        const quoteDetails = await api.getQuote(quoteId);
        
        // فتح نافذة التعديل
        const editModal = utils.$('#edit-quote-modal');
        if (!editModal) return;
        
        // تعبئة بيانات الاقتباس في النموذج
        utils.$('#edit-quote-title').value = quoteDetails.title;
        utils.$('#edit-quote-category').value = quoteDetails.category;
        utils.$('#edit-quote-text').value = quoteDetails.text;
        
        // إضافة معرف الاقتباس إلى النموذج
        const editForm = utils.$('#edit-quote-form');
        if (editForm) {
          editForm.setAttribute('data-quote-id', quoteId);
          
          // إضافة معالج الحدث للنموذج
          editForm.onsubmit = async function(event) {
            event.preventDefault();
            
            // جمع البيانات المحدثة
            const updatedQuote = {
              title: utils.$('#edit-quote-title').value.trim(),
              category: utils.$('#edit-quote-category').value,
              text: utils.$('#edit-quote-text').value.trim()
            };
            
            try {
              // تحديث الاقتباس
              await api.updateQuote(quoteId, updatedQuote);
              
              // إغلاق النافذة المنبثقة
              editModal.classList.add('hidden');
              
              // إظهار إشعار نجاح
              utils.showNotification('تم تحديث الاقتباس بنجاح', 'success');
              
              // إعادة تحميل اقتباسات المستخدم
              loadUserQuotes(currentUser.email);
            } catch (error) {
              utils.showNotification('حدث خطأ أثناء تحديث الاقتباس', 'error');
            }
          };
        }
        
        // إظهار النافذة المنبثقة
        editModal.classList.remove('hidden');
      } catch (error) {
        console.error('خطأ في تعديل الاقتباس:', error);
        utils.showNotification('حدث خطأ أثناء تحميل بيانات الاقتباس', 'error');
      }
    }
  }
  
  /**
   * حذف اقتباس محدد
   * @param {string} quoteId - معرف الاقتباس
   */
  async function deleteQuote(quoteId) {
    // استخدام وظيفة حذف الاقتباس من كائن quotes
    if (typeof quotes !== 'undefined' && quotes.deleteQuote) {
      await quotes.deleteQuote(quoteId);
      // إعادة تحميل اقتباسات المستخدم
      loadUserQuotes(currentUser.email);
    } else {
      // تنفيذ وظيفة الحذف هنا إذا لم يكن كائن quotes متاحاً
      try {
        // تأكيد الحذف
        const confirmed = await utils.confirmAction('هل أنت متأكد من رغبتك في حذف هذا الاقتباس؟');
        
        if (confirmed) {
          // حذف الاقتباس
          await api.deleteQuote(quoteId);
          
          // إظهار إشعار نجاح
          utils.showNotification('تم حذف الاقتباس بنجاح', 'success');
          
          // إعادة تحميل اقتباسات المستخدم
          loadUserQuotes(currentUser.email);
        }
      } catch (error) {
        console.error('خطأ في حذف الاقتباس:', error);
        utils.showNotification('حدث خطأ أثناء حذف الاقتباس', 'error');
      }
    }
  }
  
  // تصدير الوظائف العامة
  return {
    init,
    loadProfileData,
    loadUserQuotes,
    editQuote,
    deleteQuote
  };
})();

// تهيئة وظائف إدارة الملف الشخصي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  profile.init();
});

// تصدير كائن إدارة الملف الشخصي للاستخدام في الملفات الأخرى
window.profile = profile;
