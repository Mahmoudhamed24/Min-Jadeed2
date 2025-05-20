/**
 * quotes.js - ملف إدارة الاقتباسات لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة الاقتباسات مثل عرض وإضافة وتعديل وحذف الاقتباسات
 * يتعامل مع عرض الاقتباسات في الصفحة الرئيسية وصفحة تفاصيل الاقتباس
 */

// كائن إدارة الاقتباسات الرئيسي
const quotes = (function() {
  // متغيرات عامة
  let quotesContainer, quoteTemplate, loadMoreBtn, loadingIndicator;
  let currentPage = 1;
  let currentSort = 'newest';
  let selectedCategories = [];
  let isLoading = false;
  let hasMoreQuotes = true;
  
  /**
   * تهيئة وظائف إدارة الاقتباسات
   */
  function init() {
    // البحث عن عناصر DOM المطلوبة
    quotesContainer = utils.$('#quotes-container');
    quoteTemplate = utils.$('#quote-template');
    loadMoreBtn = utils.$('#load-more');
    loadingIndicator = utils.$('#loading-indicator');
    
    // التحقق من وجود العناصر المطلوبة
    if (!quotesContainer || !quoteTemplate) {
      console.error('لم يتم العثور على عناصر DOM المطلوبة لعرض الاقتباسات');
      return;
    }
    
    // إضافة معالجات الأحداث
    setupEventListeners();
    
    // تحميل الاقتباسات الأولية
    loadQuotes();
    
    // إعداد وظائف صفحة إضافة اقتباس جديد
    setupNewPostPage();
    
    // إعداد وظائف صفحة تفاصيل الاقتباس
    setupQuoteDetailPage();
  }
  
  /**
   * إعداد معالجات الأحداث
   */
  function setupEventListeners() {
    // زر تحميل المزيد
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        if (!isLoading && hasMoreQuotes) {
          currentPage++;
          loadQuotes(false);
        }
      });
    }
    
    // علامات التبويب (الأحدث/الأعلى تقييماً)
    const tabs = utils.$$('#content-tabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // تحديث التبويب النشط
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // تحديث نوع الترتيب
        currentSort = this.getAttribute('data-tab');
        
        // إعادة تحميل الاقتباسات
        resetQuotesList();
        loadQuotes();
      });
    });
  }
  
  /**
   * تحميل الاقتباسات من الخادم
   * @param {boolean} resetList - ما إذا كان يجب إعادة تعيين القائمة
   */
  async function loadQuotes(resetList = true) {
    try {
      // التحقق من وجود حاوية الاقتباسات
      if (!quotesContainer) return;
      
      // إظهار مؤشر التحميل
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      isLoading = true;
      
      // إعادة تعيين القائمة إذا لزم الأمر
      if (resetList) {
        resetQuotesList();
      }
      
      // إعداد معلمات الاستعلام
      const params = {
        page: currentPage,
        limit: 10,
        sort_by: currentSort
      };
      
      // إضافة الفئات المحددة إذا وجدت
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }
      
      // جلب الاقتباسات من الخادم
      const response = await api.getQuotes(params);
      
      // التحقق من وجود اقتباسات
      if (!response.quotes || response.quotes.length === 0) {
        hasMoreQuotes = false;
        if (currentPage === 1) {
          quotesContainer.innerHTML = '<div class="text-center p-lg"><p>لا توجد اقتباسات متاحة</p></div>';
        }
        return;
      }
      
      // عرض الاقتباسات
      response.quotes.forEach(quote => {
        appendQuoteToList(quote);
      });
      
      // تحديث حالة "المزيد"
      hasMoreQuotes = response.hasMore;
      
      // تحديث زر تحميل المزيد
      if (loadMoreBtn) {
        loadMoreBtn.classList.toggle('hidden', !hasMoreQuotes);
      }
    } catch (error) {
      console.error('خطأ في تحميل الاقتباسات:', error);
      utils.showNotification('حدث خطأ أثناء تحميل الاقتباسات', 'error');
    } finally {
      // إخفاء مؤشر التحميل
      if (loadingIndicator) loadingIndicator.classList.add('hidden');
      isLoading = false;
    }
  }
  
  /**
   * إضافة اقتباس إلى قائمة الاقتباسات
   * @param {Object} quote - بيانات الاقتباس
   */
  function appendQuoteToList(quote) {
    // التحقق من وجود القالب وحاوية الاقتباسات
    if (!quoteTemplate || !quotesContainer) return;
    
    // إنشاء نسخة من قالب الاقتباس
    const quoteElement = quoteTemplate.cloneNode(true);
    quoteElement.removeAttribute('id');
    quoteElement.style.display = '';
    quoteElement.setAttribute('data-quote-id', quote.id);
    
    // تعبئة بيانات الاقتباس
    quoteElement.querySelector('.quote-card-avatar').src = quote.authorAvatar || '../img/placeholders/avatar.jpg';
    quoteElement.querySelector('.quote-card-avatar').alt = quote.authorName;
    quoteElement.querySelector('.quote-card-author').textContent = quote.authorName;
    quoteElement.querySelector('.category-badge').textContent = quote.category;
    quoteElement.querySelector('.quote-card-title').textContent = quote.title;
    quoteElement.querySelector('.quote-card-text').innerHTML = utils.linkifyText(utils.truncateText(quote.text, 150));
    quoteElement.querySelector('.rating-value').textContent = quote.avgRating.toFixed(1);
    
    // تحديث نجوم التقييم
    const stars = quoteElement.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      if (index < Math.floor(quote.avgRating)) {
        star.classList.add('filled');
      }
    });
    
    // إظهار أزرار التعديل والحذف للمؤلف فقط
    const currentUser = api.getCurrentUser();
    const editBtn = quoteElement.querySelector('.edit-quote');
    const deleteBtn = quoteElement.querySelector('.delete-quote');
    
    if (currentUser && currentUser.email === quote.authorEmail) {
      editBtn.classList.remove('hidden');
      deleteBtn.classList.remove('hidden');
      
      // إضافة معالجات الأحداث لأزرار التعديل والحذف
      editBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        editQuote(quote.id);
      });
      
      deleteBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        deleteQuote(quote.id);
      });
    }
    
    // إضافة معالج النقر لفتح تفاصيل الاقتباس
    quoteElement.addEventListener('click', function() {
      showQuoteDetails(quote.id);
    });
    
    // إضافة الاقتباس إلى الحاوية
    quotesContainer.appendChild(quoteElement);
  }
  
  /**
   * إعادة تعيين قائمة الاقتباسات
   */
  function resetQuotesList() {
    if (!quotesContainer) return;
    
    // إفراغ حاوية الاقتباسات (مع الاحتفاظ بالقالب)
    const template = quoteTemplate;
    quotesContainer.innerHTML = '';
    quotesContainer.appendChild(template);
    
    // إعادة تعيين متغيرات الحالة
    currentPage = 1;
    hasMoreQuotes = true;
  }
  
  /**
   * تصفية الاقتباسات حسب الفئات
   * @param {Array} categories - قائمة الفئات المحددة
   */
  function filterByCategories(categories) {
    selectedCategories = categories || [];
    resetQuotesList();
    loadQuotes();
  }
  
  /**
   * عرض تفاصيل اقتباس محدد
   * @param {string} quoteId - معرف الاقتباس
   */
  async function showQuoteDetails(quoteId) {
    try {
      // جلب تفاصيل الاقتباس من الخادم
      const quoteDetails = await api.getQuote(quoteId);
      
      // عرض تفاصيل الاقتباس في النافذة المنبثقة
      if (typeof ui !== 'undefined' && ui.showQuoteDetails) {
        ui.showQuoteDetails(quoteDetails);
      } else {
        // إذا كنا في صفحة تفاصيل الاقتباس، قم بتحديث المحتوى مباشرة
        updateQuoteDetailPage(quoteDetails);
      }
    } catch (error) {
      console.error('خطأ في عرض تفاصيل الاقتباس:', error);
      utils.showNotification('حدث خطأ أثناء تحميل تفاصيل الاقتباس', 'error');
    }
  }
  
  /**
   * تعديل اقتباس محدد
   * @param {string} quoteId - معرف الاقتباس
   */
  async function editQuote(quoteId) {
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
            
            // إعادة تحميل الاقتباسات
            resetQuotesList();
            loadQuotes();
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
  
  /**
   * حذف اقتباس محدد
   * @param {string} quoteId - معرف الاقتباس
   */
  async function deleteQuote(quoteId) {
    try {
      // تأكيد الحذف
      const confirmed = await utils.confirmAction('هل أنت متأكد من رغبتك في حذف هذا الاقتباس؟');
      
      if (confirmed) {
        // حذف الاقتباس
        await api.deleteQuote(quoteId);
        
        // إظهار إشعار نجاح
        utils.showNotification('تم حذف الاقتباس بنجاح', 'success');
        
        // إعادة تحميل الاقتباسات
        resetQuotesList();
        loadQuotes();
      }
    } catch (error) {
      console.error('خطأ في حذف الاقتباس:', error);
      utils.showNotification('حدث خطأ أثناء حذف الاقتباس', 'error');
    }
  }
  
  /**
   * إعداد وظائف صفحة إضافة اقتباس جديد
   */
  function setupNewPostPage() {
    const newPostForm = utils.$('#new-post-form');
    if (!newPostForm) return;
    
    // إعداد المعاينة المباشرة
    setupLivePreview();
    
    // إضافة معالج الحدث للنموذج
    newPostForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // جمع بيانات الاقتباس
      const quoteData = {
        title: utils.$('#post-title').value.trim(),
        category: utils.$('#post-category').value,
        text: utils.$('#post-text').value.trim()
      };
      
      // التحقق من صحة البيانات
      let isValid = true;
      
      if (!quoteData.title) {
        utils.$('#title-error').textContent = 'يرجى إدخال عنوان الاقتباس';
        isValid = false;
      } else {
        utils.$('#title-error').textContent = '';
      }
      
      if (!quoteData.category) {
        utils.$('#category-error').textContent = 'يرجى اختيار فئة';
        isValid = false;
      } else {
        utils.$('#category-error').textContent = '';
      }
      
      if (!quoteData.text) {
        utils.$('#text-error').textContent = 'يرجى إدخال نص الاقتباس';
        isValid = false;
      } else {
        utils.$('#text-error').textContent = '';
      }
      
      if (!isValid) return;
      
      try {
        // إظهار مؤشر التحميل
        const submitBtn = newPostForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading"></div>';
        
        // إرسال الاقتباس إلى الخادم
        const response = await api.createQuote(quoteData);
        
        // إظهار إشعار نجاح
        utils.showNotification('تم نشر الاقتباس بنجاح!', 'success');
        
        // إعادة توجيه المستخدم إلى الصفحة الرئيسية
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 1000);
      } catch (error) {
        // إظهار رسالة الخطأ
        utils.$('#post-error').textContent = error.message || 'حدث خطأ أثناء نشر الاقتباس';
        
        // إعادة تمكين زر النشر
        const submitBtn = newPostForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
  
  /**
   * إعداد المعاينة المباشرة لصفحة إضافة اقتباس جديد
   */
  function setupLivePreview() {
    const titleInput = utils.$('#post-title');
    const categorySelect = utils.$('#post-category');
    const textInput = utils.$('#post-text');
    
    const previewTitle = utils.$('#preview-title');
    const previewCategory = utils.$('#preview-category');
    const previewText = utils.$('#preview-text');
    
    if (!titleInput || !categorySelect || !textInput || !previewTitle || !previewCategory || !previewText) return;
    
    // تحديث المعاينة عند تغيير العنوان
    titleInput.addEventListener('input', function() {
      previewTitle.textContent = this.value || 'عنوان الاقتباس';
    });
    
    // تحديث المعاينة عند تغيير الفئة
    categorySelect.addEventListener('change', function() {
      previewCategory.textContent = this.options[this.selectedIndex].text || 'الفئة';
    });
    
    // تحديث المعاينة عند تغيير النص
    textInput.addEventListener('input', function() {
      previewText.innerHTML = utils.linkifyText(this.value) || 'نص الاقتباس سيظهر هنا مع تحويل الروابط إلى روابط قابلة للنقر.';
    });
  }
  
  /**
   * إعداد وظائف صفحة تفاصيل الاقتباس
   */
  function setupQuoteDetailPage() {
    // التحقق مما إذا كنا في صفحة تفاصيل الاقتباس
    const quoteDetailPage = window.location.pathname.includes('quote-detail.html');
    if (!quoteDetailPage) return;
    
    // الحصول على معرف الاقتباس من معلمات URL
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    
    if (quoteId) {
      // تحميل تفاصيل الاقتباس
      showQuoteDetails(quoteId);
      
      // إعداد نموذج التعليق
      setupCommentForm(quoteId);
    }
  }
  
  /**
   * تحديث صفحة تفاصيل الاقتباس
   * @param {Object} quoteDetails - تفاصيل الاقتباس
   */
  async function updateQuoteDetailPage(quoteDetails) {
    // تحديث عناصر الصفحة
    utils.$('#author-avatar').src = quoteDetails.authorAvatar || '../img/placeholders/avatar.jpg';
    utils.$('#author-name').textContent = quoteDetails.authorName;
    utils.$('#quote-category').textContent = quoteDetails.category;
    utils.$('#quote-title').textContent = quoteDetails.title;
    utils.$('#quote-text').innerHTML = utils.linkifyText(quoteDetails.text);
    utils.$('#rating-value').textContent = quoteDetails.avgRating.toFixed(1);
    utils.$('#rating-count').textContent = `(${quoteDetails.ratingsCount} تقييم)`;
    utils.$('#quote-date').textContent = `تاريخ النشر: ${utils.formatDate(quoteDetails.createdAt)}`;
    
    // تحديث نجوم التقييم
    const stars = utils.$$('#rating-stars .rating-star');
    stars.forEach((star, index) => {
      if (index < Math.floor(quoteDetails.avgRating)) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
    
    // إظهار أزرار التعديل والحذف للمؤلف فقط
    const currentUser = api.getCurrentUser();
    const quoteActions = utils.$('#quote-actions');
    
    if (currentUser && currentUser.email === quoteDetails.authorEmail) {
      quoteActions.classList.remove('hidden');
    } else {
      quoteActions.classList.add('hidden');
    }
    
    // تحميل التعليقات
    const commentsResponse = await api.getComments(quoteDetails.id);
    if (typeof ui !== 'undefined' && ui.updateCommentsList) {
      ui.updateCommentsList(commentsResponse.comments);
    }
    
    // تحميل الاقتباسات المشابهة
    loadRelatedQuotes(quoteDetails.id, quoteDetails.category);
  }
  
  /**
   * تحميل الاقتباسات المشابهة
   * @param {string} quoteId - معرف الاقتباس
   * @param {string} category - فئة الاقتباس
   */
  async function loadRelatedQuotes(quoteId, category) {
    try {
      const relatedQuotesContainer = utils.$('#related-quotes-container');
      const noRelatedQuotesMessage = utils.$('#no-related-quotes-message');
      
      if (!relatedQuotesContainer) return;
      
      // جلب الاقتباسات المشابهة من الخادم
      const response = await api.getRelatedQuotes(quoteId, 5);
      
      // التحقق من وجود اقتباسات مشابهة
      if (!response.quotes || response.quotes.length === 0) {
        if (noRelatedQuotesMessage) noRelatedQuotesMessage.classList.remove('hidden');
        return;
      } else {
        if (noRelatedQuotesMessage) noRelatedQuotesMessage.classList.add('hidden');
      }
      
      // إفراغ حاوية الاقتباسات المشابهة
      relatedQuotesContainer.innerHTML = '';
      
      // إضافة الاقتباسات المشابهة إلى الحاوية
      response.quotes.forEach(quote => {
        const quoteElement = utils.createElement('div', {
          classes: 'related-quote-item',
          html: `
            <h4 class="related-quote-title">${quote.title}</h4>
            <div class="category-badge mb-sm">${quote.category}</div>
            <p class="related-quote-text">${utils.truncateText(quote.text, 100)}</p>
            <div class="flex justify-between items-center mt-sm">
              <span class="related-quote-author">${quote.authorName}</span>
              <div class="rating">
                <i class="fas fa-star filled"></i>
                <span class="rating-value">${quote.avgRating.toFixed(1)}</span>
              </div>
            </div>
          `
        });
        
        // إضافة معالج النقر
        quoteElement.addEventListener('click', function() {
          window.location.href = `quote-detail.html?id=${quote.id}`;
        });
        
        relatedQuotesContainer.appendChild(quoteElement);
      });
    } catch (error) {
      console.error('خطأ في تحميل الاقتباسات المشابهة:', error);
    }
  }
  
  /**
   * إعداد نموذج التعليق
   * @param {string} quoteId - معرف الاقتباس
   */
  function setupCommentForm(quoteId) {
    const commentForm = utils.$('#add-comment-form');
    const submitCommentBtn = utils.$('#submit-comment');
    const commentTextarea = utils.$('#comment-text');
    
    if (!commentForm || !submitCommentBtn || !commentTextarea) return;
    
    submitCommentBtn.addEventListener('click', async function() {
      // التحقق من تسجيل الدخول
      if (!api.isLoggedIn()) {
        utils.showNotification('يجب تسجيل الدخول لإضافة تعليق', 'warning');
        return;
      }
      
      // التحقق من وجود نص التعليق
      const commentText = commentTextarea.value.trim();
      if (!commentText) {
        utils.$('#comment-error').textContent = 'يرجى إدخال نص التعليق';
        return;
      } else {
        utils.$('#comment-error').textContent = '';
      }
      
      try {
        // إظهار مؤشر التحميل
        const originalText = submitCommentBtn.textContent;
        submitCommentBtn.disabled = true;
        submitCommentBtn.innerHTML = '<div class="loading"></div>';
        
        // إرسال التعليق إلى الخادم
        const commentData = {
          quoteId,
          text: commentText
        };
        
        const response = await api.addComment(commentData);
        
        // إفراغ حقل التعليق
        commentTextarea.value = '';
        
        // إظهار إشعار نجاح
        utils.showNotification('تم إضافة التعليق بنجاح', 'success');
        
        // تحديث قائمة التعليقات
        const commentsResponse = await api.getComments(quoteId);
        if (typeof ui !== 'undefined' && ui.updateCommentsList) {
          ui.updateCommentsList(commentsResponse.comments);
        }
      } catch (error) {
        utils.$('#comment-error').textContent = error.message || 'حدث خطأ أثناء إضافة التعليق';
      } finally {
        // إعادة تمكين زر الإرسال
        submitCommentBtn.disabled = false;
        submitCommentBtn.textContent = 'إرسال';
      }
    });
  }
  
  // تصدير الوظائف العامة
  return {
    init,
    loadQuotes,
    filterByCategories,
    showQuoteDetails,
    editQuote,
    deleteQuote
  };
})();

// تهيئة وظائف إدارة الاقتباسات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  quotes.init();
});

// تصدير كائن إدارة الاقتباسات للاستخدام في الملفات الأخرى
window.quotes = quotes;
