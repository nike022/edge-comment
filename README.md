# EdgeComment - 边缘留言板系统

<div align="center">

![ESA Declaration](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

**本项目由阿里云ESA提供加速、计算和保护**

一个基于阿里云ESA边缘计算平台构建的无服务器留言板系统，让留言互动变得简单高效。

</div>

---

## 📋 项目介绍

EdgeComment是一个完全运行在边缘的留言板系统,充分利用阿里云ESA的边缘计算能力,实现了:

- **零后端部署** - 无需传统服务器,完全基于ESA边缘函数和EdgeKV
- **全球加速** - 依托ESA全球节点,留言提交和数据访问毫秒级响应
- **安全可靠** - JWT认证保护管理功能,SHA-256密码加密,数据安全存储在EdgeKV

### 🎯 三大评选维度亮点

#### 🎨 创意卓越
- **现代化留言界面** - 基于React 18 + TypeScript + Tailwind CSS构建
- **实时留言展示** - 所有访客可以实时查看留言内容
- **优雅的UI设计** - 深色主题,流畅动画,提供优秀的用户体验
- **管理员功能** - 支持管理员登录后删除不当留言

#### 💼 应用价值
- **开箱即用** - 部署后即可使用,无需复杂配置
- **真实场景应用** - 适用于网站留言、用户反馈、活动评论等多种场景
- **数据管理完善** - 支持留言查看、删除等管理操作
- **零成本运营** - 基于ESA边缘计算,无需维护服务器,成本极低
- **全球可用** - 依托ESA全球节点,任何地区都能快速访问

#### 🔬 技术探索
- **完整的ESA生态应用** - 深度整合ESA Pages + 边缘函数 + EdgeKV
- **边缘计算最佳实践** - 展示了如何在边缘构建完整的留言板应用
- **无服务器架构** - 真正的Serverless,自动扩展,按需付费
- **现代前端技术栈** - React 18 + TypeScript + Vite + Tailwind CSS
- **安全认证机制** - JWT + SHA-256,企业级安全标准

---

## ✨ 功能特性

### 留言功能
- 💬 支持昵称、邮箱、留言内容
- 📝 多行文本输入,支持换行
- 🕐 自动记录留言时间
- 🌐 记录访客IP地址

### 管理功能
- 🔐 JWT认证保护管理功能
- 🗑️ 管理员可删除不当留言
- 🔄 实时刷新留言列表
- 👤 管理员登录/登出

### 安全特性
- 🔒 密码哈希存储:SHA-256加密,安全可靠
- 🎫 JWT Token认证:7天有效期,自动过期保护
- 🚫 权限控制:留言提交公开,删除需认证
- 🛡️ CORS配置:支持跨域请求,安全可控

---

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **Tailwind CSS** - 实用优先的CSS框架

### 边缘计算
- **ESA Pages** - 静态资源托管和全球加速
- **ESA Edge Functions** - 边缘函数处理业务逻辑
  - `submit-comment` - 处理留言提交
  - `get-comments` - 获取留言列表
  - `auth` - 用户认证和JWT生成
  - `delete-comment` - 删除留言(需认证)
- **EdgeKV** - 边缘键值存储
  - 存储留言数据
  - 存储管理员密码哈希
  - 存储JWT密钥

### 安全
- **Web Crypto API** - 密码哈希和JWT签名
- **JWT** - 无状态认证
- **HMAC-SHA256** - JWT签名算法

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd edge-comment
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建项目

```bash
npm run build
```

### 5. 部署到ESA Pages

1. 将项目推送到GitHub
2. 登录[阿里云ESA控制台](https://esa.console.aliyun.com/)
3. 创建Pages项目,连接GitHub仓库
4. 配置构建命令:`npm run build`
5. 配置输出目录:`dist`
6. 部署完成

### 6. 配置Edge Functions

在ESA控制台创建以下Edge Functions:

#### submit-comment函数
- 代码:`functions/submit-comment/src/index.js`
- 路由:`/api/submit-comment`

#### get-comments函数
- 代码:`functions/get-comments/src/index.js`
- 路由:`/api/get-comments`

#### auth函数
- 代码:`functions/auth/src/index.js`
- 路由:`/api/auth`

#### delete-comment函数
- 代码:`functions/delete-comment/src/index.js`
- 路由:`/api/delete-comment`

### 7. 配置EdgeKV

1. 在ESA控制台创建EdgeKV命名空间:`edge-comment`
2. 打开 `setup-password.html` 生成密码哈希和JWT密钥
3. 在EdgeKV中添加以下键值对:
   - `admin_password_hash`: 你的密码哈希
   - `jwt_secret`: 生成的JWT密钥

---

## 📖 使用说明

### 提交留言

1. 访问网站
2. 输入昵称和留言内容(邮箱可选)
3. 点击发送按钮
4. 留言会立即显示在列表中

### 管理留言

1. 在页面顶部输入管理员密码
2. 点击"登录"按钮
3. 登录后可以看到每条留言旁边的删除按钮
4. 点击删除按钮可以删除不当留言

---

## 🏗️ 项目架构

```
edge-comment/
├── src/                      # 前端源码
│   ├── components/
│   │   ├── CommentBoard.tsx  # 主留言板组件
│   │   ├── CommentMessage.tsx # 单条留言组件
│   │   └── CommentInput.tsx  # 留言输入组件
│   ├── types/
│   │   └── comment.ts        # TypeScript类型定义
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
├── functions/               # Edge Functions
│   ├── submit-comment/      # 留言提交函数
│   ├── get-comments/        # 获取留言函数
│   ├── auth/                # 认证函数
│   └── delete-comment/      # 删除留言函数
├── setup-password.html      # 密码配置工具
└── README.md               # 项目文档
```

---

## 🔒 安全说明

- 管理员密码使用SHA-256哈希存储,不存储明文
- JWT Token有效期7天,过期自动失效
- 删除接口需要JWT认证
- 留言提交接口公开,但记录IP地址
- 支持CORS,可配置允许的域名

---

## 💰 成本估算

基于阿里云ESA的定价:

**EdgeKV费用:**
- Read: 0.7元/百万次
- Write/Delete: 6.5元/百万次
- 存储: 0.1元/GB/天

**示例场景(每天100条留言,1000次访问):**
- 每天费用: 约0.03元
- 每月费用: 约0.9元

**边缘函数:**
- 免费版: 10万次/天(足够中小型应用)
- 付费版: 5元/百万次

---

## 📊 性能优势

- **边缘计算** - 全球节点就近响应,延迟低至毫秒级
- **无服务器** - 自动扩展,无需担心并发压力
- **CDN加速** - 静态资源全球分发,加载速度极快
- **按需付费** - 只为实际使用付费,成本极低

---

## 🏆 参赛信息

本项目参加**阿里云ESA Pages 边缘开发大赛**

### 项目亮点
- **创意卓越**: 现代化留言界面,实时展示,优雅的UI设计
- **应用价值**: 开箱即用,真实场景应用,零成本运营
- **技术探索**: 完整的ESA生态应用,边缘计算最佳实践,无服务器架构

---

## 📄 开源协议

MIT License

---

## 👨‍💻 作者

基于阿里云ESA官方模板开发

---

## 🙏 致谢

感谢阿里云ESA团队提供的强大边缘计算平台和官方模板,让这个项目得以快速实现。

**本项目由阿里云ESA提供加速、计算和保护**
