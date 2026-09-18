(function () {
  var STORAGE_CART = 'fw_cart';
  var STORAGE_ADDRESSES = 'fw_addresses';
  var STORAGE_PROFILE = 'fw_profile';

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CART) || '[]');
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_CART, JSON.stringify(items));
    updateCartBadges();
  }

  function readAddresses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_ADDRESSES) || '[]');
    } catch (e) {
      return [];
    }
  }

  function writeAddresses(list) {
    localStorage.setItem(STORAGE_ADDRESSES, JSON.stringify(list));
  }

  function readProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PROFILE) || 'null') || {
        name: 'Иванова Анна Сергеевна',
        email: 'anna.ivanova@example.ru',
        phone: '+7 900 123-45-67'
      };
    } catch (e) {
      return {
        name: 'Иванова Анна Сергеевна',
        email: 'anna.ivanova@example.ru',
        phone: '+7 900 123-45-67'
      };
    }
  }

  function writeProfile(profile) {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
  }

  /* ========== ОШИБКА 1: счётчик корзины в шапке всегда «0» ==========
     Товары добавляются, но бейдж не отражает реальное количество. */
  function updateCartBadges() {
    document.querySelectorAll('[data-cart-count]').forEach(function (node) {
      node.textContent = '0';
    });
  }

  function formatPrice(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function addToCart(product) {
    var cart = readCart();
    var existing = cart.find(function (item) {
      return item.id === product.id && item.size === product.size;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: product.size,
        qty: 1,
        image: product.image || ''
      });
    }
    writeCart(cart);
    return cart;
  }

  /* ========== Каталог ========== */
  var catalogRoot = document.getElementById('catalogPage');
  if (catalogRoot) {
    var filterCategory = document.getElementById('filterCategory');
    var filterSize = document.getElementById('filterSize');
    var filterPrice = document.getElementById('filterPrice');
    var resetBtn = document.getElementById('resetFilters');
    var searchInput = document.getElementById('catalogSearch');
    var sortSelect = document.getElementById('sortPrice');
    var grid = document.getElementById('productGrid');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));

    var activeFilters = {
      category: '',
      size: '',
      price: '',
      query: ''
    };

    function applyFilters() {
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category') || '';
        var sizes = (card.getAttribute('data-sizes') || '').split(',');
        var price = Number(card.getAttribute('data-price') || 0);
        var name = (card.getAttribute('data-name') || '').toLowerCase();
        var ok = true;
        if (activeFilters.category && cat !== activeFilters.category) ok = false;
        if (activeFilters.size && sizes.indexOf(activeFilters.size) === -1) ok = false;
        if (activeFilters.price === 'low' && price >= 30000) ok = false;
        if (activeFilters.price === 'mid' && (price < 30000 || price > 60000)) ok = false;
        if (activeFilters.price === 'high' && price <= 60000) ok = false;

        /* ========== ОШИБКА 6: поиск по каталогу не находит товары ==========
           Даже при совпадении названия карточка скрывается. */
        if (activeFilters.query) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
      });
    }

    function syncFiltersFromUI() {
      activeFilters.category = filterCategory ? filterCategory.value : '';
      activeFilters.size = filterSize ? filterSize.value : '';
      activeFilters.price = filterPrice ? filterPrice.value : '';
      activeFilters.query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      applyFilters();
    }

    if (filterCategory) filterCategory.addEventListener('change', syncFiltersFromUI);
    if (filterSize) filterSize.addEventListener('change', syncFiltersFromUI);
    if (filterPrice) filterPrice.addEventListener('change', syncFiltersFromUI);
    if (searchInput) searchInput.addEventListener('input', syncFiltersFromUI);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (filterCategory) filterCategory.value = '';
        if (filterSize) filterSize.value = '';
        if (filterPrice) filterPrice.value = '';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = '';
        activeFilters = { category: '', size: '', price: '', query: '' };
        applyFilters();
        if (grid) {
          cards.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      });
    }

    /* ========== ОШИБКА 5: сортировка по цене работает наоборот ==========
       «Сначала дешёвые» показывает сначала дорогие и наоборот. */
    if (sortSelect && grid) {
      sortSelect.addEventListener('change', function () {
        var mode = sortSelect.value;
        if (!mode) return;
        var sorted = cards.slice().sort(function (a, b) {
          var pa = Number(a.getAttribute('data-price') || 0);
          var pb = Number(b.getAttribute('data-price') || 0);
          if (mode === 'asc') return pb - pa; // наоборот
          if (mode === 'desc') return pa - pb; // наоборот
          return 0;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    }

    document.querySelectorAll('.size-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.product-sizes');
        if (!wrap) return;
        wrap.querySelectorAll('.size-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.product-card');
        if (!card) return;

        var productId = card.getAttribute('data-id');
        var name = card.getAttribute('data-name');
        var price = Number(card.getAttribute('data-price') || 0);
        var image = card.getAttribute('data-image') || '';
        var selected = card.querySelector('.size-btn.active');
        var selectedSize = selected ? selected.getAttribute('data-size') : '';

        if (!selectedSize) {
          alert('Выберите размер');
          return;
        }

        addToCart({
          id: productId,
          name: name,
          price: price,
          size: selectedSize,
          image: image
        });

        alert('Добавлено: ' + name + ' (размер ' + selectedSize + ')');
      });
    });

    applyFilters();
  }

  /* ========== Корзина ========== */
  var cartRoot = document.getElementById('cartPage');
  if (cartRoot) {
    var listEl = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');
    var emptyEl = document.getElementById('cartEmpty');
    var promoInput = document.getElementById('promoCode');
    var promoBtn = document.getElementById('applyPromo');
    var promoMsg = document.getElementById('promoMessage');
    var checkoutBtn = document.getElementById('checkoutBtn');
    var discount = 0;

    function renderCart() {
      var cart = readCart();
      if (!listEl) return;
      listEl.innerHTML = '';
      if (!cart.length) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (totalEl) totalEl.textContent = formatPrice(0);
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = false;
      var sum = 0;
      cart.forEach(function (item, index) {
        /* ========== ОШИБКА 2: итоговая цена строки без учёта количества ==========
           В строке и в сумме учитывается только цена одной единицы. */
        sum += item.price;
        var row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML =
          '<div class="cart-row-info">' +
          '<strong>' + item.name + '</strong>' +
          '<span>Размер: ' + item.size + ' · Кол-во: ' + item.qty + '</span>' +
          '<span>' + formatPrice(item.price) + '</span>' +
          '</div>' +
          '<div class="cart-row-actions">' +
          '<button type="button" class="button cart-qty-plus" data-index="' + index + '">+1</button>' +
          '<button type="button" class="button cart-remove" data-index="' + index + '">Удалить</button>' +
          '</div>';
        listEl.appendChild(row);
      });
      var finalSum = Math.max(0, sum - discount);
      if (totalEl) totalEl.textContent = formatPrice(finalSum);

      /* ========== ОШИБКА 3: кнопка «Удалить» не удаляет товар ==========
         Обработчик есть, но запись в storage не меняется. */
      listEl.querySelectorAll('.cart-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          alert('Товар удалён из корзины');
          renderCart();
        });
      });

      listEl.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = Number(btn.getAttribute('data-index'));
          var next = readCart();
          if (next[idx]) {
            next[idx].qty += 1;
            writeCart(next);
            renderCart();
          }
        });
      });
    }

    if (promoBtn) {
      promoBtn.addEventListener('click', function () {
        var code = (promoInput && promoInput.value ? promoInput.value : '').trim().toUpperCase();
        var cart = readCart();
        var sum = cart.reduce(function (s, item) {
          return s + item.price;
        }, 0);
        if (!code) {
          if (promoMsg) {
            promoMsg.textContent = 'Введите промокод';
            promoMsg.className = 'promo-msg error';
          }
          return;
        }
        if (code === 'FASHION10') {
          discount = Math.round(sum * 0.1);
          if (promoMsg) {
            promoMsg.textContent = 'Скидка 10% применена (−' + formatPrice(discount) + ')';
            promoMsg.className = 'promo-msg ok';
          }
          renderCart();
          return;
        }
        if (promoMsg) {
          promoMsg.textContent = 'Промокод недействителен';
          promoMsg.className = 'promo-msg error';
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        if (!readCart().length) return;
        alert('Заказ оформлен (учебный режим). Номер: FW-' + Date.now().toString().slice(-6));
        writeCart([]);
        discount = 0;
        if (promoMsg) promoMsg.textContent = '';
        if (promoInput) promoInput.value = '';
        renderCart();
      });
    }

    renderCart();
  }

  /* ========== Профиль ========== */
  var profileRoot = document.getElementById('profilePage');
  if (profileRoot) {
    var form = document.getElementById('addressForm');
    var list = document.getElementById('addressList');
    var status = document.getElementById('addressStatus');
    var profileForm = document.getElementById('profileForm');
    var profileStatus = document.getElementById('profileStatus');
    var nameInput = document.getElementById('profileName');
    var emailInput = document.getElementById('profileEmail');
    var phoneInput = document.getElementById('profilePhone');

    function fillProfile() {
      var profile = readProfile();
      if (nameInput) nameInput.value = profile.name;
      if (emailInput) emailInput.value = profile.email;
      if (phoneInput) phoneInput.value = profile.phone;
    }

    /* ========== ОШИБКА 4: данные профиля не сохраняются ==========
       Показываем «сохранено», но в storage пишем старые значения. */
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var old = readProfile();
        writeProfile(old);
        if (profileStatus) {
          profileStatus.textContent = 'Данные профиля сохранены';
          profileStatus.className = 'promo-msg ok';
        }
        fillProfile();
      });
    }

    function renderAddresses() {
      if (!list) return;
      var addresses = readAddresses();
      list.innerHTML = '';
      if (!addresses.length) {
        list.innerHTML = '<p class="muted">Сохранённых адресов пока нет.</p>';
        return;
      }
      addresses.forEach(function (addr, index) {
        var item = document.createElement('div');
        item.className = 'address-item';
        item.innerHTML =
          '<strong>' + addr.city + '</strong>' +
          '<span>' + addr.street + ', д. ' + addr.building +
          (addr.apt ? ', кв. ' + addr.apt : '') + '</span>' +
          '<span>' + addr.phone + '</span>' +
          '<button type="button" class="button address-delete" data-index="' + index + '">Удалить адрес</button>';
        list.appendChild(item);
      });
      list.querySelectorAll('.address-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = Number(btn.getAttribute('data-index'));
          var next = readAddresses();
          next.splice(idx, 1);
          writeAddresses(next);
          renderAddresses();
        });
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var city = document.getElementById('addrCity').value.trim();
        var street = document.getElementById('addrStreet').value.trim();
        var building = document.getElementById('addrBuilding').value.trim();
        var apt = document.getElementById('addrApt').value.trim();
        var phone = document.getElementById('addrPhone').value.trim();

        if (!city || !street || !building || !phone) {
          if (status) {
            status.textContent = 'Заполните обязательные поля';
            status.className = 'promo-msg error';
          }
          return;
        }

        var addresses = readAddresses();
        addresses.push({ city: city, street: street, building: building, apt: apt, phone: phone });
        writeAddresses(addresses);
        if (status) {
          status.textContent = 'Адрес успешно добавлен';
          status.className = 'promo-msg ok';
        }
        form.reset();
        renderAddresses();
      });
    }

    fillProfile();
    renderAddresses();
  }

  updateCartBadges();
})();
