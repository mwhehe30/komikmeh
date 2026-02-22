# 🔌 API Testing untuk Notifikasi

## Base URL
```
https://unofficial-komikcast-api.vercel.app
```

## Endpoints yang Digunakan

### 1. Get Series Chapters
```
GET /series/{slug}/chapters
```

**Digunakan untuk**: Mengambil daftar chapter dan mendeteksi chapter terbaru

**Example Request**:
```javascript
const slug = 'one-piece';
const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
const data = await res.json();
```

**Example Response**:
```json
{
  "data": [
    {
      "data": {
        "index": "1234",
        "title": "Chapter 1234",
        "slug": "one-piece-chapter-1234"
      },
      "chapterIndex": "1234"
    },
    {
      "data": {
        "index": "1233",
        "title": "Chapter 1233"
      }
    }
  ]
}
```

**Yang Diambil**:
```javascript
const latestChapter = data.data[0];
const chapterIndex = latestChapter.data?.index || latestChapter.chapterIndex;
// chapterIndex = "1234"
```

## Testing API Response

### Test Single Series

```javascript
async function testSeriesAPI(slug) {
    console.log(`Testing: ${slug}`);
    
    try {
        const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
        
        console.log('Status:', res.status);
        
        if (!res.ok) {
            console.error('❌ Failed:', res.status);
            return null;
        }
        
        const data = await res.json();
        console.log('Response:', data);
        
        if (data && data.data && data.data.length > 0) {
            const latest = data.data[0];
            const chapterIndex = latest.data?.index || latest.chapterIndex;
            console.log('✅ Latest chapter:', chapterIndex);
            return chapterIndex;
        } else {
            console.log('⚠️ No chapters found');
            return null;
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        return null;
    }
}

// Test
await testSeriesAPI('one-piece');
```

### Test All Bookmarks

```javascript
async function testAllBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    console.log(`Testing ${bookmarks.length} bookmarks...\n`);
    
    const results = [];
    
    for (const series of bookmarks) {
        const slug = series.data.slug;
        const title = series.data.title;
        
        console.log(`📖 ${title}...`);
        
        try {
            const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
            
            if (!res.ok) {
                console.log(`   ❌ HTTP ${res.status}`);
                results.push({ slug, title, status: 'failed', error: `HTTP ${res.status}` });
                continue;
            }
            
            const data = await res.json();
            
            if (data && data.data && data.data.length > 0) {
                const latest = data.data[0];
                const chapterIndex = latest.data?.index || latest.chapterIndex;
                console.log(`   ✅ Chapter ${chapterIndex}`);
                results.push({ slug, title, status: 'success', chapter: chapterIndex });
            } else {
                console.log(`   ⚠️ No chapters`);
                results.push({ slug, title, status: 'no_chapters' });
            }
        } catch (err) {
            console.log(`   ❌ ${err.message}`);
            results.push({ slug, title, status: 'error', error: err.message });
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== RESULTS ===');
    console.table(results);
    
    const success = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
    
    console.log(`\n✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    
    return results;
}

