# Quick Start Guide - SSE Deployment

## 🎯 Quick Setup

### Prerequisites
✅ Docker installed  
✅ Node.js 18+ installed  
✅ Loopio API credentials

## 🧪 Test Locally First

```bash
# Build
npm install && npm run build

# Test SSE mode (Windows)
.\test-sse.ps1
```

## 🐳 Docker Quick Test

```bash
docker build -t loopio-mcp-server .
docker run -p 3000:3000 \
  -e LOOPIO_CLIENT_ID=your_id \
  -e LOOPIO_CLIENT_SECRET=your_secret \
  loopio-mcp-server

# Test: http://localhost:3000/health
```

## 🔗 Connect Your Client

```json
{
  "mcpServers": {
    "loopio": {
      "url": "https://your-server.com/sse"
    }
  }
}
```

## 📚 Full Documentation

- **SSE Setup**: See `SSE-DEPLOYMENT.md`
- **API Details**: See `README.md`
- **Architecture**: See `ARCHITECTURE.md`

## ⚡ Environment Variables

```bash
# Required
LOOPIO_CLIENT_ID=your_client_id
LOOPIO_CLIENT_SECRET=your_client_secret

# SSE Mode (set either)
MCP_TRANSPORT=sse
# OR
PORT=3000
```

## 🎪 Endpoints

- `GET /sse` - MCP SSE endpoint
- `POST /message` - Client messages
- `GET /health` - Health check

## 🆘 Troubleshooting

**Server won't start?**
- Check environment variables are set
- Verify Loopio credentials are valid

**Can't connect from client?**
- Check firewall allows port 3000
- Verify SSE endpoint URL is correct
- Test with `/health` endpoint first

---

**Need help?** See full docs in `SSE-DEPLOYMENT.md`
