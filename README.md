# Taipei Smart Traffic 智慧交通管理系統 🚥

## 📖 系統簡介
本專案為一個「全端架構 (Full-Stack)」的智慧交通管理平台。系統整合了 Google Maps 與交通部 TDX 平台資料，提供即時路況查詢、公車動態、周邊停車場與 Ubike 站點資訊。同時具備「交通事故通報」與「遠端號誌模擬控制」功能。

系統專為三種不同角色設計：**一般民眾**、**警務人員**與**管理單位**，各自擁有專屬的操作介面與權限，實現一體化的城市交通治理模擬。

---

## ✨ 核心功能
- **🛡️ 角色權限管理**：支援民眾、警察、管理單位三種身分註冊與登入。
- **🗺️ 互動式交通地圖**：整合 Google Maps API，即時顯示紅綠燈狀態與事故發生地點。
- **🚌 TDX 即時數據串接**：一鍵查詢台北市即時公車動態、Ubike 剩餘車輛與周邊停車場空位。
- **🚨 事故通報與派單**：民眾可點擊地圖回報異常事故，警務人員可於後台審核並更新事故處理狀態。
- **🚦 號誌模擬控制台**：管理單位可即時監控路口號誌，並支援手動介入（切換尖峰/離峰秒數、閃黃燈模式、強制變換燈號）。

---

## 🛠️ 技術架構
- **前端 (Frontend)**: React 19, Vite, Tailwind CSS v4, Zustand, `@vis.gl/react-google-maps`
- **後端 (Backend)**: Node.js, Express.js, TypeScript
- **資料庫 (Database)**: SQLite (搭配 Prisma ORM)

---

## 🚀 快速開始 (Getting Started)

### 1. 安裝依賴套件
請確保您的環境中已安裝 Node.js (建議 v18 以上)。
```bash
npm install
```

### 2. 環境變數設定
請在專案最外層根目錄建立 `.env` 檔案，並填入以下必要金鑰：
```env
VITE_GOOGLE_MAPS_API_KEY=您的_Google_Maps_API_Key
VITE_TDX_CLIENT_ID=您的_TDX_Client_ID
VITE_TDX_CLIENT_SECRET=您的_TDX_Client_Secret
```

### 3. 初始化資料庫與種子資料
```bash
cd server
npx prisma db push
npx ts-node seed.ts
cd ..
```

### 4. 一鍵啟動專案
在專案根目錄下，執行以下指令：
```bash
npm run dev
```
此指令會透過 `concurrently` 同時啟動：
- 前端網頁伺服器：[http://localhost:5173](http://localhost:5173)
- 後端 API 伺服器：[http://localhost:3001](http://localhost:3001)

---

## 👥 測試帳號
系統已內建三個不同權限的測試帳號供快速體驗：
- **一般民眾**：帳號 `user` / 密碼 `user`
- **警務人員**：帳號 `police` / 密碼 `police`
- **管理單位**：帳號 `admin` / 密碼 `admin`

*(提示：您也可以在登入畫面點擊註冊，自由選擇身分建立專屬帳號)*
