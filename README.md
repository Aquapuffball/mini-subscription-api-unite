#Technical task for Unite - Tormod Rønning

## Description

A mini subscription API built with nestjs. Only for local use. Can create customers, products and subscribe customers to a product.

Simple end-to-end tests with Jest are set up. These are almost fully AI generated, and mostly a tool to help testing while creating the api.

### Architechture

I chose to use uuid as id's here instead of incremental integer. This ensures a unique id, and also makes it near impossible to guess the id of a user.

All of these (except auth) uses the following (what i call) "default" fields: ID, CreatedAt, UpdatedAt

#### Customer

This is setup with the following default fields: email, firstname, lastname

I chose these simple fields as i feel like its the minimal needed. In retrospect first and last name might not have been needed either. In a reallife scenario alot more fields would be nice here, like for example address for mail and billing, or other user-optional data that could help understand the customers better.

#### Product

Here i chose the following fields: name, description, price, currency, billingPeriod.

The name and description fields here is nice for presentation in any frontend to explain to the customer what they are buying. For subscription products like these this should be more or less sufficient for a backend i think.

Price is a natural thing to have here together with billing period. I set something simple as weekly, monthly and yealy as values here, but this can be expanded to more periods, or even something as "one-time-purchase" for special cases (even tho that isnt really a subscription, it could work if its any campaign deal. Or buying single article when there is only that type of product setup in the shop). Currency also feels at home here as its tied up to the price. Tax could also have been added here, especially if its a international page, as taxes is often calculated differently for different countries, and the price here would be expected to be including tax for end users.

#### Subscription

Here i chose the following fields: customerId, productId, status, startDate, endDate, nextBillingDate, cancelledAt.

Customer and product id's are important here as a subscription is a bond between them.

Here a subscription is set to status active when buying a subscription. Here its simple and it goes directly to active, but in a system with payment normally it would go to pending untill the payment is successful. As one subscribes here the next billing date is set to "now" + a week, month or year depending on the product billingPeriod. EndDate will be set to null, as a subscription will renew at the end of the billing period. StatDate will be sate to "now" at the time of subscribing.

If canceled the endtime will be set to nextBillingDate, and status will update to canceled. Here it would be natural to have a cronjob running daily to set canceled subscriptions to expired when endDate is past, and at this point i would also set nextBillingDate to false. I do not do this on cancelation incase of resubscriptions (this is not impelmented).

#### Auth

This is just a very basic auth to set all endpoints to private, requiring the correct 'Bearer {API_KEY}' as header when making requests. Setup with nestjs guard

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
$ npm run start
```

## Run e2e tests

```bash
$ npm run test:e2e
```

## Authorization

All API endpoints (except the root `/` endpoint) require an API key for authorization.

**Set your API key:**

```bash
export API_KEY=your-api-key-here
```

Or create a `.env` file (see `.env.example`):

```
API_KEY=your-api-key-here
```

**Default API key:** `top-secret-label` (change in production!)

**Usage in requests:**

```bash
# Using Bearer token format (recommended)
curl -H "Authorization: Bearer your-api-key-here" http://localhost:3000/customers

# Or using ApiKey format
curl -H "Authorization: ApiKey your-api-key-here" http://localhost:3000/customers
```

## How to test manually

### Create a customer, product and subscription

#### using bash and saving as variables for further use

```bash
# Set your API key (or use default)
export API_KEY=${API_KEY:top-secret-label}

CUSTOMER_ID=$(curl -s -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"email":"ola.normann@norge.no","firstName":"Ola","lastName":"Normann"}' | grep -o '"id":"[^"]*' | sed 's/"id":"//')

PRODUCT_ID=$(curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"name":"Full access to EVERYTHING","description":"King of the world for a month!","price":1337.00,"currency":"NOK","billingPeriod":"monthly"}' | grep -o '"id":"[^"]*' | sed 's/"id":"//')

SUBSCRIPTION_ID=$(curl -s -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"productId\":\"$PRODUCT_ID\"}" | grep -o '"id":"[^"]*' | sed 's/"id":"//')

echo "Customer ID: $CUSTOMER_ID"
echo "Product ID: $PRODUCT_ID"
echo "Subscription ID: $SUBSCRIPTION_ID"
```

#### Other methods

If using other methods to test this, remember to save the id's in the responses from the POST requests below. Swap out $CUSTOMER_ID, $PRODUCT_ID, $SUBSCRIPTION_ID from the commands in the GET and PATCH requests respectively

Create customer:

```bash
curl -s -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"email":"ola.normann@norge.no","firstName":"Ola","lastName":"Normann"}'
```

Create Product

```bash
curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"name":"Full access to EVERYTHING","description":"King of the world for a month!","price":1337.00,"currency":"NOK","billingPeriod":"monthly"}'
```

Create Subscription

```bash
curl -s -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"productId\":\"$PRODUCT_ID\"}"
```

### Customers

#### Get All Customers

**GET** `/customers`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/customers
```

#### Get Customer by ID

**GET** `/customers/:id`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/customers/$CUSTOMER_ID
```

### Product

#### Get All Products

**GET** `/products`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/products
```

#### Get Product by ID

**GET** `/products/:id`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/products/$PRODUCT_ID
```

### Subscriptions

#### Get All Subscriptions

**GET** `/subscriptions`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/subscriptions
```

#### Get Subscription by ID

**GET** `/subscriptions/:id`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/subscriptions/$SUBSCRIPTION_ID
```

#### Get Subscriptions by Customer ID

**GET** `/subscriptions/customer/:customerId`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/subscriptions/customer/$CUSTOMER_ID
```

#### Get Subscriptions by Product ID

**GET** `/subscriptions/product/:productId`

```bash
curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/subscriptions/product/$PRODUCT_ID
```

#### Cancel a Subscription

**PATCH** `/subscriptions/:id/cancel`

```bash
curl -X PATCH -H "Authorization: Bearer $API_KEY" http://localhost:3000/subscriptions/$SUBSCRIPTION_ID/cancel
```

## Things that could have been done if i had more time:

- Added autoincremental integer for better ease of use and faster queries in the models in addition to uuid.
- Soft deleting of products
- Deletion of customers
- Setup of public routes, now they should all need auth
- More comprehensive data stored on customers
- Better validation - e.g no duplicate emails on customers, no duplicate names on products.
- Cronjob to expire subscriptions
