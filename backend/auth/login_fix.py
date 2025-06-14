"""
紧急登录修复工具 - 直接往localStorage中添加模拟登录信息

用法: 
1. 在浏览器打开开发者工具
2. 在控制台中粘贴以下代码
3. 添加临时管理员登录
"""

# ------------- 浏览器控制台代码 -------------
"""
// 添加临时管理员登录
const adminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@smartfarm.com',
  role: 'admin',
  is_active: true,
  last_login: new Date().toISOString(),
  created_at: '2023-01-01T00:00:00Z',
  updated_at: new Date().toISOString()
};

// 生成模拟token
const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

// 保存到localStorage
localStorage.setItem('smart_farm_token', mockToken);
localStorage.setItem('smart_farm_user', JSON.stringify(adminUser));

console.log('临时登录已添加！现在刷新页面即可自动登录为管理员。');
"""
# ----------------------------------------

print("""
=================================================
            紧急登录修复工具
=================================================

如果无法登录系统，您可以使用此紧急方法：

1. 打开浏览器，访问系统登录页面
2. 按F12打开开发者工具
3. 切换到"控制台(Console)"选项卡
4. 将以下代码复制粘贴到控制台中：

// 添加临时管理员登录
const adminUser = {
  id: 1,
  username: 'admin',
  email: 'admin@smartfarm.com',
  role: 'admin',
  is_active: true,
  last_login: new Date().toISOString(),
  created_at: '2023-01-01T00:00:00Z',
  updated_at: new Date().toISOString()
};

// 生成模拟token
const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

// 保存到localStorage
localStorage.setItem('smart_farm_token', mockToken);
localStorage.setItem('smart_farm_user', JSON.stringify(adminUser));

console.log('临时登录已添加！现在刷新页面即可自动登录为管理员。');

5. 按Enter执行代码
6. 刷新页面，您将自动以管理员身份登录系统

注意：这是一个临时解决方案，只在前端模拟了登录状态。
一旦系统恢复正常，请使用正常的登录流程。
=================================================
""") 