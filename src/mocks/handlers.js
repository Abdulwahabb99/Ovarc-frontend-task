import { http, HttpResponse } from 'msw';

// Mock data - in a real app, this would come from your backend
const booksData = [
  {"id":1,"author_id":2,"name":"eget tempus vel pede morbi porttitor","isbn":"247489521-3","language":"Northern Sotho","page_count":2532,"format":"paperback"},
  {"id":2,"author_id":20,"name":"eu interdum eu tincidunt in leo maecenas","isbn":"942012386-3","language":"Kashmiri","page_count":257,"format":"hardcover"},
  {"id":3,"author_id":11,"name":"id turpis integer aliquet massa id","isbn":"270878376-9","language":"Afrikaans","page_count":1306,"format":"paperback"},
  {"id":4,"author_id":3,"name":"ultrices posuere cubilia curae duis faucibus accumsan","isbn":"962278849-1","language":"Afrikaans","page_count":4830,"format":"paperback"},
  {"id":5,"author_id":3,"name":"donec","isbn":"628699639-7","language":"Swahili","page_count":8709,"format":"ebook"}
];

const authorsData = [
  {"id":1,"first_name":"John","last_name":"Doe"},
  {"id":2,"first_name":"Jane","last_name":"Smith"},
  {"id":3,"first_name":"Bob","last_name":"Johnson"},
  {"id":4,"first_name":"Alice","last_name":"Brown"},
  {"id":5,"first_name":"Charlie","last_name":"Wilson"}
];

const storesData = [
  {"id":1,"name":"Main Street Bookstore","address":"123 Main St"},
  {"id":2,"name":"Downtown Books","address":"456 Oak Ave"},
  {"id":3,"name":"Central Library Store","address":"789 Pine St"}
];

const inventoryData = [
  {"id":1,"store_id":1,"book_id":1,"price":29.99},
  {"id":2,"store_id":1,"book_id":2,"price":19.99},
  {"id":3,"store_id":2,"book_id":1,"price":27.99},
  {"id":4,"store_id":2,"book_id":3,"price":24.99},
  {"id":5,"store_id":3,"book_id":2,"price":21.99}
];

// Mock users for authentication
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: 2, username: 'manager', password: 'manager123', name: 'Store Manager', role: 'manager' },
  { id: 3, username: 'user', password: 'user123', name: 'Regular User', role: 'user' }
];

// In-memory storage for dynamic data
let books = [...booksData];
let authors = [...authorsData];
let stores = [...storesData];
let inventory = [...inventoryData];
let currentUser = null;

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      currentUser = { ...user, password: undefined };
      return HttpResponse.json({ 
        success: true, 
        user: currentUser,
        token: `mock-token-${user.id}`
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/logout', () => {
    currentUser = null;
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({ 
      success: true, 
      user: currentUser 
    });
  }),

  // Books endpoints
  http.get('/api/books', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const storeId = url.searchParams.get('storeId');
    
    let filteredBooks = books;
    
    if (storeId) {
      const storeInventory = inventory.filter(item => item.store_id === parseInt(storeId));
      filteredBooks = books.filter(book => 
        storeInventory.some(item => item.book_id === book.id)
      );
    }
    
    if (search) {
      filteredBooks = filteredBooks.filter(book =>
        book.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return HttpResponse.json(filteredBooks);
  }),

  http.get('/api/books/:id', ({ params }) => {
    const book = books.find(b => b.id === parseInt(params.id));
    if (!book) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    return HttpResponse.json(book);
  }),

  http.post('/api/books', async ({ request }) => {
    const newBook = await request.json();
    const id = Math.max(...books.map(b => b.id)) + 1;
    const book = { ...newBook, id };
    books.push(book);
    return HttpResponse.json(book, { status: 201 });
  }),

  http.put('/api/books/:id', async ({ params, request }) => {
    const updates = await request.json();
    const index = books.findIndex(b => b.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    books[index] = { ...books[index], ...updates };
    return HttpResponse.json(books[index]);
  }),

  http.delete('/api/books/:id', ({ params }) => {
    const index = books.findIndex(b => b.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    books.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Authors endpoints
  http.get('/api/authors', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    let filteredAuthors = authors;
    if (search) {
      filteredAuthors = authors.filter(author =>
        `${author.first_name} ${author.last_name}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return HttpResponse.json(filteredAuthors);
  }),

  http.get('/api/authors/:id', ({ params }) => {
    const author = authors.find(a => a.id === parseInt(params.id));
    if (!author) {
      return HttpResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    return HttpResponse.json(author);
  }),

  http.post('/api/authors', async ({ request }) => {
    const newAuthor = await request.json();
    const id = Math.max(...authors.map(a => a.id)) + 1;
    const author = { ...newAuthor, id };
    authors.push(author);
    return HttpResponse.json(author, { status: 201 });
  }),

  http.put('/api/authors/:id', async ({ params, request }) => {
    const updates = await request.json();
    const index = authors.findIndex(a => a.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    authors[index] = { ...authors[index], ...updates };
    return HttpResponse.json(authors[index]);
  }),

  http.delete('/api/authors/:id', ({ params }) => {
    const index = authors.findIndex(a => a.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    authors.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Stores endpoints
  http.get('/api/stores', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    let filteredStores = stores;
    if (search) {
      filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return HttpResponse.json(filteredStores);
  }),

  http.get('/api/stores/:id', ({ params }) => {
    const store = stores.find(s => s.id === parseInt(params.id));
    if (!store) {
      return HttpResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    return HttpResponse.json(store);
  }),

  // Inventory endpoints
  http.get('/api/inventory', ({ request }) => {
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    
    let filteredInventory = inventory;
    if (storeId) {
      filteredInventory = inventory.filter(item => item.store_id === parseInt(storeId));
    }
    
    return HttpResponse.json(filteredInventory);
  }),

  http.get('/api/inventory/:storeId/books', ({ params }) => {
    const storeId = parseInt(params.storeId);
    const storeInventory = inventory.filter(item => item.store_id === storeId);
    
    const booksWithInventory = books
      .filter(book => storeInventory.some(item => item.book_id === book.id))
      .map(book => {
        const inventoryItem = storeInventory.find(item => item.book_id === book.id);
        const author = authors.find(a => a.id === book.author_id);
        return {
          ...book,
          price: inventoryItem.price,
          author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown Author',
          inventory_id: inventoryItem.id  // Add the inventory_id field
        };
      });
    
    return HttpResponse.json(booksWithInventory);
  }),

  http.post('/api/inventory', async ({ request }) => {
    const newInventoryItem = await request.json();
    const id = Math.max(...inventory.map(i => i.id)) + 1;
    const item = { ...newInventoryItem, id };
    inventory.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.put('/api/inventory/:id', async ({ params, request }) => {
    const updates = await request.json();
    const index = inventory.findIndex(i => i.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }
    inventory[index] = { ...inventory[index], ...updates };
    return HttpResponse.json(inventory[index]);
  }),

  http.delete('/api/inventory/:id', ({ params }) => {
    const index = inventory.findIndex(i => i.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }
    inventory.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Delete book from store inventory
  http.delete('/api/inventory/store/:storeId/book/:bookId', ({ params }) => {
    const storeId = parseInt(params.storeId);
    const bookId = parseInt(params.bookId);
    const index = inventory.findIndex(i => i.store_id === storeId && i.book_id === bookId);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Book not found in store inventory' }, { status: 404 });
    }
    
    inventory.splice(index, 1);
    return HttpResponse.json({ success: true });
  })
];
