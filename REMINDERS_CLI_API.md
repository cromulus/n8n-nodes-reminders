# Reminders CLI HTTP API Documentation

## Overview

The Reminders CLI HTTP API provides programmatic access to macOS Reminders data through a RESTful interface. Built with Swift and Hummingbird, it offers comprehensive reminder management capabilities including CRUD operations, advanced search, real-time webhook notifications, and access to private API features like subtasks, URL attachments, and mail links.

## Getting Started

### Prerequisites
- macOS system with Reminders app
- Swift 5.5 or later
- Reminders access permission

### Installation & Setup

1. **Build the API server:**
   ```bash
   # Build just the API server
   make build-api
   
   # Or build everything (CLI + API)
   make build-release
   ```

2. **Generate API token:**
   ```bash
   # Build and generate token
   make build-api
   ./.build/apple/Products/Release/reminders-api --generate-token
   ```

3. **Start the server:**
   ```bash
   # Quick start (builds and runs)
   make run-api
   
   # Or manually with environment variable
   export REMINDERS_API_TOKEN="your-token-here"
   ./.build/apple/Products/Release/reminders-api --host 127.0.0.1 --port 8080
   
   # Or with command line argument
   ./.build/apple/Products/Release/reminders-api --token "your-token-here" --host 127.0.0.1 --port 8080
   ```

### Server Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host` | Hostname to bind to | `127.0.0.1` |
| `--port` | Port to listen on | `8080` |
| `--token` | API authentication token | Environment variable |
| `--auth-required` | Require authentication for all endpoints | `false` |
| `--generate-token` | Generate new token and exit | - |

## Authentication

### Token-Based Authentication

The API uses Bearer token authentication. Include the token in the Authorization header:

```http
Authorization: Bearer your-api-token-here
```

### Managing Authentication

#### Configure Authentication Requirements

**curl Example:**
```bash
curl -X POST "http://localhost:8080/auth/settings" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "requireAuth": true
  }'
```

**Response:**
```json
{
  "message": "Authentication settings updated. Required: true"
}
```

## Core API Endpoints

### Lists Management

#### Get All Lists

**curl Example:**
```bash
curl "http://localhost:8080/lists" \
  -H "Authorization: Bearer your-api-token-here"
```

**Response:**
```json
[
  {
    "title": "Reminders",
    "uuid": "ABC123-DEF456-GHI789",
    "allowsContentModifications": true,
    "type": 0,
    "source": "Local",
    "isPrimary": true
  },
  {
    "title": "Work",
    "uuid": "DEF456-GHI789-JKL012",
    "allowsContentModifications": true,
    "type": 0,
    "source": "Local", 
    "isPrimary": true
  }
]
```

#### Get Reminders from Specific List

**curl Examples:**
```bash
# Get incomplete reminders from a list by name
curl "http://localhost:8080/lists/Shopping" \
  -H "Authorization: Bearer your-api-token-here"

# Get all reminders (including completed) from a list
curl "http://localhost:8080/lists/Shopping?completed=true" \
  -H "Authorization: Bearer your-api-token-here"

# Get reminders from a list by UUID
curl "http://localhost:8080/lists/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here"
```

**Parameters:**
- `listName` (path, required): Name or UUID of the list
- `completed` (query, optional): Include completed reminders (`true`/`false`, default: `false`)

**Response:**
```json
[
  {
    "uuid": "ABC123-DEF456-GHI789",
    "externalId": "ABC123-DEF456-GHI789",
    "calendarItemIdentifier": "internal-calendar-id",
    "title": "Buy groceries",
    "notes": "Don't forget milk and bread",
    "url": null,
    "location": null,
    "locationTitle": null,
    "dueDate": "2024-01-15T10:00:00Z",
    "startDate": null,
    "completionDate": null,
    "isCompleted": false,
    "priority": 5,
    "list": "Shopping",
    "listUUID": "LIST-UUID-123",
    "creationDate": "2024-01-01T09:00:00Z",
    "lastModified": "2024-01-01T09:00:00Z",
    "attachedUrl": "https://example.com/link",
    "mailUrl": "message://mail-message-id",
    "parentId": "PARENT-REMINDER-UUID",
    "isSubtask": true
  }
]
```

