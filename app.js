// ================= 1. SUPABASE INITIALIZATION =================
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_KEY;

// ملاحظة: نستخدم fetch مباشرة لـ Supabase لتبسيط الكود، 
// ولكن يُفضل استخدام مكتبة @supabase/supabase-js في الإنتاج.
const supabaseHeaders = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
};

// ================= 2. NAVIGATION LOGIC =================
function navigateTo(pageName) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // إظهار الصفحة المطلوبة
    document.getElementById(`page-${pageName}`).classList.add('active');
    
    // تحديث شريط التنقل السفلي
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active', 'brand-text');
        btn.classList.add('text-gray-500');
    });
    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'brand-text');
        activeBtn.classList.remove('text-gray-500');
    }

    // تهيئة بيانات الصفحة عند التنقل إليها
    if (pageName === 'routes') loadRoutes();
    if (pageName === 'notifications') loadNotifications();
}

// ================= 3. MAP INITIALIZATION (LEAFLET) =================
let map;
let busMarker;

function initMap() {
    // إحداثيات افتراضية (الجامعة)
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([24.7136, 46.6753], 14); // الرياض كمثال

    // خرائط OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // إضافة علامة الحافلة (Bus Marker)
    const busIcon = L.divIcon({
        html: `<div style="background-color: #0f6b45; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M18 18h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-.3-.7l-3-3A1 1 0 0 0 17 8h-2a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1H7a1 1 0 0 0-.7.3l-3 3A1 1 0 0 0 3 12v5a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
               </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    busMarker = L.marker([24.7136, 46.6753], { icon: busIcon }).addTo(map);
    
    // جلب موقع الحافلة الحقيقي من Supabase
    fetchBusLocation();
}

// ================= 4. DATA FETCHING (SUPABASE) =================
async function fetchBusLocation() {
    try {
        // استبدل 'buses' باسم جدولك في Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/buses?select=lat,lng,id&limit=1`, {
            headers: supabaseHeaders
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
            const bus = data[0];
            busMarker.setLatLng([bus.lat, bus.lng]);
            map.setView([bus.lat, bus.lng], 15);
        }
    } catch (error) {
        console.log('Using default location (Supabase fetch failed)');
    }
}

async function loadRoutes() {
    const container = document.getElementById('routesList');
    container.innerHTML = '<p class="text-center text-gray-500">جاري تحميل المسارات...</p>';

    // بيانات افتراضية (يمكن استبدالها بجلب من Supabase)
    const routes = [
        { id: 1, name: 'الكلية → المدينة الجامعية', time: '08:00 ص', status: 'في الموعد', color: 'green' },
        { id: 2, name: 'الكلية → وسط البلد', time: '08:30 ص', status: 'متأخر 5 د', color: 'orange' },
        { id: 3, name: 'الكلية → حي النزهة', time: '09:00 ص', status: 'في الموعد', color: 'green' },
    ];

    container.innerHTML = routes.map(route => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <i data-lucide="route" class="w-6 h-6 brand-text"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-800">${route.name}</h4>
                    <p class="text-sm text-gray-500">الانطلاق: ${route.time}</p>
                </div>
            </div>
            <span class="px-3 py-1 bg-${route.color}-100 text-${route.color}-700 text-xs font-bold rounded-full">
                ${route.status}
            </span>
        </div>
    `).join('');
    
    lucide.createIcons(); // إعادة تهيئة الأيقونات
}

async function loadNotifications() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '<p class="text-center text-gray-500">جاري تحميل الإشعارات...</p>';

    // بيانات افتراضية
    const notifications = [
        { title: 'تأخر الكوستر #42', body: 'الكوستر المتجه للمدينة الجامعية سيتأخر 10 دقائق بسبب الزحام.', time: 'منذ 5 دقائق', icon: 'alert-circle', color: 'orange' },
        { title: 'وصول الكوستر #15', body: 'الكوستر المتجه لوسط البلد وصل إلى المحطة الرئيسية.', time: 'منذ ساعة', icon: 'check-circle', color: 'green' },
        { title: 'تحديث المسار', body: 'تم تغيير مسار الكوستر #8 مؤقتاً بسبب أعمال الصيانة.', time: 'أمس', icon: 'info', color: 'blue' },
    ];

    container.innerHTML = notifications.map(notif => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
            <div class="w-10 h-10 bg-${notif.color}-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i data-lucide="${notif.icon}" class="w-5 h-5 text-${notif.color}-600"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-gray-800 text-sm">${notif.title}</h4>
                    <span class="text-xs text-gray-400">${notif.time}</span>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">${notif.body}</p>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// ================= 5. AUTH & LOGOUT =================
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        // هنا يمكنك إضافة كود تسجيل الخروج من Supabase
        // await supabase.auth.signOut();
        alert('تم تسجيل الخروج بنجاح');
        // window.location.href = 'login.html'; // توجيه لصفحة الدخول
    }
}

// ================= 6. INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // تحديث موقع الحافلة كل 10 ثوانٍ
    setInterval(fetchBusLocation, 10000);
});
