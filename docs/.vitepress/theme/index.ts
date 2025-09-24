import { BlogTheme } from "@sugarat/theme";
import fetchBaiduData from "../../api/fetchBaiduData";
// 自定义样式重载
import "./index.scss";

// 自定义主题色
// import "./user-theme.css";

export default {
  ...BlogTheme,
  async enhanceApp({ app }) {
    const visitCount = await fetchBaiduData("2025-01-01");
    const visitCurr = await fetchBaiduData();
    app.provide("visitCount", visitCount);
    app.provide("visitCurr", visitCurr);
  },
};