### Reminder Management

#### Get All Reminders

**curl Examples:**
```bash
# Get all incomplete reminders across all lists
curl "http://localhost:8080/reminders" \
  -H "Authorization: Bearer your-api-token-here"

# Get all reminders including completed ones
curl "http://localhost:8080/reminders?completed=true" \
  -H "Authorization: Bearer your-api-token-here"
```

**Parameters:**
- `completed` (query, optional): Include completed reminders (`true`/`false`, default: `false`)

**Response:** Array of reminder objects (same structure as list response)

#### Get Specific Reminder

**curl Example:**
```bash
curl "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here"
```

**Parameters:**
- `uuid` (path, required): Reminder UUID

**Response:** Single reminder object

#### Create New Reminder

**curl Examples:**
```bash
# Create a simple reminder
curl -X POST "http://localhost:8080/lists/Shopping/reminders" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries"
  }'

# Create a reminder with all options
curl -X POST "http://localhost:8080/lists/Shopping/reminders" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "notes": "Don'\''t forget milk and bread",
    "dueDate": "2024-01-15T10:00:00Z",
    "priority": "high"
  }'
```

**Parameters:**
- `listName` (path, required): Name or UUID of the target list
- `title` (required): Reminder title
- `notes` (optional): Additional notes
- `dueDate` (optional): Due date in ISO8601 format
- `priority` (optional): Priority level (`none`, `low`, `medium`, `high`)

**Response:** Created reminder object (HTTP 201)

#### Update Reminder

**curl Examples:**
```bash
# Update just the title
curl -X PATCH "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'

# Update multiple fields
curl -X PATCH "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "notes": "Updated notes",
    "dueDate": "2024-01-20T14:00:00Z",
    "priority": "high",
    "isCompleted": false
  }'
```

**Parameters:**
- `uuid` (path, required): Reminder UUID
- All fields are optional; only provided fields will be updated

**Response:** Updated reminder object

#### Complete/Uncomplete Reminder

**curl Examples:**
```bash
# Mark reminder as complete
curl -X PATCH "http://localhost:8080/reminders/ABC123-DEF456-GHI789/complete" \
  -H "Authorization: Bearer your-api-token-here"

# Mark reminder as incomplete
curl -X PATCH "http://localhost:8080/reminders/ABC123-DEF456-GHI789/uncomplete" \
  -H "Authorization: Bearer your-api-token-here"
```

**Parameters:**
- `uuid` (path, required): Reminder UUID

**Response:** HTTP 200 on success

#### Delete Reminder

**curl Example:**
```bash
curl -X DELETE "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here"
```

**Parameters:**
- `uuid` (path, required): Reminder UUID

**Response:** HTTP 204 on success

### Advanced Search

#### Search Reminders

