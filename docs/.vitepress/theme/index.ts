import { BlogTheme } from "@sugarat/theme";
import { ref } from "vue";
import fetchBaiduData from "../../api/fetchBaiduData";
// 自定义样式重载
import "./index.scss";

// 自定义主题色
// import "./user-theme.css";

export default {
  ...BlogTheme,
  enhanceApp({ app }) {
    const visitCount = ref([[0, 0, 0, 0]]);
    const visitCurr = ref([[0, 0, 0, 0]]);

    app.provide("visitCount", visitCount);
    app.provide("visitCurr", visitCurr);

    fetchBaiduData("2025-01-01").then((res) => {
      visitCount.value = res;
    });
    fetchBaiduData().then((res) => {
      visitCurr.value = res;
    });
  },
};
