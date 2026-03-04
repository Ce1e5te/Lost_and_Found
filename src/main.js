// 简单的前端数据模拟（实际项目中可由后端接口返回）
const mockLostList = [
  {
    id: 1,
    type: "lost",
    title: "黑色校园卡",
    category: "card",
    time: "2026-03-01",
    location: "图书馆三楼自习区",
    description: "一卡通背面贴有蓝色贴纸，姓李。",
    contactName: "张同学",
    contact: "微信：zhangxx",
    image: "https://picsum.photos/seed/campus-card/400/300.jpg"
  },
  {
    id: 2,
    type: "lost",
    title: "银色U盘",
    category: "digital",
    time: "2026-03-02",
    location: "计算机学院实验楼 302",
    description: "金士顿 32G，里面有课程作业。",
    contactName: "王同学",
    contact: "电话：188xxxx0001",
    image: "https://picsum.photos/seed/usb-drive/400/300.jpg"
  },
];

const mockFoundList = [
  {
    id: 3,
    type: "found",
    title: "蓝色折叠雨伞",
    category: "daily",
    time: "2026-03-02",
    location: "一号食堂门口",
    description: "放在门口台阶上，无明显标记。",
    contactName: "李同学",
    contact: "QQ：123456",
    image: "https://picsum.photos/seed/blue-umbrella/400/300.jpg"
  },
  {
    id: 4,
    type: "found",
    title: "学生证（赵*）",
    category: "card",
    time: "2026-03-03",
    location: "操场看台",
    description: "已交至校警务室，可凭证认领。",
    contactName: "校警务室",
    contact: "电话：010-xxxx0000",
    image: "https://picsum.photos/seed/student-id/400/300.jpg"
  },
];

function createCard(item) {
  const el = document.createElement("article");
  el.className = "lf-card";
  el.style.cursor = "pointer";

  el.innerHTML = `
    ${
      item.image
        ? `<img class="lf-card__image" src="${item.image}" alt="物品照片" />`
        : ""
    }
    <div class="lf-card__badge lf-card__badge--${
      item.type === "lost" ? "lost" : "found"
    }">
      ${item.type === "lost" ? "寻物" : "招领"}
    </div>
    <h3 class="lf-card__title">${item.title}</h3>
    <ul class="lf-card__meta">
      <li><strong>时间：</strong>${item.time}</li>
      <li><strong>地点：</strong>${item.location}</li>
      <li><strong>类别：</strong>${mapCategory(item.category)}</li>
    </ul>
    <p class="lf-card__desc">${item.description || "（无详细描述）"}</p>
    <p class="lf-card__contact">
      <span>联系人：${item.contactName}</span>
      <span>${item.contact}</span>
    </p>
  `;

  // 添加点击事件
  el.addEventListener('click', () => showDetailModal(item));

  return el;
}

function mapCategory(category) {
  switch (category) {
    case "card":
      return "校园卡 / 证件";
    case "digital":
      return "电子产品";
    case "daily":
      return "日常用品";
    default:
      return "其他";
  }
}

function renderList(list, container) {
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML =
      '<p class="lf-empty">暂无相关信息，可以尝试调整筛选条件。</p>';
    return;
  }

  list.forEach((item) => {
    container.appendChild(createCard(item));
  });
}

function applyFilter(list) {
  const category = document.getElementById("filter-category").value;
  const keyword = document
    .getElementById("filter-keyword")
    .value.trim()
    .toLowerCase();

  return list.filter((item) => {
    const matchCategory = category ? item.category === category : true;
    const text =
      `${item.title} ${item.location} ${item.description}`.toLowerCase();
    const matchKeyword = keyword ? text.includes(keyword) : true;
    return matchCategory && matchKeyword;
  });
}

function bindTabs() {
  const buttons = document.querySelectorAll(".lf-nav__item");
  const tabs = document.querySelectorAll(".lf-tab");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      buttons.forEach((b) => b.classList.remove("lf-nav__item--active"));
      btn.classList.add("lf-nav__item--active");

      tabs.forEach((panel) => {
        panel.classList.toggle(
          "lf-tab--active",
          panel.id === `tab-${tab}`
        );
      });
    });
  });
}