**curl Examples:**
```bash
# Basic text search
curl "http://localhost:8080/search?query=groceries" \
  -H "Authorization: Bearer your-api-token-here"

# Complex search with multiple filters
curl "http://localhost:8080/search?query=groceries&completed=false&priority=high&sortBy=dueDate&limit=10" \
  -H "Authorization: Bearer your-api-token-here"

# Search in specific lists
curl "http://localhost:8080/search?lists=Work,Personal&priority=high" \
  -H "Authorization: Bearer your-api-token-here"

# Search by date range
curl "http://localhost:8080/search?dueAfter=2024-01-01T00:00:00Z&dueBefore=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer your-api-token-here"
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Text search in title/notes |
| `lists` | string | Comma-separated list names |
| `listUUIDs` | string | Comma-separated list UUIDs |
| `completed` | string | Completion status (`all`, `true`, `false`) |
| `dueBefore` | string | ISO8601 date - reminders due before |
| `dueAfter` | string | ISO8601 date - reminders due after |
| `modifiedAfter` | string | ISO8601 date - modified after |
| `createdAfter` | string | ISO8601 date - created after |
| `hasNotes` | boolean | Filter by presence of notes |
| `hasDueDate` | boolean | Filter by presence of due date |
| `priority` | string | Exact priority (`none`, `low`, `medium`, `high`) |
| `priorityMin` | integer | Minimum priority level (0-9) |
| `priorityMax` | integer | Maximum priority level (0-9) |
| `sortBy` | string | Sort field (`title`, `dueDate`, `creationDate`, `lastModified`, `priority`, `list`) |
| `sortOrder` | string | Sort direction (`asc`, `desc`) |
| `limit` | integer | Maximum results to return |

**Response:** Array of matching reminder objects

#### Search Examples

**Find overdue reminders:**
```bash
curl "http://localhost:8080/search?dueBefore=2024-01-01T00:00:00Z&completed=false" \
  -H "Authorization: Bearer your-api-token-here"
```

**High priority reminders in specific lists:**
```bash
curl "http://localhost:8080/search?lists=Work,Personal&priority=high&sortBy=dueDate" \
  -H "Authorization: Bearer your-api-token-here"
```

**Find all subtasks:**
```bash
curl "http://localhost:8080/search?query=&isSubtask=true" \
  -H "Authorization: Bearer your-api-token-here"
```

**Reminders with URL attachments:**
```bash
curl "http://localhost:8080/search?hasAttachedUrl=true" \
  -H "Authorization: Bearer your-api-token-here"
```

## Webhook System

### Webhook Management

#### List All Webhooks

**curl Example:**
```bash
curl "http://localhost:8080/webhooks" \
  -H "Authorization: Bearer your-api-token-here"
```

**Response:**
```json
[
  {
    "id": "webhook-uuid-123",
    "url": "https://your-server.com/webhook",
    "name": "Task Notifications",
    "isActive": true,
    "filter": {
      "listNames": ["Work", "Personal"],
      "listUUIDs": null,
      "completed": "incomplete",
      "priorityLevels": [5, 9],
      "hasQuery": null
    }
  }
]
```

#### Get Specific Webhook

**curl Example:**
```bash
curl "http://localhost:8080/webhooks/webhook-uuid-123" \
  -H "Authorization: Bearer your-api-token-here"
```

#### Create Webhook

**curl Examples:**
```bash
# Create a simple webhook
curl -X POST "http://localhost:8080/webhooks" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhook",
    "name": "Task Notifications",
    "filter": {
      "listNames": ["Work", "Personal"],
      "completed": "incomplete"
    }
  }'

# Create a webhook with complex filtering
curl -X POST "http://localhost:8080/webhooks" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhook",
    "name": "Task Notifications",
    "filter": {
      "listNames": ["Work", "Personal"],
      "listUUIDs": ["uuid1", "uuid2"],
      "completed": "incomplete",
      "priorityLevels": [5, 9],
      "hasQuery": "urgent"
    }
  }'
```

**Filter Options:**
- `listNames`: Array of list names to monitor
- `listUUIDs`: Array of list UUIDs to monitor
- `completed`: Completion status filter (`all`, `complete`, `incomplete`)
- `priorityLevels`: Array of priority levels to monitor (0-9)
- `hasQuery`: Text that must be present in title/notes

#### Update Webhook

**curl Examples:**
```bash
# Update webhook URL and name
curl -X PATCH "http://localhost:8080/webhooks/webhook-uuid-123" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://new-server.com/webhook",
    "name": "Updated Notifications"
  }'

# Disable a webhook and update its filter
curl -X PATCH "http://localhost:8080/webhooks/webhook-uuid-123" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "filter": {
      "listNames": ["Work"],
      "completed": "all"
    }
  }'
