const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Set up template engine (simple HTML with placeholders)
app.set('view engine', 'html');

// Helper function to read blog posts
function getBlogPosts() {
  try {
    const data = fs.readFileSync('blog-posts.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

// Helper function to get a single blog post
function getBlogPost(slug) {
  const posts = getBlogPosts();
  return posts.find(post => post.slug === slug);
}

// Home page route
app.get('/', (req, res) => {
  const posts = getBlogPosts();
  const recentPosts = posts.slice(0, 3); // Get 3 most recent posts
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clinician to Creator - Home</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <nav class="navbar">
            <div class="nav-container">
                <a href="/" class="nav-brand">Clinician to Creator</a>
                <div class="nav-links">
                    <a href="/" class="nav-link">Home</a>
                    <a href="/blog" class="nav-link">Blog</a>
                </div>
            </div>
        </nav>
        
        <main class="main-content">
            <div class="container">
                <header class="hero">
                    <h1>Welcome to My Coding Journey</h1>
                    <p>From healthcare professional to software developer - documenting my transition into the world of code.</p>
                </header>
                
                <section class="recent-posts">
                    <h2>Recent Blog Posts</h2>
                    <div class="posts-grid">
                        ${recentPosts.map(post => `
                            <article class="post-preview">
                                <h3><a href="/blog/${post.slug}">${post.title || 'Untitled'}</a></h3>
                                <p class="post-meta">${post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</p>
                                <p class="post-excerpt">${post.excerpt || 'No preview available'}</p>
                                <a href="/blog/${post.slug}" class="read-more">Read More</a>
                            </article>
                        `).join('')}
                    </div>
                </section>
            </div>
        </main>
        
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Clinician to Creator. All rights reserved.</p>
            </div>
        </footer>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Blog listing page
app.get('/blog', (req, res) => {
  const posts = getBlogPosts();
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blog - Clinician to Creator</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <nav class="navbar">
            <div class="nav-container">
                <a href="/" class="nav-brand">Clinician to Creator</a>
                <div class="nav-links">
                    <a href="/" class="nav-link">Home</a>
                    <a href="/blog" class="nav-link">Blog</a>
                </div>
            </div>
        </nav>
        
        <main class="main-content">
            <div class="container">
                <header class="page-header">
                    <h1>Blog Posts</h1>
                    <p>My journey from healthcare to software development</p>
                </header>
                
                <div class="blog-posts">
                    ${posts.map(post => `
                        <article class="blog-post">
                            <h2><a href="/blog/${post.slug}">${post.title || 'Untitled'}</a></h2>
                            <p class="post-meta">${post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</p>
                            <p class="post-excerpt">${post.excerpt || 'No preview available'}</p>
                            <a href="/blog/${post.slug}" class="read-more">Read More</a>
                        </article>
                    `).join('')}
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Clinician to Creator. All rights reserved.</p>
            </div>
        </footer>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Individual blog post page
app.get('/blog/:slug', (req, res) => {
  const post = getBlogPost(req.params.slug);
  
  if (!post) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Post Not Found - Clinician to Creator</title>
          <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
          <nav class="navbar">
              <div class="nav-container">
                  <a href="/" class="nav-brand">Clinician to Creator</a>
                  <div class="nav-links">
                      <a href="/" class="nav-link">Home</a>
                      <a href="/blog" class="nav-link">Blog</a>
                  </div>
              </div>
          </nav>
          <main class="main-content">
              <div class="container">
                  <h1>Post Not Found</h1>
                  <p>The blog post you're looking for doesn't exist.</p>
                  <a href="/blog">← Back to Blog</a>
              </div>
          </main>
      </body>
      </html>
    `);
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${post.title} - Clinician to Creator</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <nav class="navbar">
            <div class="nav-container">
                <a href="/" class="nav-brand">Clinician to Creator</a>
                <div class="nav-links">
                    <a href="/" class="nav-link">Home</a>
                    <a href="/blog" class="nav-link">Blog</a>
                </div>
            </div>
        </nav>
        
        <main class="main-content">
            <div class="container">
                <article class="blog-post-full">
                    <header class="post-header">
                        <h1>${post.title || 'Untitled'}</h1>
                        <p class="post-meta">${post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</p>
                    </header>
                    
                    <div class="post-content">
                        ${post.content ? marked(post.content) : '<p>No content available</p>'}
                    </div>
                    
                    <div class="post-navigation">
                        <a href="/blog" class="back-to-blog">← Back to Blog</a>
                    </div>
                </article>
            </div>
        </main>
        
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Clinician to Creator. All rights reserved.</p>
            </div>
        </footer>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Blog server running at http://localhost:${PORT}`);
});
