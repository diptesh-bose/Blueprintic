# Azure Infrastructure Designer - Troubleshooting Guide

## Testing Natural Language Generation

### Step 1: Verify Application is Running
1. Open terminal in the project directory: `cd "e:\Blueprintic"`
2. Run `npm run dev`
3. Open browser to `http://localhost:5173` (or whichever port is shown)
4. You should see the **REACT** Azure Infrastructure Designer interface with:
   - Modern header with "Azure Infrastructure Designer"
   - Left sidebar with Azure components
   - Center area with prompt input and canvas
   - Right panel for code output
   - Debug button in bottom-right corner

### Step 2: Test Demo Mode (Without API Key)
1. **Do NOT** configure a Gemini API key first
2. In the prompt text area, type: "I need a web application with a SQL database"
3. Click "Generate Infrastructure"
4. You should see:
   - Loading spinner for ~2 seconds
   - Demo nodes appear on the canvas
   - Code panels populate with placeholder content
   - Success message in console

### Step 3: Test with Real Gemini API
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Configure API" button in the prompt panel
3. Enter your API key (should start with "AIza" and be ~39 characters)
4. Click "Save API Key"
5. Status should change to "API Configured" with green background
6. Type the same prompt: "I need a web application with a SQL database"
7. Click "Generate Infrastructure"
8. You should see:
   - Real API call to Gemini
   - Actual infrastructure nodes generated
   - Real ARM/Terraform/YAML code generated

### Step 4: Debug Issues
1. Click the "Debug" button in the bottom-right corner
2. Use the debug panel to:
   - Check current API configuration status
   - Test your API key directly
   - View detailed logs and error messages

### Common Issues & Solutions

#### Issue: Nothing happens when clicking "Generate"
**Possible Causes:**
- Empty prompt text
- Button is disabled
- JavaScript errors

**Solutions:**
1. Check browser console (F12) for errors
2. Ensure you've entered text in the prompt area
3. Verify the button isn't disabled

#### Issue: Demo mode always runs even with API key
**Possible Causes:**
- API key not properly configured
- Invalid API key format
- Network/CORS issues

**Solutions:**
1. Verify API key starts with "AIza"
2. Check key length (~39 characters)
3. Ensure API is enabled in Google Cloud Console
4. Check browser console for network errors

#### Issue: "Failed to parse infrastructure requirements"
**Possible Causes:**
- Gemini API returned invalid JSON
- API key quota exceeded
- Network timeout

**Solutions:**
1. Check API key quota in Google Cloud Console
2. Try a simpler prompt
3. Check network connection
4. Use Debug panel to test API connectivity

#### Issue: Nodes don't appear on canvas
**Possible Causes:**
- Canvas rendering issues
- Node conversion errors
- React Flow problems

**Solutions:**
1. Check browser console for React errors
2. Try refreshing the page
3. Clear browser cache
4. Try a different browser

### Test Prompts
Try these example prompts to test functionality:

**Simple:**
- "I need a web application with a database"
- "Create a storage account for file uploads"

**Complex:**
- "Build a microservices architecture with API gateway, three services, message queue, and monitoring"
- "Design a data analytics platform with data lake, processing pipeline, and dashboard"

**Specific:**
- "I need an e-commerce platform with user authentication, product catalog database, payment processing, and file storage for product images"

### Console Logs to Look For

**Successful Demo Mode:**
```
🚀 processPrompt called with: [your prompt]
🎭 Running in demo mode (no API key configured)
🎭 Demo infrastructure generated successfully
```

**Successful API Mode:**
```
🚀 processPrompt called with: [your prompt]
🤖 Processing prompt with Gemini API: [your prompt]
📞 Calling Gemini API for infrastructure parsing...
✅ Infrastructure parsed successfully: [object]
🔄 Generated nodes: X edges: Y
📝 Generating infrastructure code...
✅ Code generated successfully
```

**API Key Configuration:**
```
🔧 Setting up Gemini API with key: AIza...
🔧 Key length: 39
🔧 Key starts with AIza: true
✅ Gemini API configured successfully
```

### Still Having Issues?
1. Use the Debug Panel to test your API key
2. Check the browser console (F12) for detailed error messages
3. Verify your Google Cloud project has the Gemini API enabled
4. Try testing with a fresh browser session (clear cache/cookies)