// Run test
await testAllBookmarks();
```

### Test API Performance

```javascript
async function testAPIPerformance(slug) {
    console.log(`Performance test for: ${slug}\n`);
    
    const times = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        try {
            const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
            await res.json();
            
            const end = performance.now();
            const duration = end - start;
            times.push(duration);
            
            console.log(`Request ${i + 1}: ${duration.toFixed(2)}ms`);
        } catch (err) {
            console.error(`Request ${i + 1}: Failed - ${err.message}`);
        }
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log('\n=== PERFORMANCE ===');
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${min.toFixed(2)}ms`);
    console.log(`Max: ${max.toFixed(2)}ms`);
    
    return { avg, min, max, times };
}

// Test
await testAPIPerformance('one-piece');
```

## Mock API Response (Testing)

Untuk testing tanpa API call:

```javascript
// Mock function
function mockGetSeriesChapters(slug) {
    return Promise.resolve({
        data: [
            {
                data: {
                    index: "999",
                    title: "Chapter 999",
                    slug: `${slug}-chapter-999`
                },
                chapterIndex: "999"
            },
            {
                data: {
                    index: "998",
                    title: "Chapter 998"
                }
            }
        ]
    });
}

// Test dengan mock
const mockData = await mockGetSeriesChapters('test-series');
console.log('Mock data:', mockData);
```

## Error Handling

### Common Errors

**1. Network Error**
```javascript
try {
    const res = await fetch(url);
} catch (err) {
    if (err.message.includes('Failed to fetch')) {
        console.error('Network error - check internet connection');
    }
}
```

**2. HTTP Errors**
```javascript
if (!res.ok) {
    if (res.status === 404) {
        console.error('Series not found');
    } else if (res.status === 429) {
        console.error('Rate limited - too many requests');
    } else if (res.status >= 500) {
        console.error('Server error');
    }
}
```

**3. Invalid Response**
```javascript
const data = await res.json();
if (!data || !data.data || !Array.isArray(data.data)) {
    console.error('Invalid response format');
}
```

### Robust API Call

```javascript
async function robustGetChapters(slug, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(
                `https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`,
                { 
                    cache: 'no-store',
                    signal: AbortSignal.timeout(10000) // 10s timeout
                }
            );
            
            if (!res.ok) {
                if (res.status === 404) {
                    return null; // Don't retry for 404
                }
                throw new Error(`HTTP ${res.status}`);
            }
            
            const data = await res.json();
            
            if (!data || !data.data || !Array.isArray(data.data)) {
                throw new Error('Invalid response format');
            }
            
            return data;
            
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err.message);
            
            if (i === retries - 1) {
                throw err; // Last attempt, throw error
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

// Usage
try {
    const data = await robustGetChapters('one-piece');
    console.log('Success:', data);
} catch (err) {
    console.error('All retries failed:', err);
}
```

## Rate Limiting

API mungkin memiliki rate limiting. Best practices:

```javascript
// Add delay between requests
async function fetchWithDelay(slug, delay = 500) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
}

// Batch processing with rate limit
async function batchFetch(slugs, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < slugs.length; i += concurrency) {
        const batch = slugs.slice(i, i + concurrency);
        const promises = batch.map(slug => fetchWithDelay(slug));
        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults);
    }
    
    return results;
}
```

## Integration Test

Test full notification flow dengan API:

```javascript
async function testNotificationFlow() {
    console.log('=== NOTIFICATION FLOW TEST ===\n');
    
    // 1. Setup
    console.log('1. Setup...');
    localStorage.setItem('notif_enabled', 'true');
    console.log('   ✅ Enabled\n');
    
    // 2. Get bookmarks
    console.log('2. Get bookmarks...');
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    console.log(`   ✅ Found ${bookmarks.length} bookmarks\n`);
    
    if (bookmarks.length === 0) {
        console.log('   ❌ No bookmarks to test');
        return;
    }
    
    // 3. Initialize history
    console.log('3. Initialize history...');
    const history = {};
    
    for (const series of bookmarks) {
        const slug = series.data.slug;
        console.log(`   📖 ${series.data.title}...`);
        
        try {
            const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
            const data = await res.json();
            
            if (data?.data?.[0]) {
                const chapter = data.data[0].data?.index || data.data[0].chapterIndex;
                history[slug] = chapter;
                console.log(`      ✅ Chapter ${chapter}`);
            }
        } catch (err) {
            console.log(`      ❌ ${err.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    localStorage.setItem('update_history', JSON.stringify(history));
    console.log(`   ✅ Initialized ${Object.keys(history).length} series\n`);
    
    // 4. Simulate old history
    console.log('4. Simulate old history...');
    const firstSlug = Object.keys(history)[0];
    if (firstSlug) {
        history[firstSlug] = parseInt(history[firstSlug]) - 1;
        localStorage.setItem('update_history', JSON.stringify(history));
        console.log(`   ✅ ${firstSlug} set to chapter ${history[firstSlug]}\n`);
    }
    
    // 5. Check for updates
    console.log('5. Check for updates...');
    const updateHistory = JSON.parse(localStorage.getItem('update_history') || '{}');
    const updates = [];
    
    for (const series of bookmarks) {
        const slug = series.data.slug;
        
        try {
            const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
            const data = await res.json();
            
            if (data?.data?.[0]) {
                const latest = data.data[0].data?.index || data.data[0].chapterIndex;
                const lastKnown = updateHistory[slug];
                
                if (lastKnown && latest.toString() !== lastKnown.toString()) {
                    updates.push({ title: series.data.title, chapter: latest });
                    console.log(`   🔔 ${series.data.title} - Chapter ${latest}`);
                }
            }
        } catch (err) {
            console.log(`   ❌ ${series.data.title}: ${err.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n   ✅ Found ${updates.length} updates\n`);
    
    // 6. Send notification
    if (updates.length > 0 && Notification.permission === 'granted') {
        console.log('6. Send notification...');
        new Notification('Test Update!', {
            body: `${updates[0].title} - Chapter ${updates[0].chapter}`,
            icon: '/icon-192x192.png'
        });
        console.log('   ✅ Notification sent\n');
    }
    
    console.log('=== TEST COMPLETE ===');
}

// Run full test
await testNotificationFlow();
```

## Debugging API Issues

```javascript
// Enable verbose logging
async function debugAPICall(slug) {
    console.log('=== DEBUG API CALL ===');
    console.log('Slug:', slug);
    console.log('URL:', `https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
    console.log('\nFetching...');
    
    const start = performance.now();
    
    try {
        const res = await fetch(`https://unofficial-komikcast-api.vercel.app/series/${slug}/chapters`);
        
        const end = performance.now();
        
        console.log('\nResponse:');
        console.log('  Status:', res.status);
        console.log('  OK:', res.ok);
        console.log('  Duration:', `${(end - start).toFixed(2)}ms`);
        console.log('  Headers:', Object.fromEntries(res.headers.entries()));
        
        const text = await res.text();
        console.log('\nRaw Response:');
        console.log(text.substring(0, 500)); // First 500 chars
        
        const data = JSON.parse(text);
        console.log('\nParsed Data:');
        console.log('  Has data:', !!data.data);
        console.log('  Data length:', data.data?.length);
        console.log('  First item:', data.data?.[0]);
        
        return data;
    } catch (err) {
        console.error('\nError:', err);
        console.error('Stack:', err.stack);
        throw err;
    }
}

// Debug
await debugAPICall('one-piece');
```

---

**Note**: API ini adalah unofficial API. Bisa berubah atau down sewaktu-waktu. Selalu handle errors dengan graceful degradation.