```

#### Delete Webhook

**curl Example:**
```bash
curl -X DELETE "http://localhost:8080/webhooks/webhook-uuid-123" \
  -H "Authorization: Bearer your-api-token-here"
```

#### Test Webhook

**curl Example:**
```bash
curl -X POST "http://localhost:8080/webhooks/webhook-uuid-123/test" \
  -H "Authorization: Bearer your-api-token-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Test webhook sent successfully"
}
```

### Webhook Payloads

When events occur, webhooks receive POST requests with this payload structure:

```json
{
  "event": "created",
  "timestamp": "2024-01-15T10:30:00Z",
  "reminder": {
    "uuid": "ABC123-DEF456-GHI789",
    "externalId": "ABC123-DEF456-GHI789",
    "title": "Buy groceries",
    "notes": "Don't forget milk and bread",
    "dueDate": "2024-01-15T10:00:00Z",
    "isCompleted": false,
    "priority": 5,
    "list": "Shopping",
    "listUUID": "LIST-UUID-123",
    "creationDate": "2024-01-01T09:00:00Z",
    "lastModified": "2024-01-01T09:00:00Z",
    "attachedUrl": "https://example.com/link",
    "mailUrl": "message://mail-message-id",
    "parentId": "PARENT-REMINDER-UUID",
    "isSubtask": true
  }
}
```

**Event Types:**
- `created`: New reminder created
- `updated`: Reminder modified
- `deleted`: Reminder deleted
- `completed`: Reminder marked complete
- `uncompleted`: Reminder marked incomplete

## Data Models

### Reminder Object Structure

```json
{
  "uuid": "string",                    // Primary identifier (URL-safe)
  "externalId": "string",             // Same as uuid (URL-safe version)
  "calendarItemIdentifier": "string",  // Internal macOS identifier
  "title": "string",                  // Reminder title
  "notes": "string|null",             // Optional notes
  "url": "string|null",               // Standard URL (usually null due to macOS limitations)
  "location": "string|null",          // GPS coordinates if location reminder
  "locationTitle": "string|null",     // Location name if location reminder
  "dueDate": "string|null",           // ISO8601 due date
  "startDate": "string|null",         // ISO8601 start date
  "completionDate": "string|null",    // ISO8601 completion date
  "isCompleted": "boolean",           // Completion status
  "priority": "number",               // Priority level (0-9)
  "list": "string",                   // Name of containing list
  "listUUID": "string",               // UUID of containing list
  "creationDate": "string|null",      // ISO8601 creation date
  "lastModified": "string|null",      // ISO8601 last modified
  
  // Private API Fields (macOS Reminders internal features)
  "attachedUrl": "string|null",       // URL attachments saved to reminder
  "mailUrl": "string|null",          // Mail.app message links
  "parentId": "string|null",         // Parent reminder UUID for subtasks
  "isSubtask": "boolean"             // Whether this is a subtask
}
```

### Priority Levels

| Priority | Value | Description |
|----------|-------|-------------|
| `none` | 0 | No priority |
| `low` | 1 | Low priority |
| `medium` | 5 | Medium priority |
| `high` | 9 | High priority |

### List Object Structure

```json
{
  "title": "string",                  // List display name
  "uuid": "string",                   // Unique list identifier
  "allowsContentModifications": "boolean", // Whether list can be modified
  "type": "number",                   // List type (0 = Local)
  "source": "string",                 // Source name (e.g., "Local")
  "isPrimary": "boolean"              // Whether this is a primary list
}
```

## Private API Features

This API provides access to private macOS Reminders features not available through the standard EventKit API:

### Subtasks
- **parentId**: UUID of the parent reminder
- **isSubtask**: Boolean indicating if this reminder is a subtask
- Use search with `isSubtask=true` to find all subtasks

### URL Attachments  
- **attachedUrl**: URLs that have been explicitly attached to reminders
- Different from the standard `url` field which is typically null
- These are URLs saved directly in the Reminders app

### Mail Links
- **mailUrl**: Links to specific Mail.app messages
- Format: `message://message-id`
- Created when you create reminders from emails in Mail.app

