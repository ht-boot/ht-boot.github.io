async function fetchBaiduDate(startDate?: string) {
  const url =
    `&start_date=${startDate}` +
    `&end_date=${new Date().toISOString().split("T")[0]}`;

  try {
    const resp = await fetch(
      `https://baidu-proxy-gamma.vercel.app/api/baidu?${url}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!resp.ok) {
      throw new Error(`Baidu API Error: ${resp.status}`);
    }
    const {
      result: { sum },
    } = await resp.json();
    return sum;
  } catch (err) {
    console.error("Fetch Baidu API Failed:", err);
  }
}

export default fetchBaiduDate;
