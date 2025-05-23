/**
 * api.js - ملف واجهة برمجة التطبيقات للاتصال بـ Google Sheets
 * 
 * هذا الملف يحتوي على وظائف الاتصال بواجهة برمجة التطبيقات (API) المنفذة باستخدام Google Apps Script.
 * يتم استخدام هذه الوظائف للتفاعل مع البيانات المخزنة في Google Sheets.
 */

// نمط الوحدة النمطية الفورية التنفيذ (IIFE) لإنشاء نطاق خاص
const API = (function() {
    // المتغيرات الخاصة
    const API_URL = 'https://script.google.com/macros/s/AKfycbzvF0Ya3T-KZpwa5-qAbC9symwGtVSYOTCY3stru9N0fudNgJQ5h4XRL7-q5nfQHXCV7w/exec';
    const USER_KEY = 'min_jadeed_user';
    
    /**
     * إرسال طلب إلى الخادم
     * @param {string} action - الإجراء المطلوب
     * @param {Object} data - البيانات المرسلة
     * @param {string} method - طريقة الطلب (GET, POST, PUT, DELETE)
     * @returns {Promise} - وعد بالاستجابة
     */
    async function sendRequest(action, data = {}, method = 'GET') {
        try {
            // إضافة الإجراء إلى البيانات
            data.action = action;
            
            // إعداد خيارات الطلب
            const options = {
                method: method,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // إضافة البيانات إلى الجسم أو عنوان URL حسب طريقة الطلب
            let url = API_URL;
            if (method === 'GET') {
                // إضافة البيانات إلى عنوان URL
                const params = new URLSearchParams();
                for (const key in data) {
                    params.append(key, data[key]);
                }
                url = `${API_URL}?${params.toString()}`;
            } else {
                // إضافة البيانات إلى جسم الطلب
                options.body = JSON.stringify(data);
            }
            
            console.log(`Sending ${method} request to ${url}`, data);
            
            // إرسال الطلب
            const response = await fetch(url, options);
            
            // التحقق من نجاح الطلب
            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} ${response.statusText}`);
                throw new Error(`خطأ في الطلب: ${response.status} ${response.statusText}`);
            }
            
            // تحليل الاستجابة
            const result = await response.json();
            console.log('API Response:', result);
            
            // التحقق من وجود خطأ في الاستجابة
            if (result.error) {
                console.error('API Error:', result.error);
                throw new Error(result.error);
            }
            
            return result;
        } catch (error) {
            // عرض الخطأ في وحدة تحكم المتصفح
            console.error('خطأ في الاتصال بالخادم:', error);
            
            // إعادة رمي الخطأ ليتم التعامل معه في المستدعي
            throw error;
        }
    }
    
    /**
     * حفظ بيانات المستخدم في التخزين المحلي
     * @param {Object} user - بيانات المستخدم
     */
    function saveUser(user) {
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    }
    
    /**
     * الحصول على بيانات المستخدم من التخزين المحلي
     * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن مسجل الدخول
     */
    function getCurrentUser() {
        const userJson = localStorage.getItem(USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
    
    /**
     * التحقق مما إذا كان المستخدم مسجل الدخول
     * @returns {boolean} - صحيح إذا كان المستخدم مسجل الدخول
     */
    function isLoggedIn() {
        return !!getCurrentUser();
    }
    
    /**
     * تسجيل خروج المستخدم
     */
    function logout() {
        localStorage.removeItem(USER_KEY);
    }
    
    // وظائف المستخدمين
    
    /**
     * تسجيل دخول المستخدم
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @returns {Promise} - وعد ببيانات المستخدم
     */
    async function login(email, password) {
        try {
            const response = await sendRequest('login', { email, password }, 'POST');
            
            if (response.success && response.user) {
                saveUser(response.user);
                return response;
            } else {
                throw new Error('استجابة غير صالحة من الخادم');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    /**
     * إنشاء حساب مستخدم جديد
     * @param {Object} userData - بيانات المستخدم
     * @returns {Promise} - وعد ببيانات المستخدم الجديد
     */
    async function signup(userData) {
        try {
            const response = await sendRequest('signup', userData, 'POST');
            
            if (response.success && response.user) {
                saveUser(response.user);
                return response;
            } else {
                throw new Error('استجابة غير صالحة من الخادم');
            }
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }
    
    /**
     * الحصول على بيانات مستخدم محدد
     * @param {string} email - البريد الإلكتروني
     * @returns {Promise} - وعد ببيانات المستخدم
     */
    async function getUser(email) {
        return sendRequest('user', { email }, 'GET');
    }
    
    /**
     * تحديث بيانات المستخدم
     * @param {Object} userData - بيانات المستخدم المحدثة
     * @returns {Promise} - وعد ببيانات المستخدم المحدثة
     */
    async function updateUser(userData) {
        const response = await sendRequest('user', userData, 'PUT');
        
        if (response.success && response.user) {
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.email === userData.userEmail) {
                saveUser(response.user);
            }
        }
        
        return response;
    }
    
    // وظائف الاقتباسات
    
    /**
     * الحصول على قائمة الاقتباسات
     * @param {Object} params - معلمات الاستعلام
     * @returns {Promise} - وعد بقائمة الاقتباسات
     */
    async function getQuotes(params = {}) {
        return sendRequest('quotes', params, 'GET');
    }
    
    /**
     * الحصول على اقتباس محدد
     * @param {string} id - معرف الاقتباس
     * @returns {Promise} - وعد ببيانات الاقتباس
     */
    async function getQuote(id) {
        return sendRequest('quote', { id }, 'GET');
    }
    
    /**
     * إنشاء اقتباس جديد
     * @param {Object} quoteData - بيانات الاقتباس
     * @returns {Promise} - وعد ببيانات الاقتباس الجديد
     */
    async function createQuote(quoteData) {
        return sendRequest('quote', quoteData, 'POST');
    }
    
    /**
     * تحديث اقتباس
     * @param {Object} quoteData - بيانات الاقتباس المحدثة
     * @returns {Promise} - وعد ببيانات الاقتباس المحدثة
     */
    async function updateQuote(quoteData) {
        return sendRequest('quote', quoteData, 'PUT');
    }
    
    /**
     * حذف اقتباس
     * @param {string} id - معرف الاقتباس
     * @param {string} userEmail - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد بنتيجة الحذف
     */
    async function deleteQuote(id, userEmail) {
        return sendRequest('quote', { id, userEmail }, 'DELETE');
    }
    
    /**
     * الحصول على اقتباسات مستخدم محدد
     * @param {string} email - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد بقائمة الاقتباسات
     */
    async function getUserQuotes(email) {
        return sendRequest('userQuotes', { email }, 'GET');
    }
    
    /**
     * الحصول على اقتباسات مشابهة
     * @param {string} id - معرف الاقتباس
     * @param {number} limit - عدد الاقتباسات المرجعة
     * @returns {Promise} - وعد بقائمة الاقتباسات المشابهة
     */
    async function getRelatedQuotes(id, limit = 5) {
        return sendRequest('relatedQuotes', { id, limit }, 'GET');
    }
    
    // وظائف التقييمات
    
    /**
     * إضافة أو تحديث تقييم
     * @param {string} quoteId - معرف الاقتباس
     * @param {number} rating - قيمة التقييم
     * @param {string} userEmail - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد بنتيجة التقييم
     */
    async function rateQuote(quoteId, rating, userEmail) {
        return sendRequest('rating', { quoteId, rating, userEmail }, 'POST');
    }
    
    /**
     * الحصول على تقييم المستخدم لاقتباس محدد
     * @param {string} quoteId - معرف الاقتباس
     * @param {string} userEmail - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد ببيانات التقييم
     */
    async function getUserRating(quoteId, userEmail) {
        return sendRequest('userRating', { quoteId, userEmail }, 'GET');
    }
    
    // وظائف التعليقات
    
    /**
     * الحصول على تعليقات اقتباس محدد
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise} - وعد بقائمة التعليقات
     */
    async function getComments(quoteId) {
        return sendRequest('comments', { quoteId }, 'GET');
    }
    
    /**
     * إضافة تعليق جديد
     * @param {string} quoteId - معرف الاقتباس
     * @param {string} text - نص التعليق
     * @param {string} userEmail - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد ببيانات التعليق الجديد
     */
    async function addComment(quoteId, text, userEmail) {
        return sendRequest('comment', { quoteId, text, userEmail }, 'POST');
    }
    
    /**
     * حذف تعليق
     * @param {string} id - معرف التعليق
     * @param {string} userEmail - البريد الإلكتروني للمستخدم
     * @returns {Promise} - وعد بنتيجة الحذف
     */
    async function deleteComment(id, userEmail) {
        return sendRequest('comment', { id, userEmail }, 'DELETE');
    }
    
    // كشف الوظائف العامة
    return {
        // وظائف المستخدمين
        login,
        signup,
        getUser,
        updateUser,
        getCurrentUser,
        isLoggedIn,
        logout,
        
        // وظائف الاقتباسات
        getQuotes,
        getQuote,
        createQuote,
        updateQuote,
        deleteQuote,
        getUserQuotes,
        getRelatedQuotes,
        
        // وظائف التقييمات
        rateQuote,
        getUserRating,
        
        // وظائف التعليقات
        getComments,
        addComment,
        deleteComment
    };
})();

// تصدير كائن API للاستخدام في الملفات الأخرى
window.API = API;