## Legacy Endpoints (Deprecated)

These endpoints are maintained for backward compatibility but should not be used in new implementations:

```http
DELETE /lists/{listName}/reminders/{id}
PATCH /lists/{listName}/reminders/{id}/complete
PATCH /lists/{listName}/reminders/{id}/uncomplete
```

Use the UUID-based endpoints instead:
```http
DELETE /reminders/{uuid}
PATCH /reminders/{uuid}/complete
PATCH /reminders/{uuid}/uncomplete
```

## Error Handling

### Standard HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no response body |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 404 | Not Found - Requested resource not found |
| 500 | Internal Server Error - Server error occurred |

### Error Response Format

```json
{
  "error": "Error message description",
  "status": 400
}
```

### Common Error Scenarios

**Authentication Required:**
```json
{
  "error": "Authentication required",
  "status": 401
}
```

**Invalid Reminder UUID:**
```json
{
  "error": "Reminder not found",
  "status": 404
}
```

**Invalid List Name:**
```json
{
  "error": "List 'InvalidList' not found",
  "status": 404
}
```

## Integration Examples

### Complete cURL Examples

**Get all lists:**
```bash
curl "http://localhost:8080/lists" \
  -H "Authorization: Bearer your-api-token-here"
```

**Create a reminder:**
```bash
curl -X POST "http://localhost:8080/lists/Shopping/reminders" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "notes": "Milk, bread, eggs",
    "dueDate": "2024-01-15T10:00:00Z",
    "priority": "medium"
  }'
```

**Get a specific reminder:**
```bash
curl "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here"
```

**Update a reminder:**
```bash
curl -X PATCH "http://localhost:8080/reminders/ABC123-DEF456-GHI789" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "priority": "high"
  }'
```

**Search for subtasks:**
```bash
curl "http://localhost:8080/search?isSubtask=true" \
  -H "Authorization: Bearer your-api-token-here"
```

**Find reminders with URL attachments:**
```bash
curl "http://localhost:8080/search?hasAttachedUrl=true" \
  -H "Authorization: Bearer your-api-token-here"
```

**Create a webhook:**
```bash
curl -X POST "http://localhost:8080/webhooks" \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-webhook-endpoint.com/webhook",
    "name": "High priority work reminders",
    "filter": {
      "listNames": ["Work"],
      "priorityLevels": [5, 9],
      "completed": "incomplete"
    }
  }'
```

### JavaScript Example

