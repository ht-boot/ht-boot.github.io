async function fetchBaiduPlugin(startDate?: string) {
  // 只在 build 阶段运行，避免 dev 时浪费请求
  // if (process.env.NODE_ENV !== "production") return;
  const refreshToken =
    "122.864fd51c4696859ec222e28e55ef82e8.Y35xBzliGSVSOIED3aRp_vK-UHkvd01SY3QCq7D.1-SMzQ";
  const accessToken =
    "121.cdc5ecfc710aaae6c60b62670833cf4f.Y5WFGcrNrqM73-z6bl3f2ftj7d1uryBZj7t8e3n.HpuiAg";
  const siteId = "22468484";

  if (!accessToken || !siteId) {
    console.warn("⚠️ 缺少 BAIDU_ACCESS_TOKEN 或 BAIDU_SITE_ID 环境变量");
    return;
  }

  const url =
    `/baidu-api/rest/2.0/tongji/report/getData` +
    `?access_token=${accessToken}` +
    `&site_id=${siteId}` +
    `&method=source/all/a` +
    `&start_date=${startDate}` +
    `&end_date=${new Date().toISOString().split("T")[0]}` +
    `&metrics=pv_count,visit_count,visitor_count,ip_count`;

  console.log("Fetching Baidu data...");

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`❌ Baidu API Error: ${resp.status}`);
    }
    const {
      result: { sum },
    } = await resp.json();
    return sum;
  } catch (err) {
    console.error("Fetch Baidu API Failed:", err);
  }
}

export default fetchBaiduPlugin;
