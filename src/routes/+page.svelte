<script>
  let query = '';
  let result = null;
  let error = null;

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  }

  async function search() {
    error = null;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      result = await res.json();
    } catch (err) {
      error = err.message;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      search();
    }
  }

  function decodeURL(url) {
    return decodeURIComponent(url.replace(/&amp;/g, '&'));
  }

  async function save(item) {
    const downloadUrl = decodeURL(item.enclosure["@attributes"].url);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadUrl }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save to PLEX');
      }

      alert('The NZB file has been added to SABnzbd.');
    } catch (err) {
      alert(`Failed to save to PLEX: ${err.message}`);
    }
  }
</script>

<main>
  <div class="search-bar">
    <input 
      bind:value={query} 
      placeholder="Search..." 
      on:keypress={handleKeyPress}
    />
    <button on:click={search}>Search</button>
  </div>

  {#if error}
    <p style="color: red;">{error}</p>
  {:else if result}
    <div class="items">
      {#each [...result.channel.item].sort((a, b) => {
          const grabsA = parseInt(a.attr.find(attr => attr["@attributes"].name === "grabs")["@attributes"].value);
          const grabsB = parseInt(b.attr.find(attr => attr["@attributes"].name === "grabs")["@attributes"].value);
          return grabsB - grabsA;
    }) as item}
        <div class="item">
          <h2><a href={item.link} target="_blank">{item.title}</a></h2>
          <p><strong>Category:</strong> {item.category}</p>
          <p><strong>Published:</strong> {item.pubDate}</p>
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Grabs:</strong> {item.attr.find(a => a["@attributes"].name === "grabs")["@attributes"].value}</p>
          
          <!-- Convert size to human-readable format -->
          <p><strong>Size:</strong> {formatBytes(item.attr.find(a => a["@attributes"].name === "size")["@attributes"].value)}</p>
          
          <!-- Download NZB link -->
          <p><a href={decodeURL(item.enclosure["@attributes"].url)} target="_blank">Download NZB</a></p>

          <!-- Save button -->
          <button on:click={() => save(item)}>Download to Server</button>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 100%;
    margin: auto;
    font-family: sans-serif;
    padding: 20px;
  }

  .search-bar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  input {
    width: 80%;
    padding: 8px;
    margin-top: 10px;
    box-sizing: border-box;
  }

  button {
    padding: 8px 12px;
    margin-left: 8px;
    flex-shrink: 0;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .item {
    width: 100%;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-sizing: border-box;
  }

  .item h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .item p {
    margin: 5px 0;
  }

  a {
    color: #0073e6;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button {
    background-color: #0073e6;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }

  button:hover {
    background-color: #005bb5;
  }
</style>
