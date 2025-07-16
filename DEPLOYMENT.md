# Deploying Attendee MCP Server to Render

This guide will help you deploy your Attendee MCP server to Render as a background service.

## Prerequisites

1. A Render account (free tier available)
2. Your Attendee backend server already deployed (or running locally)
3. Your MCP server code in a Git repository

## Step 1: Prepare Your Repository

Make sure your repository contains all the necessary files:
- `package.json` with build and start scripts
- `src/index.ts` (your MCP server code)
- `tsconfig.json` (TypeScript configuration)
- `render.yaml` (Render configuration)
- `Dockerfile` (optional, for containerized deployment)
- `health.js` (health check endpoint)

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Connect your repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your Git repository

2. **Configure the service:**
   - **Name:** `attendee-mcp-server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run health`
   - **Plan:** Free (or choose paid plan for more resources)

3. **Set Environment Variables:**
   - `MEETING_BOT_API_URL`: Your Attendee server URL
     - If using local Attendee: `http://localhost:8000`
     - If using deployed Attendee: `https://your-attendee-server.onrender.com`
   - `MEETING_BOT_API_KEY`: Your Attendee API key

4. **Advanced Settings:**
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** Enable if you want automatic deployments

### Option B: Using render.yaml (Infrastructure as Code)

1. **Update the render.yaml file:**
   ```yaml
   services:
     - type: web
       name: attendee-mcp-server
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm run health
       envVars:
         - key: MEETING_BOT_API_URL
           value: https://your-attendee-server.onrender.com
         - key: MEETING_BOT_API_KEY
           sync: false  # Set this manually in dashboard
       healthCheckPath: /health
       plan: free
   ```

2. **Deploy using Blueprint:**
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect and use the `render.yaml`

## Step 3: Configure Your MCP Client

Once deployed, update your MCP client configuration (e.g., Claude Desktop) to use the deployed server:

```json
{
  "mcpServers": {
    "attendee": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://your-mcp-server.onrender.com/mcp",
        "-H", "Content-Type: application/json",
        "-d", "@-"
      ],
      "env": {
        "MEETING_BOT_API_URL": "https://your-attendee-server.onrender.com",
        "MEETING_BOT_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Step 4: Verify Deployment

1. **Check the deployment logs** in Render Dashboard
2. **Test the health endpoint:** `https://your-mcp-server.onrender.com/health`
3. **Test with your MCP client** (Claude Desktop, etc.)

## Troubleshooting

### Common Issues

1. **Build failures:**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation works locally
   - Check build logs in Render Dashboard

2. **Runtime errors:**
   - Verify environment variables are set correctly
   - Check that your Attendee server is accessible
   - Review application logs in Render Dashboard

3. **Health check failures:**
   - Ensure the health endpoint is accessible
   - Check that the service is starting properly
   - Verify port configuration

### Environment Variables

Make sure these are set in Render:
- `MEETING_BOT_API_URL`: Your Attendee server URL
- `MEETING_BOT_API_KEY`: Your Attendee API key
- `PORT`: Usually set automatically by Render

### Logs and Monitoring

- **Application logs:** Available in Render Dashboard
- **Build logs:** Check during deployment
- **Health check logs:** Monitor service status

## Cost Considerations

- **Free tier:** 750 hours/month, suitable for development/testing
- **Paid plans:** Start at $7/month for always-on services
- **Bandwidth:** Included in all plans

## Security Notes

1. **API Keys:** Never commit API keys to your repository
2. **Environment Variables:** Use Render's secure environment variable storage
3. **HTTPS:** All Render services use HTTPS by default
4. **Access Control:** Consider IP restrictions if needed

## Next Steps

1. **Set up monitoring:** Configure alerts for service downtime
2. **CI/CD:** Set up automatic deployments from your main branch
3. **Scaling:** Consider upgrading to paid plans for production use
4. **Backup:** Ensure your configuration is version controlled

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Attendee Documentation](https://github.com/attendee-labs/attendee) 