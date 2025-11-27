# DocuSign Proof of Concept

A full-stack application demonstrating DocuSign eSignature API integration. This project allows users to create custom DocuSign envelopes with multiple signers,
track signature statuses in real-time via webhooks, and download completed documents.

## Architecture

### Server (`/server`)
- **Framework**: Node.js with Express and TypeScript
- **Purpose**: Backend API that interfaces with DocuSign eSign API
- **Database**: JSON file (`DB.json`) for storing envelope and user data
- **Authentication**: JWT authentication with DocuSign using RSA key pair

### Client (`/client`)
- **Framework**: Svelte with Vite
- **Purpose**: Frontend UI for creating and managing DocuSign envelopes
- **Routing**: Client-side navigation between views

## Features

- Create DocuSign envelopes with customizable products
- Support for multiple signers with sequential routing
- Optional CC (carbon copy) recipients
- Real-time signature status tracking via DocuSign Connect webhooks
- HMAC security validation for webhook endpoints
- Download signed PDF documents
- View all sent envelopes and their signature statuses

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **DocuSign Developer Account** ([Create one here](https://developers.docusign.com/))
3. **DocuSign Integration Key** with JWT Grant enabled
4. **RSA Key Pair** for JWT authentication

## DocuSign Setup

### 1. Create a DocuSign Developer Account
- Go to [DocuSign Developer Center](https://developers.docusign.com/)
- Create a free developer account (Demo environment)

### 2. Create an Integration Key (Application)
1. Log in to your [DocuSign Admin](https://admindemo.docusign.com/)
2. Navigate to **Settings** → **Apps and Keys**
3. Click **Add App and Integration Key**
4. Note down the **Integration Key** (this is your `DOCUSIGN_INTEGRATION_KEY`)

### 3. Configure JWT Grant Authentication
1. In your app settings, click **Add RSA Keypair**
2. DocuSign will generate a key pair for you
3. Download the private key and save it as `id_rsa` in the `/server` directory
4. Click **Save**

### 4. Get Your User ID
1. In the same Apps and Keys page, scroll down to **Authentication**
2. Under **User API**, copy your **API Username** (this is your `DOCUSIGN_USER_ID`)

### 5. Grant Consent
1. After creating your integration key, you need to grant consent
2. Visit this URL in your browser (replace `{INTEGRATION_KEY}` with your actual key):
   ```
   https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id={INTEGRATION_KEY}&redirect_uri=http://localhost:3000/callback
   ```
3. Log in and click **Allow**
4. You'll be redirected to your callback URL (it's okay if it shows an error)

### 6. Configure DocuSign Connect (Webhook)
1. In DocuSign Admin, go to **Settings** → **Connect** → **Add Configuration**
2. Configure the following:
   - **Name**: Your choice (e.g., "Local Development Webhook")
   - **URL**: Your webhook endpoint (for local dev, use a tool like [ngrok](https://ngrok.com/) to expose `http://localhost:3000/webhook/docusign`)
   - **Enable HMAC**: Check this box
   - **HMAC Key**: Generate a secure key and save it as `DOCUSIGN_CONNECT_HMAC_KEY`
3. Under **Trigger Events**, select:
   - Envelope Sent
   - Recipient Sent
   - Recipient Delivered
   - Recipient Completed
   - Envelope Completed
4. Click **Save**

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Docusign-Proof-Of-Concept
```

### 2. Server Setup

```bash
cd server
npm install
```

#### Create Environment Variables File
Create a `.env` file in the `/server` directory:

```env
DOCUSIGN_INTEGRATION_KEY=your-integration-key-here
DOCUSIGN_USER_ID=your-user-id-here
DUCUSIGN_CONNECT_HMAC_KEY=your-hmac-key-here
```

**Note**: There's a typo in the environment variable name - it's `DUCUSIGN_CONNECT_HMAC_KEY` instead of `DOCUSIGN_CONNECT_HMAC_KEY`.

#### Add RSA Private Key
Place your downloaded RSA private key in the `/server` directory and name it `id_rsa`.

#### Initialize Database
Create a `DB.json` file in the `/server` directory with the following structure:

```json
{
  "envelopes": {},
  "users": {}
}
```

### 3. Client Setup

```bash
cd client
npm install
```

## Running the Application

### Start the Server
```bash
cd server
npm start
```

The server will start on `http://localhost:3000`.

### Start the Client
In a separate terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` (or another port if 5173 is in use).

### For Local Webhook Testing
To receive webhooks locally, you'll need to expose your local server to the internet:

1. Install [ngrok](https://ngrok.com/):
   ```bash
   npm install -g ngrok
   ```

2. Run ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)

4. Update your DocuSign Connect configuration webhook URL to:
   ```
   https://abc123.ngrok.io/webhook/docusign
   ```

## How It Works

### Creating an Envelope

1. **User Interface**: User fills out the form in the client app with:
   - Signer information (name and email)
   - Product list
   - Optional CC recipients

2. **API Request**: Client sends a POST request to `/send-envelope` with the form data

3. **Document Generation**: Server generates an HTML document containing:
   - Order details
   - Product list
   - Signature anchors for each signer

4. **DocuSign API**: Server creates an envelope via DocuSign API with:
   - Generated HTML document (converted to PDF by DocuSign)
   - Recipient configuration (signers and CC users)
   - Signature tabs positioned using anchor strings

5. **Database**: Server stores envelope metadata in `DB.json`

6. **Email Delivery**: DocuSign sends emails to all signers in routing order

### Webhook Events

When signers interact with the document, DocuSign sends webhook events to `/webhook/docusign`:

1. **Security Validation**: Server verifies HMAC signature in the `x-docusign-signature-1` header

2. **Event Processing**: Server handles these event types:
   - `recipient-sent`: Updates signature status to SENT
   - `recipient-delivered`: Updates signature status to DELIVERED
   - `recipient-completed`: Updates signature status to COMPLETE
   - `envelope-completed`: Marks entire envelope as COMPLETE

3. **Database Update**: Server updates `DB.json` with new status

4. **Real-time Updates**: Client can refresh the view to see updated statuses

### Downloading Documents

1. User clicks "Download PDF" in the envelope details view
2. Client sends GET request to `/sent-envelopes/:envelopeId/download-document`
3. Server fetches the completed document from DocuSign API
4. Server streams the PDF back to the client
5. Client triggers browser download

## API Endpoints

### Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/send-envelope` | Create and send a DocuSign envelope |
| GET | `/sent-envelopes` | Get all sent envelopes |
| GET | `/sent-envelopes/:envelopeId` | Get specific envelope details |
| GET | `/sent-envelopes/:envelopeId/download-document` | Download signed PDF |
| POST | `/webhook/docusign` | DocuSign Connect webhook receiver |

## Project Structure

```
Docusign-Proof-Of-Concept/
├── server/
│   ├── src/
│   │   ├── server.ts              # Main Express server
│   │   ├── send_envelope.ts       # Envelope creation logic
│   │   ├── event_handler.ts       # Webhook event processing
│   │   ├── docusign_client.ts     # DocuSign API client setup
│   │   ├── docusign_token_utils.ts # JWT token management
│   │   ├── db.ts                  # Database operations
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── constants.ts           # Environment variables
│   ├── .env                       # Environment variables
│   ├── id_rsa                     # RSA private key
│   ├── DB.json                    # JSON database
│   └── package.json
├── client/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── Home.svelte              # Landing page
│   │   │   ├── CreateOffer.svelte       # Create envelope form
│   │   │   ├── ViewOffers.svelte        # List all envelopes
│   │   │   └── ViewOfferDetails.svelte  # Envelope details & download
│   │   ├── App.svelte             # Main app component with routing
│   │   └── main.js                # App entry point
│   └── package.json
└── README.md
```

## Database Schema

The `DB.json` file stores data in the following format:

```json
{
  "envelopes": {
    "envelope-id-123": {
      "envelopeId": "envelope-id-123",
      "signatures": [
        {
          "user": {
            "email": "user@example.com",
            "name": "John Doe"
          },
          "status": "COMPLETE"
        }
      ],
      "status": "SENT"
    }
  },
  "users": {
    "uuid-123": "user@example.com"
  }
}
```

## Signature Statuses

- **PENDING**: Envelope created but not yet sent to recipient
- **SENT**: Email sent to recipient
- **DELIVERED**: Recipient received the email
- **COMPLETE**: Recipient signed the document

## Envelope Statuses

- **SENT**: Envelope is in progress
- **COMPLETE**: All recipients have completed their actions

## Security Notes

1. **HMAC Validation**: Webhooks are secured using HMAC SHA-256 signatures
2. **JWT Authentication**: Server authenticates with DocuSign using JWT tokens (refreshed automatically)
3. **Private Keys**: Keep your `id_rsa` file secure and never commit it to version control
4. **Environment Variables**: Store sensitive credentials in `.env` and add it to `.gitignore`

## Troubleshooting

### "Invalid Grant" Error
- Ensure you've granted consent using the OAuth URL
- Verify your Integration Key and User ID are correct
- Check that your RSA key pair matches the one in DocuSign

### Webhooks Not Received
- Make sure ngrok (or similar tool) is running and URL is up to date in DocuSign Connect
- Verify HMAC key matches between DocuSign Connect config and `.env`
- Check server logs for HMAC validation errors

### "Missing DocuSign signature header" Error
- Verify HMAC is enabled in DocuSign Connect configuration
- Confirm the HMAC key is correctly set in both places

## Development Notes

- The server uses TypeScript and can be compiled with `npm run build`
- For development, `npm start` uses `tsx` for direct TypeScript execution
- The client uses Vite for fast development and HMR (Hot Module Replacement)
- Bootstrap 5 is used for styling the client interface

## Limitations

- This is a proof of concept and uses a JSON file as a database (not suitable for production)
- No user authentication or multi-tenancy support
- Limited error handling and logging
- Webhook endpoint must be publicly accessible (requires tunneling for local development)

## Future Enhancements

- Replace JSON database with a real database (PostgreSQL, MongoDB, etc.)
- Add user authentication and authorization
- Implement real-time updates using WebSockets or Server-Sent Events
- Add support for templates and bulk sending
- Enhanced error handling and logging
- Support for multiple documents per envelope
- Document preview before sending

## Resources

- [DocuSign Developer Center](https://developers.docusign.com/)
- [DocuSign eSignature API Documentation](https://developers.docusign.com/docs/esign-rest-api/)
- [DocuSign Connect Webhooks Guide](https://developers.docusign.com/docs/esign-rest-api/reference/connect/)
- [JWT Authentication Guide](https://developers.docusign.com/platform/auth/jwt/)

## License

This project is a sample integration and is provided as-is for educational purposes.