function bindFilter(lostList, foundList) {
  const lostContainer = document.getElementById("lost-list");
  const foundContainer = document.getElementById("found-list");

  const apply = () => {
    renderList(applyFilter(lostList), lostContainer);
    renderList(applyFilter(foundList), foundContainer);
  };

  document.getElementById("filter-button").addEventListener("click", apply);
}

function bindForm(lostList, foundList) {
  const form = document.getElementById("publish-form");
  const messageEl = document.getElementById("publish-message");
  const lostContainer = document.getElementById("lost-list");
  const foundContainer = document.getElementById("found-list");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const file = formData.get("image");

    const buildAndAppend = (imageDataUrl) => {
      const newItem = {
        id: Date.now(),
        type: data.type,
        title: data.title,
        category: data.category,
        time: data.time,
        location: data.location,
        description: data.description || "",
        contactName: data.contactName,
        contact: data.contact,
        image: imageDataUrl || null,
      };

      if (data.type === "lost") {
        lostList.unshift(newItem);
        renderList(lostList, lostContainer);
      } else {
        foundList.unshift(newItem);
        renderList(foundList, foundContainer);
      }

      form.reset();
      messageEl.textContent =
        "发布成功（当前为本地示例数据，图片未上传到服务器）";
      messageEl.classList.add("lf-form__message--success");

      setTimeout(() => {
        messageEl.textContent = "";
        messageEl.classList.remove("lf-form__message--success");
      }, 2500);
    };

    if (file && file instanceof File && file.size > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        buildAndAppend(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      buildAndAppend(null);
    }
  });

  // 悬浮按钮：点击时自动切换到“发布启事”标签
  const fab = document.querySelector(".lf-fab");
  if (fab) {
    fab.addEventListener("click", () => {
      const publishTabBtn = document.querySelector(
        '.lf-nav__item[data-tab="publish"]'
      );
      if (publishTabBtn) {
        publishTabBtn.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}

// 显示详情弹窗
function showDetailModal(item) {
  const modal = document.getElementById('detail-modal');
  const overlay = modal.querySelector('.lf-modal__overlay');
  const closeBtn = modal.querySelector('.lf-modal__close');
  
  // 填充数据
  const modalImage = document.getElementById('modal-image');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalTime = document.getElementById('modal-time');
  const modalLocation = document.getElementById('modal-location');
  const modalCategory = document.getElementById('modal-category');
  const modalDescription = document.getElementById('modal-description');
  const modalContactName = document.getElementById('modal-contact-name');
  const modalContact = document.getElementById('modal-contact');
  
  // 设置图片（如果没有图片则隐藏）
  if (item.image) {
    modalImage.src = item.image;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }
  
  // 设置徽章
  modalBadge.textContent = item.type === 'lost' ? '寻物' : '招领';
  modalBadge.className = `lf-modal__badge lf-modal__badge--${item.type}`;
  
  // 设置其他信息
  modalTitle.textContent = item.title;
  modalTime.textContent = item.time;
  modalLocation.textContent = item.location;
  modalCategory.textContent = mapCategory(item.category);
  modalDescription.textContent = item.description || '（无详细描述）';
  modalContactName.textContent = item.contactName;
  modalContact.textContent = item.contact;
  
  // 显示弹窗
  modal.classList.add('lf-modal--show');
  document.body.style.overflow = 'hidden';
  
  // 关闭弹窗的函数
  const closeModal = () => {
    modal.classList.remove('lf-modal--show');
    document.body.style.overflow = '';
  };
  
  // 移除之前的事件监听器（避免重复绑定）
  const newOverlay = overlay.cloneNode(true);
  const newCloseBtn = closeBtn.cloneNode(true);
  overlay.parentNode.replaceChild(newOverlay, overlay);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
  
  // 添加新的事件监听器
  newOverlay.addEventListener('click', closeModal);
  newCloseBtn.addEventListener('click', closeModal);
  
  // ESC键关闭
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

window.addEventListener("DOMContentLoaded", () => {
  const lostList = [...mockLostList];
  const foundList = [...mockFoundList];

  const lostContainer = document.getElementById("lost-list");
  const foundContainer = document.getElementById("found-list");

  renderList(lostList, lostContainer);
  renderList(foundList, foundContainer);

  bindTabs();
  bindFilter(lostList, foundList);
  bindForm(lostList, foundList);
});

