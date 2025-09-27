import { BlogTheme } from "@sugarat/theme";
import { EnhanceAppContext } from "vitepress";
import { ref } from "vue";
import fetchBaiduData from "../../api/fetchBaiduData";
// 自定义样式重载
import "./index.scss";

// 自定义主题色
// import "./user-theme.css";

export default {
  ...BlogTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    // 先调用原主题的 enhanceApp
    if (typeof BlogTheme.enhanceApp === "function") {
      BlogTheme.enhanceApp(ctx);
    }

    const { app } = ctx;
    const visitCount = ref([[0, 0, 0, 0]]);
    const visitCurr = ref([[0, 0, 0, 0]]);

    app.provide("visitCount", visitCount);
    app.provide("visitCurr", visitCurr);

    // 仅在客户端调用，防止npm run build时出错
    if (typeof window !== "undefined") {
      fetchBaiduData("2025-01-01").then((res) => {
        visitCount.value = res;
      });
      fetchBaiduData().then((res) => {
        visitCurr.value = res;
      });
    }
  },
};
