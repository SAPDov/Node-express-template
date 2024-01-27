import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import shopify from './shopify.js';
import webhooks from './webhooks.js';
import mysql from 'mysql2';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
	process.env.NODE_ENV === 'production'
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();
app.use(express.json()); // Middleware to parse JSON request body

const connection = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USERNAME,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

// Connect to MySQL
connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL: ' + err.stack);
		return;
	}
	console.log('Connected to MySQL as ID: ' + connection.threadId);
});

connection.on('error', (err) => {
	console.error('MySQL error occurred:', err.message);
	process.exit(1); // Exit the application on MySQL error
});

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot()
);

app.post('/api/checkouts/save-cart', async (req, res) => {
	try {
		const { checkoutToken, selectedIds } = req.body;
		const sql = `INSERT INTO save_later_cart (checkout_token, product_ids) VALUES (?, ?)`;
		const values = [checkoutToken, JSON.stringify(selectedIds)];

		connection.query(sql, values, (err, result) => {
			if (err) {
				console.error('Error saving data to MySQL:', err);
				res.status(500).json({ success: false, message: 'Error saving cart' });
				return;
			}

			console.log('Cart data saved successfully to MySQL');
			res.json({ success: true, message: 'Cart saved successfully' });
		});
		console.log('Selected IDs:', selectedIds);
		res.status(200).json({ success: true, message: 'Cart saved for later successfully' });
	} catch (error) {
		console.error('Error saving cart:', error);
		res.status(500).json({ success: false, message: 'Error saving cart' });
	}
});

app.post(
	shopify.config.webhooks.path,
	// @ts-ignore
	shopify.processWebhooks({ webhookHandlers: webhooks })
);

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res) => {
	return res.set('Content-Type', 'text/html').send(readFileSync(join(STATIC_PATH, 'index.html')));
});
// connection.end();

app.listen(PORT);
