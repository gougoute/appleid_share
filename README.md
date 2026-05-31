# Apple ID 共享 · 静态前端（可公开到 GitHub）

本目录**仅含 HTML / CSS / JS**，不含任何后端逻辑。页面通过 `config.js` 请求你私有服务器上的 API。

## 上传到 GitHub

**方式一：单独建一个公开仓库（推荐）**

1. 在 GitHub 新建仓库，例如 `appleid-page`
2. 把 **`static-site` 目录里的全部文件** 推到仓库根目录（不是推整个 `appleid` 项目）
3. 仓库 Settings → Pages → Source 选 **Deploy from branch** → `main` / `/ (root)`

**方式二：放在 monorepo 子目录**

- Pages 源选 `/static-site` 文件夹（若 GitHub 支持该路径）

## 配置 API 地址

编辑 `config.js`：

```javascript
window.APP_CONFIG = {
  API_URL: 'https://appleid.gougouti.com/api/aggregate',
};
```

## 服务器端必须配置 CORS

静态页在 `https://xxx.github.io` 访问时，浏览器会跨域请求你的 API。请在**私有服务器**的环境变量中设置允许的来源，例如：

```bash
CORS_ORIGINS=https://你的用户名.github.io,https://appleid.gougouti.com
```

未设置时，默认允许：`appleid.gougouti.com`、`*.github.io`、本地调试。

## 私有后端不要进这个仓库

`app.js`、数据源抓取逻辑请只部署在服务器，使用**私有仓库**或仅 SFTP 上传，不要提交到本公开仓库。