```javascript
const API_BASE = 'http://localhost:8080';
const API_TOKEN = 'your-token-here';

async function createReminder(listName, title, options = {}) {
  const response = await fetch(`${API_BASE}/lists/${encodeURIComponent(listName)}/reminders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      ...options
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function findSubtasks() {
  const response = await fetch(`${API_BASE}/search?isSubtask=true`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Usage
createReminder('Shopping', 'Buy groceries', {
  notes: 'Milk, bread, eggs',
  dueDate: '2024-01-15T10:00:00Z',
  priority: 'medium'
}).then(reminder => {
  console.log('Created reminder:', reminder.uuid);
  console.log('Has URL attachment:', reminder.attachedUrl ? 'Yes' : 'No');
  console.log('Is subtask:', reminder.isSubtask ? 'Yes' : 'No');
});
```

### Python Example

```python
import requests
import json

class RemindersAPI:
    def __init__(self, base_url="http://localhost:8080", token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            })
    
    def create_reminder(self, list_name, title, **kwargs):
        data = {'title': title}
        data.update(kwargs)
        
        response = self.session.post(
            f"{self.base_url}/lists/{list_name}/reminders",
            json=data
        )
        response.raise_for_status()
        return response.json()
    
    def search_reminders(self, **filters):
        response = self.session.get(
            f"{self.base_url}/search",
            params=filters
        )
        response.raise_for_status()
        return response.json()
    
    def find_subtasks(self):
        """Find all subtask reminders"""
        return self.search_reminders(isSubtask=True)
    
    def find_reminders_with_urls(self):
        """Find reminders with URL attachments"""
        return self.search_reminders(hasAttachedUrl=True)

# Usage
api = RemindersAPI(token="your-token-here")

# Create reminder
reminder = api.create_reminder(
    "Shopping",
    "Buy groceries",
    notes="Milk, bread, eggs",
    dueDate="2024-01-15T10:00:00Z",
    priority="medium"
)

print(f"Created: {reminder['title']} ({reminder['uuid']})")
print(f"URL attachment: {reminder.get('attachedUrl', 'None')}")
print(f"Is subtask: {reminder['isSubtask']}")

# Search for subtasks
subtasks = api.find_subtasks()
print(f"Found {len(subtasks)} subtasks")

# Search for reminders with URLs
url_reminders = api.find_reminders_with_urls()
print(f"Found {len(url_reminders)} reminders with URL attachments")
```

## OpenAPI Specification

While this API doesn't automatically generate OpenAPI specs, you can create one based on this documentation. Here's the basic structure:

### Manual OpenAPI Generation

**Basic OpenAPI 3.0 spec structure:**
```yaml
openapi: 3.0.0
info:
  title: Reminders CLI API
  description: REST API for macOS Reminders with private API features
  version: 1.0.0
servers:
  - url: http://localhost:8080
    description: Local development server
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  schemas:
    Reminder:
      type: object
      properties:
        uuid:
          type: string
        title:
          type: string
        notes:
          type: string
          nullable: true
        isCompleted:
          type: boolean
        priority:
          type: integer
        attachedUrl:
          type: string
          nullable: true
        mailUrl:
          type: string
          nullable: true
        parentId:
          type: string
          nullable: true
        isSubtask:
          type: boolean
paths:
  /lists:
    get:
      summary: Get all reminder lists
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of reminder lists
```

### Automated OpenAPI Generation

To add automated OpenAPI spec generation to the server, you could:

1. **Add OpenAPI generation dependency to Package.swift:**
```swift
.package(url: "https://github.com/mattpolzin/OpenAPIKit.git", from: "2.0.0")
```

2. **Add OpenAPI endpoint:**
```bash
# This would require code changes to generate spec automatically
curl "http://localhost:8080/openapi.json" \
  -H "Authorization: Bearer your-api-token-here"
```

*Note: Automatic OpenAPI generation would require additional implementation in the server code.*

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure Reminders access is granted to the application
2. **Token Authentication**: Verify token is correctly set and valid
3. **List Not Found**: Check exact list name spelling and case sensitivity
4. **Webhook Delivery Failures**: Ensure webhook URL is accessible and returns 2xx status
5. **Date Format Issues**: Use ISO8601 format for all dates
6. **Private API Fields Empty**: These fields are only populated when reminders have the corresponding data

### Debug Mode

Start server with verbose logging:
```bash
# Build and run with debug environment variable
make build-api
REMINDERS_API_DEBUG=1 ./.build/apple/Products/Release/reminders-api --token your-token
```

### Quick Commands

```bash
# Build just the API server
make build-api

# Build and run the API server immediately  
make run-api

# Clean and rebuild everything
make clean && make build-api
```

### Testing Webhooks

Use tools like ngrok for local webhook testing:
```bash
ngrok http 3000
# Use the ngrok URL as your webhook endpoint
```

## Rate Limiting & Performance

- No explicit rate limiting implemented
- Webhook delivery timeout: 5 seconds
- Search operations support pagination via `limit` parameter
- Concurrent webhook deliveries supported
- EventKit notifications processed asynchronously

## Security Considerations

- API tokens should be treated as secrets
- HTTPS recommended for production deployments
- CORS enabled for web applications
- Webhook URLs should use HTTPS
- No rate limiting - implement at reverse proxy level if needed
- Private API fields may contain sensitive information (URLs, email references)