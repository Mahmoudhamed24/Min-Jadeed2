/**
 * ui.js - ملف واجهة المستخدم لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة واجهة المستخدم المشتركة بين جميع صفحات المنصة
 * مثل القائمة الجانبية والإشعارات والنوافذ المنبثقة وغيرها
 */

// كائن واجهة المستخدم الرئيسي
const ui = (function() {
  // عناصر DOM المشتركة
  let sidebar, sidebarToggle, categoryBtn, categoriesDropdown;
  
  /**
   * تهيئة وظائف واجهة المستخدم
   */
  function init() {
    // البحث عن عناصر DOM المشتركة
    sidebar = utils.$('#sidebar');
    sidebarToggle = utils.$('#sidebar-toggle');
    categoryBtn = utils.$('#category-btn');
    categoriesDropdown = utils.$('#categories-dropdown');
    
    // إضافة معالجات الأحداث
    setupSidebar();
    setupCategoryFilter();
    setupModals();
    setupRatingStars();
    setupScrollEffects();
    
    // تهيئة الإشعارات
    setupNotifications();
  }
  
  /**
   * إعداد وظائف القائمة الجانبية
   */
  function setupSidebar() {
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
      });
      
      // إغلاق القائمة الجانبية عند النقر خارجها
      document.addEventListener('click', function(event) {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target)) {
          sidebar.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * إعداد وظائف تصفية الفئات
   */
  function setupCategoryFilter() {
    if (categoryBtn && categoriesDropdown) {
      // فتح/إغلاق قائمة الفئات عند النقر على الزر
      categoryBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        categoriesDropdown.classList.toggle('active');
      });
      
      // إغلاق قائمة الفئات عند النقر خارجها
      document.addEventListener('click', function(event) {
        if (categoriesDropdown.classList.contains('active') && 
            !categoriesDropdown.contains(event.target) && 
            !categoryBtn.contains(event.target)) {
          categoriesDropdown.classList.remove('active');
        }
      });
      
      // معالجة زر تطبيق التصفية
      const applyFilterBtn = utils.$('#apply-filter');
      if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
          // جمع الفئات المحددة
          const selectedCategories = [];
          utils.$$('.category-checkbox:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
          });
          
          // تحديث عدد الفئات المحددة في الزر
          const selectedCategoriesCount = utils.$('#selected-categories-count');
          if (selectedCategoriesCount) {
            if (selectedCategories.length > 0) {
              selectedCategoriesCount.textContent = `${selectedCategories.length} فئات محددة`;
            } else {
              selectedCategoriesCount.textContent = 'جميع الفئات';
            }
          }
          
          // إغلاق قائمة الفئات
          categoriesDropdown.classList.remove('active');
          
          // تحديث قائمة الاقتباسات بناءً على الفئات المحددة
          if (typeof quotes !== 'undefined' && quotes.filterByCategories) {
            quotes.filterByCategories(selectedCategories);
          }
        });
      }
    }
  }
  
  /**
   * إعداد وظائف النوافذ المنبثقة
   */
  function setupModals() {
    // الحصول على جميع النوافذ المنبثقة
    const modals = utils.$$('.overlay');
    
    // إضافة معالجات الأحداث لأزرار الإغلاق
    utils.$$('.modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        const modal = this.closest('.overlay');
        if (modal) {
          modal.classList.add('hidden');
        }
      });
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    modals.forEach(modal => {
      modal.addEventListener('click', function(event) {
        if (event.target === this) {
          this.classList.add('hidden');
        }
      });
    });
    
    // إضافة معالجات الأحداث لأزرار فتح النوافذ المنبثقة
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(event) {
        event.preventDefault();
        const modalId = this.getAttribute('data-modal');
        const modal = utils.$(`#${modalId}`);
        if (modal) {
          modal.classList.remove('hidden');
        }
      });
    });
  }
  
  /**
   * إعداد وظائف نجوم التقييم
   */
  function setupRatingStars() {
    // الحصول على جميع مجموعات النجوم التفاعلية
    const ratingStarsContainers = utils.$$('.rating-stars.interactive');
    
    ratingStarsContainers.forEach(container => {
      const stars = container.querySelectorAll('.rating-star');
      
      // إضافة معالجات أحداث التحويم
      stars.forEach(star => {
        // عند التحويم فوق النجمة
        star.addEventListener('mouseenter', function() {
          const value = parseInt(this.getAttribute('data-value'));
          highlightStars(stars, value);
        });
        
        // عند النقر على النجمة
        star.addEventListener('click', async function() {
          const value = parseInt(this.getAttribute('data-value'));
          
          // التحقق من تسجيل الدخول
          if (!api.isLoggedIn()) {
            utils.showNotification('يجب تسجيل الدخول لتقييم الاقتباسات', 'warning');
            return;
          }
          
          try {
            // الحصول على معرف الاقتباس
            const quoteId = this.closest('[data-quote-id]')?.getAttribute('data-quote-id');
            if (!quoteId) return;
            
            // إرسال التقييم إلى الخادم
            const response = await api.rateQuote(quoteId, value);
            
            // تحديث متوسط التقييم في واجهة المستخدم
            const ratingValue = this.closest('.rating')?.querySelector('.rating-value');
            const ratingCount = this.closest('.rating')?.querySelector('.rating-count');
            
            if (ratingValue) {
              ratingValue.textContent = response.avgRating.toFixed(1);
            }
            
            if (ratingCount) {
              ratingCount.textContent = `(${response.ratingsCount} تقييم)`;
            }
            
            // إظهار إشعار نجاح
            utils.showNotification('تم حفظ تقييمك بنجاح', 'success');
          } catch (error) {
            utils.showNotification('حدث خطأ أثناء حفظ التقييم', 'error');
          }
        });
      });
      
      // إعادة تعيين النجوم عند مغادرة المؤشر
      container.addEventListener('mouseleave', function() {
        // الحصول على التقييم الحالي
        const ratingValue = this.closest('.rating')?.querySelector('.rating-value');
        const currentRating = ratingValue ? parseFloat(ratingValue.textContent) : 0;
        
        // إعادة تعيين النجوم بناءً على التقييم الحالي
        highlightStars(stars, currentRating);
      });
    });
  }
  
  /**
   * تمييز النجوم حتى قيمة معينة
   * @param {NodeList} stars - قائمة عناصر النجوم
   * @param {number} value - القيمة المراد تمييزها
   */
  function highlightStars(stars, value) {
    stars.forEach(star => {
      const starValue = parseInt(star.getAttribute('data-value'));
      if (starValue <= value) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }
  
  /**
   * إعداد وظائف تأثيرات التمرير
   */
  function setupScrollEffects() {
    // تأثير ظهور العناصر عند التمرير
    const fadeElements = utils.$$('.fade-on-scroll');
    
    if (fadeElements.length > 0) {
      // إنشاء مراقب التقاطع
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // مراقبة العناصر
      fadeElements.forEach(element => {
        observer.observe(element);
      });
    }
    
    // تأثير تثبيت الرأس عند التمرير
    const header = utils.$('.header');
    if (header) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      });
    }
  }
  
  /**
   * إعداد وظائف الإشعارات
   */
  function setupNotifications() {
    // إنشاء حاوية الإشعارات إذا لم تكن موجودة
    let container = utils.$('#notification-container');
    if (!container) {
      container = utils.createElement('div', {
        attributes: { id: 'notification-container' },
        classes: 'notification-container'
      });
      document.body.appendChild(container);
    }
  }
  
  /**
   * إظهار نافذة منبثقة لتفاصيل الاقتباس
   * @param {Object} quote - بيانات الاقتباس
   */
  async function showQuoteDetails(quote) {
    // الحصول على النافذة المنبثقة
    const modal = utils.$('#quote-detail-modal');
    const contentContainer = modal.querySelector('.quote-detail-content');
    
    if (!modal || !contentContainer) return;
    
    try {
      // إظهار مؤشر التحميل
      contentContainer.innerHTML = '<div class="text-center p-lg"><div class="loading loading-lg"></div><p class="mt-sm">جاري تحميل التفاصيل...</p></div>';
      modal.classList.remove('hidden');
      
      // الحصول على تفاصيل الاقتباس والتعليقات
      const quoteDetails = await api.getQuote(quote.id);
      const commentsResponse = await api.getComments(quote.id);
      
      // إنشاء محتوى تفاصيل الاقتباس
      const detailsHTML = `
        <div class="quote-detail-header mb-md">
          <div class="flex items-center gap-md">
            <img src="${quoteDetails.authorAvatar || '../img/placeholders/avatar.jpg'}" alt="صورة المؤلف" class="avatar-sm">
            <div>
              <h3>${quoteDetails.authorName}</h3>
              <div class="category-badge">${quoteDetails.category}</div>
            </div>
          </div>
          ${api.getCurrentUser()?.email === quoteDetails.authorEmail ? `
            <div class="quote-actions">
              <button class="btn btn-sm btn-outline edit-quote-btn" data-quote-id="${quoteDetails.id}">
                <i class="fas fa-edit"></i> تعديل
              </button>
              <button class="btn btn-sm btn-accent delete-quote-btn" data-quote-id="${quoteDetails.id}">
                <i class="fas fa-trash"></i> حذف
              </button>
            </div>
          ` : ''}
        </div>
        
        <h1 class="mb-md">${quoteDetails.title}</h1>
        
        <div class="quote-detail-content mb-lg">
          <p class="mb-md">${utils.linkifyText(quoteDetails.text)}</p>
        </div>
        
        <div class="quote-detail-footer">
          <div class="rating-container">
            <h4 class="mb-sm">التقييم</h4>
            <div class="rating">
              <div class="rating-stars interactive" data-quote-id="${quoteDetails.id}">
                <i class="fas fa-star rating-star" data-value="1"></i>
                <i class="fas fa-star rating-star" data-value="2"></i>
                <i class="fas fa-star rating-star" data-value="3"></i>
                <i class="fas fa-star rating-star" data-value="4"></i>
                <i class="fas fa-star rating-star" data-value="5"></i>
              </div>
              <span class="rating-value">${quoteDetails.avgRating.toFixed(1)}</span>
              <span class="rating-count">(${quoteDetails.ratingsCount} تقييم)</span>
            </div>
          </div>
          <div class="quote-meta">
            <span class="text-medium">تاريخ النشر: ${utils.formatDate(quoteDetails.createdAt)}</span>
          </div>
        </div>
      `;
      
      // تحديث محتوى النافذة المنبثقة
      contentContainer.innerHTML = detailsHTML;
      
      // تحديث قائمة التعليقات
      updateCommentsList(commentsResponse.comments);
      
      // إعداد وظائف التقييم
      setupRatingStars();
      
      // إعداد وظائف تعديل وحذف الاقتباس
      setupQuoteActions();
    } catch (error) {
      contentContainer.innerHTML = `<div class="text-center p-lg"><p class="text-error">حدث خطأ أثناء تحميل التفاصيل</p></div>`;
      utils.showNotification('حدث خطأ أثناء تحميل تفاصيل الاقتباس', 'error');
    }
  }
  
  /**
   * تحديث قائمة التعليقات
   * @param {Array} comments - قائمة التعليقات
   */
  function updateCommentsList(comments) {
    const commentsContainer = utils.$('#comments-container');
    const noCommentsMessage = utils.$('#no-comments-message');
    
    if (!commentsContainer) return;
    
    // إفراغ حاوية التعليقات
    commentsContainer.innerHTML = '';
    
    // إظهار/إخفاء رسالة عدم وجود تعليقات
    if (comments.length === 0) {
      if (noCommentsMessage) noCommentsMessage.classList.remove('hidden');
      return;
    } else {
      if (noCommentsMessage) noCommentsMessage.classList.add('hidden');
    }
    
    // إضافة التعليقات إلى الحاوية
    comments.forEach(comment => {
      const commentElement = utils.createElement('div', {
        classes: 'comment',
        html: `
          <img src="${comment.userAvatar || '../img/placeholders/avatar.jpg'}" alt="صورة المعلق" class="comment-avatar">
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${comment.userName}</span>
              <span class="comment-date">${utils.timeAgo(comment.createdAt)}</span>
            </div>
            <p class="comment-text">${utils.linkifyText(comment.text)}</p>
          </div>
        `
      });
      
      commentsContainer.appendChild(commentElement);
    });
  }
  
  /**
   * إعداد وظائف تعديل وحذف الاقتباس
   */
  function setupQuoteActions() {
    // زر تعديل الاقتباس
    const editButtons = utils.$$('.edit-quote-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const quoteId = this.getAttribute('data-quote-id');
        if (quoteId) {
          // هنا يمكن إضافة وظيفة فتح نافذة تعديل الاقتباس
          const editModal = utils.$('#edit-quote-modal');
          if (editModal) {
            // تعبئة بيانات الاقتباس في النموذج
            // ...
            
            editModal.classList.remove('hidden');
          }
        }
      });
    });
    
    // زر حذف الاقتباس
    const deleteButtons = utils.$$('.delete-quote-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const quoteId = this.getAttribute('data-quote-id');
        if (quoteId) {
          // تأكيد الحذف
          const confirmed = await utils.confirmAction('هل أنت متأكد من رغبتك في حذف هذا الاقتباس؟');
          
          if (confirmed) {
            try {
              // حذف الاقتباس
              await api.deleteQuote(quoteId);
              
              // إغلاق النافذة المنبثقة
              utils.$('#quote-detail-modal').classList.add('hidden');
              
              // إظهار إشعار نجاح
              utils.showNotification('تم حذف الاقتباس بنجاح', 'success');
              
              // تحديث قائمة الاقتباسات
              if (typeof quotes !== 'undefined' && quotes.loadQuotes) {
                quotes.loadQuotes();
              }
            } catch (error) {
              utils.showNotification('حدث خطأ أثناء حذف الاقتباس', 'error');
            }
          }
        }
      });
    });
  }
  
  /**
   * تحويل الروابط في النص إلى روابط قابلة للنقر
   * @param {string} text - النص المراد تحويله
   * @returns {string} - النص مع روابط قابلة للنقر
   */
  function linkifyText(text) {
    return utils.linkifyText(text);
  }
  
  // تصدير الوظائف العامة
  return {
    init,
    showQuoteDetails,
    updateCommentsList,
    linkifyText
  };
})();

// تهيئة وظائف واجهة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  ui.init();
});

// تصدير كائن واجهة المستخدم للاستخدام في الملفات الأخرى
window.ui = ui;
