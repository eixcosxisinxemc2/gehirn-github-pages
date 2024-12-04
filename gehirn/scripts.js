(async () => {
    const summaryOutput = document.getElementById('summary-output');
    const relatedLinks = document.getElementById('related-links');
  
    let summarizer;
  
    // Summarizer API Initialization
    async function initializeSummarizer() {
      const capabilities = await self.ai.summarizer.capabilities();
      const available = capabilities.available;
  
      if (available === 'no') {
        summaryOutput.textContent = 'Summarizer API is not available on this browser.';
        return null;
      }
  
      const options = {
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
      };
  
      if (available === 'readily') {
        return await self.ai.summarizer.create(options);
      } else if (available === 'after-download') {
        const summarizer = await self.ai.summarizer.create({
          ...options,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              summaryOutput.textContent = `Downloading model: ${e.loaded} of ${e.total} bytes.`;
            });
          },
        });
        await summarizer.ready;
        return summarizer;
      }
    }
  
    summarizer = await initializeSummarizer();
  
    // Function to fetch and display related links
    async function fetchRelatedLinks(query) {
      const apiKey = "AqrWnS/ueciP4YBI/fYeb0+QZ2LWw1/LsankyrbL2mDIVs3bcF+shXdtwN/F4AR2KHWiPOVKN7QP6R7nI9ZdLwcAAAB0eyJvcmlnaW4iOiJodHRwczovL2dlaGlybi1uZXJ2LmdpdGh1Yi5pbzo0NDMiLCJmZWF0dXJlIjoiQUlTdW1tYXJpemF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=";
      const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
      )}&key=${apiKey}&cx=YOUR_SEARCH_ENGINE_ID`;
  
      try {
        const response = await fetch(searchUrl);
        const data = await response.json();
  
        // Remove current page link from results
        const currentUrl = window.location.href;
        const filteredItems = data.items.filter(item => item.link !== currentUrl);
  
        relatedLinks.innerHTML = '';
        filteredItems.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
          relatedLinks.appendChild(li);
        });
      } catch (error) {
        console.error('Error fetching related links:', error);
        relatedLinks.innerHTML = '<li>Failed to load related links.</li>';
      }
    }
  
    // Fetch and summarize content of the current webpage
    async function summarizePage() {
      if (!summarizer) {
        summaryOutput.textContent = 'Summarizer is not initialized.';
        return;
      }
  
      try {
        const text = document.body.innerText.trim(); // Extract visible text from the current page
        const summary = await summarizer.summarize(text, {
          context: 'Summarize the content of this webpage.',
        });
        summaryOutput.textContent = summary;
  
        // Fetch related links based on the summary
        await fetchRelatedLinks(summary);
      } catch (error) {
        console.error('Error summarizing page:', error);
        summaryOutput.textContent = 'Failed to summarize the page.';
      }
    }
  
    // Run summarizer on page load
    window.addEventListener('DOMContentLoaded', summarizePage);
  })();
  