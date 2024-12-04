document.addEventListener("DOMContentLoaded", () => {
    const searchFrame = document.getElementById("search-frame");
    const summaryDiv = document.getElementById("summary");
    const relatedSearchInput = document.getElementById("related-search");
    const relatedResultsDiv = document.getElementById("related-results");
  
    // 当 iframe 页面加载时监听链接点击
    searchFrame.addEventListener("load", () => {
      const iframeDoc = searchFrame.contentDocument || searchFrame.contentWindow.document;
  
      // 查找搜索结果的链接
      iframeDoc.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
          const link = event.target.href;
  
          // 仅处理外部链接
          if (link && link.startsWith("http")) {
            event.preventDefault();
            fetchSummary(link);
          }
        }
      });
    });
  
    // 调用 Chrome 内置 Summarizer API
    async function fetchSummary(url) {
      try {
        const response = await fetch(`chrome://summarizer-api/summarize?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          summaryDiv.textContent = data.summary || "No summary available.";
          fetchRelatedSearch(data.keywords);
        } else {
          summaryDiv.textContent = "Failed to fetch summary.";
        }
      } catch (error) {
        summaryDiv.textContent = "Error fetching summary.";
      }
    }
  
    // 根据关键词执行相关搜索
    async function fetchRelatedSearch(keywords) {
      try {
        const query = keywords.join(" ");
        relatedResultsDiv.innerHTML = `<iframe src="https://www.google.com/search?q=${encodeURIComponent(query)}" sandbox="allow-same-origin allow-scripts allow-popups" style="width:100%;height:100%;border:none;"></iframe>`;
      } catch (error) {
        relatedResultsDiv.textContent = "Error fetching related search results.";
      }
    }
  
    // 处理手动相关搜索
    relatedSearchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const query = relatedSearchInput.value;
        relatedResultsDiv.innerHTML = `<iframe src="https://www.google.com/search?q=${encodeURIComponent(query)}" sandbox="allow-same-origin allow-scripts allow-popups" style="width:100%;height:100%;border:none;"></iframe>`;
      }
    });
  });
  