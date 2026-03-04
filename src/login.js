// 登录页面JavaScript逻辑
class LoginSystem {
  constructor() {
    this.currentUser = null;
    this.countdownTimer = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
    this.bindRegisterEvents();
  }

  bindEvents() {
    const form = document.getElementById('login-form');
    const sendCodeBtn = document.getElementById('send-code');
    const phoneInput = document.getElementById('phone');
    const codeInput = document.getElementById('verification-code');

    // 登录方式切换
    this.bindLoginMethodToggle();

    // 表单提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // 发送验证码
    if (sendCodeBtn) {
      sendCodeBtn.addEventListener('click', () => {
        this.sendVerificationCode();
      });
    }

    // 手机号输入验证
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        this.validatePhone();
        this.updateLoginButton();
      });
    }

    // 验证码输入验证
    if (codeInput) {
      codeInput.addEventListener('input', () => {
        this.updateLoginButton();
      });
    }

    // 用户类型切换
    // 已移除用户类型选择，不需要相关事件监听器

    // 密码输入验证
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.updateLoginButton();
      });
    }
    if (usernameInput) {
      usernameInput.addEventListener('input', () => {
        this.updateLoginButton();
      });
    }

    // 记住密码功能
    this.loadRememberedPassword();
  }

  // 绑定登录方式切换
  bindLoginMethodToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const phoneLogin = document.getElementById('phone-login');
    const passwordLogin = document.getElementById('password-login');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        
        // 更新按钮状态
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 切换表单显示
        if (method === 'phone') {
          phoneLogin.style.display = 'block';
          passwordLogin.style.display = 'none';
        } else {
          phoneLogin.style.display = 'none';
          passwordLogin.style.display = 'block';
        }
        
        // 更新登录按钮状态
        this.updateLoginButton();
      });
    });
  }

  // 切换管理员登录
  toggleAdminLogin() {
    const adminSection = document.getElementById('admin-login-section');
    const adminLink = document.querySelector('.admin-link');
    
    if (adminSection.style.display === 'none' || adminSection.style.display === '') {
      adminSection.style.display = 'block';
      adminLink.textContent = '取消管理员登录';
    } else {
      adminSection.style.display = 'none';
      adminLink.textContent = '管理员登录';
    }
  }

  // 绑定注册表单事件
  bindRegisterEvents() {
    const registerForm = document.getElementById('student-register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  // 处理注册
  handleRegister() {
    const studentId = document.getElementById('reg-student-id').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPassword = document.getElementById('reg-confirm-password').value.trim();

    // 验证必填字段
    if (!studentId || !phone || !password || !confirmPassword) {
      this.showMessage('请填写所有必填字段', 'error');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.showMessage('请输入有效的手机号码', 'error');
      return;
    }

    // 验证密码
    if (password.length < 6 || password.length > 20) {
      this.showMessage('密码长度应为6-20位', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('两次输入的密码不一致', 'error');
      return;
    }

    // 检查手机号是否已注册
    const existingUsers = this.getRegisteredUsers();
    if (existingUsers.some(u => u.phone === phone)) {
      this.showMessage('该手机号已注册', 'error');
      return;
    }

    if (existingUsers.some(u => u.studentId === studentId)) {
      this.showMessage('该学号已注册', 'error');
      return;
    }

    // 创建注册用户数据
    const registerData = {
      id: Date.now(),
      name: `同学${studentId.slice(-4)}`, // 自动生成姓名
      studentId: studentId,
      phone: phone,
      password: password, // 保存用户设置的密码
      department: 'other', // 默认其他
      userType: 'student',
      registerTime: new Date().toISOString(),
      status: 'active' // 激活状态
    };

    // 保存注册信息到localStorage（实际项目中应该发送到服务器）
    this.saveRegistration(registerData);
    
    this.showMessage('注册成功！请使用账号密码登录', 'success');
    
    // 关闭注册弹窗
    setTimeout(() => {
      this.hideRegisterModal();
      // 切换到密码登录方式
      const passwordBtn = document.querySelector('[data-method="password"]');
      if (passwordBtn) {
        passwordBtn.click();
      }
      // 预填用户名
      document.getElementById('username').value = studentId;
      this.updateLoginButton();
    }, 1500);
  }

  // 保存注册信息
  saveRegistration(userData) {
    let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    registrations.push(userData);
    localStorage.setItem('registrations', JSON.stringify(registrations));
  }

  // 隐藏注册弹窗
  hideRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      // 清空表单
      document.getElementById('student-register-form').reset();
    }
  }

  // 检查现有会话
  checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.redirectToMain();
    }
  }

  // 验证手机号
  validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (phone.length === 11) {
      if (phoneRegex.test(phone)) {
        phoneInput.setCustomValidity('');
        return true;
      } else {
        phoneInput.setCustomValidity('请输入有效的手机号码');
      }
    } else {
      phoneInput.setCustomValidity('');
    }
    
    return false;
  }

  // 发送验证码
  sendVerificationCode() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    
    if (!this.validatePhone()) {
      this.showMessage('请输入有效的手机号码', 'error');
      return;
    }

    const sendCodeBtn = document.getElementById('send-code');
    
    // 模拟发送验证码
    this.showMessage('验证码已发送', 'success');
    
    // 开始倒计时
    this.startCountdown(sendCodeBtn);
    
    // 模拟验证码（实际项目中应该从服务器获取）
    this.mockVerificationCode = this.generateMockCode();
    console.log('模拟验证码:', this.mockVerificationCode); // 开发时方便测试
  }

  // 生成模拟验证码
  generateMockCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 开始倒计时
  startCountdown(button) {
    let countdown = 60;
    button.disabled = true;
    
    this.countdownTimer = setInterval(() => {
      countdown--;
      button.textContent = `${countdown}秒后重发`;
      
      if (countdown <= 0) {
        clearInterval(this.countdownTimer);
        button.disabled = false;
        button.textContent = '发送验证码';
      }
    }, 1000);
  }

  // 更新登录按钮状态
  updateLoginButton() {
    const activeMethod = document.querySelector('.toggle-btn.active').dataset.method;
    const loginBtn = document.querySelector('.login-btn');
    
    let canLogin = false;
    
    if (activeMethod === 'phone') {
      const phoneInput = document.getElementById('phone');
      const codeInput = document.getElementById('verification-code');
      const isValidPhone = this.validatePhone();
      const hasCode = codeInput && codeInput.value.trim().length === 6;
      canLogin = isValidPhone && hasCode;
    } else if (activeMethod === 'password') {
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const hasUsername = usernameInput && usernameInput.value.trim().length > 0;
      const hasPassword = passwordInput && passwordInput.value.trim().length > 0;
      canLogin = hasUsername && hasPassword;
    }
    
    loginBtn.disabled = !canLogin;
  }

  // 处理登录
  handleLogin() {
    const activeMethod = document.querySelector('.toggle-btn.active').dataset.method;
    
    if (activeMethod === 'phone') {
      this.handlePhoneLogin('student'); // 默认学生类型
    } else if (activeMethod === 'password') {
      this.handlePasswordLogin('student'); // 默认学生类型
    }
  }

  // 处理手机号登录
  handlePhoneLogin(userType) {
    const phone = document.getElementById('phone').value.trim();
    const code = document.getElementById('verification-code').value.trim();
    
    // 验证验证码（模拟）
    if (code !== this.mockVerificationCode && code !== '123456') {
      this.showMessage('验证码错误，请重新输入', 'error');
      return;
    }

    this.createAndLoginUser(phone, userType, 'phone');
  }

  // 处理密码登录
  handlePasswordLogin(userType) {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberPassword = document.getElementById('remember-password').checked;
    
    // 验证用户凭据（模拟）
    const users = this.getRegisteredUsers();
    const user = users.find(u => 
      (u.phone === username || u.studentId === username) && 
      this.verifyPassword(password, u)
    );
    
    if (!user) {
      this.showMessage('用户名或密码错误', 'error');
      return;
    }

    // 记住密码
    if (rememberPassword) {
      this.rememberPassword(username, password);
    } else {
      this.clearRememberedPassword();
    }

    this.loginUser(user);
  }

  // 获取注册用户列表
  getRegisteredUsers() {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    
    // 添加一些默认的管理员账户
    const defaultUsers = [
      {
        id: 'admin1',
        name: '系统管理员',
        studentId: 'admin001',
        phone: '13800000001',
        password: 'admin123',
        userType: 'admin',
        registerTime: new Date().toISOString()
      }
    ];
    
    return [...defaultUsers, ...registrations];
  }

  // 验证密码（简单模拟）
  verifyPassword(password, user) {
    // 如果用户有设置密码，使用设置的密码
    if (user.password) {
      return password === user.password;
    }
    
    // 默认密码规则：学号后6位或手机号后6位
    if (user.studentId && user.studentId.length >= 6) {
      return password === user.studentId.slice(-6);
    }
    if (user.phone && user.phone.length >= 6) {
      return password === user.phone.slice(-6);
    }
    
    // 通用测试密码
    return password === '123456';
  }

  // 创建并登录用户
  createAndLoginUser(phone, userType, loginMethod) {
    const user = {
      id: Date.now(),
      phone: phone,
      userType: userType,
      loginTime: new Date().toISOString(),
      name: this.generateUserName(userType, phone),
      loginMethod: loginMethod
    };

    this.loginUser(user);
  }

  // 登录用户
  loginUser(user) {
    this.saveUserSession(user);
    this.showMessage('登录成功，正在跳转...', 'success');
    
    setTimeout(() => {
      this.redirectToMain();
    }, 1500);
  }

  // 记住密码
  rememberPassword(username, password) {
    localStorage.setItem('rememberedUsername', username);
    localStorage.setItem('rememberedPassword', password);
  }

  // 清除记住的密码
  clearRememberedPassword() {
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberedPassword');
  }

  // 加载记住的密码
  loadRememberedPassword() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember-password');

    if (rememberedUsername && usernameInput) {
      usernameInput.value = rememberedUsername;
    }
    if (rememberedPassword && passwordInput) {
      passwordInput.value = rememberedPassword;
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
    
    this.updateLoginButton();
  }

  // 生成用户名
  generateUserName(userType, phone) {
    const suffix = phone.slice(-4);
    switch (userType) {
      case 'student':
        return `同学${suffix}`;
      case 'admin':
        return `管理员${suffix}`;
      default:
        return `用户${suffix}`;
    }
  }

  // 保存用户会话
  saveUserSession(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // 跳转到主页面
  redirectToMain() {
    window.location.href = './index.html';
  }

  // 显示消息
  showMessage(message, type) {
    const messageEl = document.getElementById('login-message');
    messageEl.textContent = message;
    messageEl.className = `login-message ${type}`;
    
    // 3秒后清除消息
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'login-message';
    }, 3000);
  }

  // 登出功能
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    window.location.href = './login.html';
  }

  // 获取当前用户
  getCurrentUser() {
    if (!this.currentUser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    }
    return this.currentUser;
  }

  // 检查用户权限
  checkPermission(requiredType) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (requiredType === 'admin') {
      return user.userType === 'admin';
    }
    
    return true; // student类型可以访问所有普通功能
  }
}

// 全局登录系统实例
window.loginSystem = new LoginSystem();

// 导出供其他页面使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoginSystem;
}
