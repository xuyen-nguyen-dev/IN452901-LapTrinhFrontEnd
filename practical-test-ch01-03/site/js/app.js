// Câu 2: lấy dữ liệu từ API bằng JavaScript

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

const form = document.querySelector('#search-form');
const keywordInput = document.querySelector('#keyword');
const statusEl = document.querySelector('#status');
const listEl = document.querySelector('#event-list');

// ---- Câu 2a: "Còn 12/40 chỗ" hoặc "Hết chỗ" ----
const formatSeats = (event) => {
  const left = event.capacity - event.registeredCount;
  return left > 0 ? `Còn ${left}/${event.capacity} chỗ` : 'Hết chỗ';
};

// ---- Câu 2b: tạo card bằng createElement, không dùng innerHTML ----
const createCard = (event) => {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.setAttribute('src', 'img/event.svg');
  img.setAttribute('alt', 'Biểu tượng lịch sự kiện');
  img.setAttribute('width', '320');
  img.setAttribute('height', '180');

  const title = document.createElement('h2');
  const link = document.createElement('a');
  link.setAttribute('href', `event-detail.html?id=${encodeURIComponent(event.id)}`);
  link.textContent = event.name;
  title.append(link);

  const timeP = document.createElement('p');
  const time = document.createElement('time');
  time.setAttribute('datetime', event.startTime);
  time.textContent = formatDateTime(event.startTime);
  timeP.append(time);

  const locationP = document.createElement('p');
  locationP.textContent = event.location;

  const seatsP = document.createElement('p');
  const seatsText = formatSeats(event);
  if (seatsText === 'Hết chỗ') {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = seatsText;
    seatsP.append(badge);
  } else {
    seatsP.textContent = seatsText;
  }

  card.append(img, title, timeP, locationP, seatsP);
  return card;
};

const renderEvents = (events) => {
  listEl.replaceChildren(...events.map(createCard));
};

// ---- Câu 2c: gọi API và hiển thị trạng thái ----
const loadEvents = async (keyword = '') => {
  const params = new URLSearchParams({ pageSize: '50' });
  if (keyword !== '') params.set('q', keyword);

  statusEl.textContent = 'Đang tải…';

  try {
    const response = await fetch(`${API_URL}/api/events?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    renderEvents(data.items);

    statusEl.textContent = data.items.length === 0
      ? 'Không có sự kiện nào khớp từ khoá.'
      : `Tìm thấy ${data.totalCount} sự kiện`;
  } catch (error) {
    // Lỗi máy chủ (503...) hoặc mất kết nối (fetch ném TypeError)
    listEl.replaceChildren();
    statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();                 // chặn tải lại trang
  loadEvents(keywordInput.value.trim());  // cắt khoảng trắng từ khoá
});

loadEvents();                             // gọi khi mở trang
