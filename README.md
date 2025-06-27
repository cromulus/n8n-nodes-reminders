# n8n-nodes-reminders

![Build Status](https://github.com/your-username/n8n-nodes-reminders/workflows/Build%20and%20Publish/badge.svg)
![npm version](https://img.shields.io/npm/v/n8n-nodes-reminders.svg)
![GitHub release](https://img.shields.io/github/v/release/your-username/n8n-nodes-reminders)

n8n community nodes for integrating with macOS Reminders through the Reminders CLI HTTP API. This package provides both traditional workflow nodes and AI-powered tool nodes for seamless automation.

## Features

- 🔧 **Traditional n8n Node**: Full CRUD operations for lists, reminders, and webhooks
- 🤖 **AI Tool Node**: Optimized for AI agent workflows with structured responses
- 🔒 **Flexible Authentication**: Support for optional API tokens
- 🌐 **Configurable Endpoints**: Works with any Reminders CLI server
- 📝 **Comprehensive Operations**: Create, read, update, delete, search reminders
- 🔍 **Advanced Search**: Filter by completion status, dates, priority, and more
- 🪝 **Webhook Support**: Real-time notifications for reminder changes
- ✨ **Declarative Design**: Clean, maintainable code with built-in routing

## Installation

### Option 1: Install from GitHub (Recommended)

```bash
# Install directly from GitHub repository
npm install your-username/n8n-nodes-reminders

# Or install a specific version/release
npm install your-username/n8n-nodes-reminders#v1.0.0
```

### Option 2: Install from npm (if published)

```bash
npm install n8n-nodes-reminders
```

### Option 3: Install from GitHub Packages

```bash
# Configure npm to use GitHub Packages for scoped packages
echo "@your-username:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install the scoped package
npm install @your-username/n8n-nodes-reminders
```

## Prerequisites

1. **Reminders CLI**: You need the Reminders CLI tool running as an HTTP server
   - Install from: [Reminders CLI Repository](https://github.com/cromulus/reminders-cli)
   - Start the server with authentication: `reminders-api --auth-required --token RANDOMTOKEN`

2. **n8n**: This package requires n8n to be installed
   - Install n8n: `npm install -g n8n`
   - Or use via Docker: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`

## Configuration

### Setting up Credentials

1. In n8n, go to **Credentials** → **New**
2. Search for "Reminders API" and select it
3. Configure the following:
   - **Base URL**: Your Reminders CLI server URL (e.g., `http://127.0.0.1:8080`)
   - **API Token**: Optional authentication token
   - **Ignore SSL Issues**: Enable for development/self-signed certificates

### API Token Generation (Optional)

If your Reminders CLI server requires authentication:

```bash
# Generate an API token
reminders-api --generate-token

# Start server with token validation
reminders-api --port 8080 --require-token
```

## Usage

### Traditional Reminders Node

The traditional node provides a user-friendly interface for all reminder operations:

#### List Operations
- **Get Many Lists**: Retrieve all reminder lists
- **Get Reminders from List**: Get reminders from a specific list

#### Reminder Operations
- **Create**: Add new reminders to lists
- **Get**: Retrieve specific reminders by UUID
- **Get Many**: Fetch all reminders across lists
- **Update**: Modify existing reminders
- **Delete**: Remove reminders
- **Complete/Uncomplete**: Mark reminders as done or pending

#### Search Operations
- **Advanced Search**: Filter reminders by:
  - Text query (title/notes)
  - Completion status
  - Due dates (before/after)
  - Priority levels
  - List names
  - Creation/modification dates

#### Webhook Operations
- **Create**: Set up webhook notifications
- **Manage**: Update, delete, test webhooks
- **Monitor**: Get all configured webhooks

### AI Tool Node (RemindersAiTool)

The AI tool node is designed for use with AI agents and provides structured responses:

#### Supported Actions
```json
{
  "action": "create_reminder",
  "list_name": "Shopping",
  "title": "Buy groceries",
  "notes": "Milk, bread, eggs",
  "due_date": "2024-01-15T10:00:00Z",
  "priority": "high"
}
```

#### Available Actions
- `get_lists`: Retrieve all reminder lists
- `get_reminders`: Get reminders (optionally from specific list)
- `create_reminder`: Create new reminders
- `update_reminder`: Modify existing reminders
- `delete_reminder`: Remove reminders
- `search_reminders`: Advanced search with filters
- `complete_reminder`: Mark reminders as completed/incomplete
- `setup_webhook`: Configure webhook notifications

#### Response Format
```json
{
  "success": true,
  "action": "create_reminder",
  "data": { "uuid": "...", "title": "Buy groceries" },
  "summary": "Created reminder 'Buy groceries' in Shopping list due Jan 15"
}
```

## API Reference

### Reminders CLI HTTP API

The nodes communicate with the Reminders CLI HTTP API. Key endpoints include:

- `GET /lists` - Get all lists
- `GET /lists/{name}` - Get reminders from list
- `POST /lists/{name}/reminders` - Create reminder
- `GET /reminders` - Get all reminders
- `GET /reminders/{uuid}` - Get specific reminder
- `PATCH /reminders/{uuid}` - Update reminder
- `DELETE /reminders/{uuid}` - Delete reminder
- `GET /search` - Search reminders
- `POST /webhooks` - Create webhook

### Authentication

When using API tokens, include them in the Authorization header:
```
Authorization: Bearer your-api-token-here
```

## Examples

### Creating a Reminder Workflow

1. Add "Reminders" node to your workflow
2. Select "Reminder" → "Create"
3. Configure:
   - List Name: "Work Tasks"
   - Title: "Review quarterly reports"
   - Due Date: Set to next Friday
   - Priority: "high"

### AI Agent Integration

```javascript
// In an AI agent workflow
const reminderAction = {
  action: "create_reminder",
  list_name: "AI Tasks",
  title: "Follow up on user request",
  notes: "User asked about project status",
  priority: "medium"
};

// Send to RemindersAiTool node
// Receive structured response for further processing
```

### Search and Filter

1. Add "Reminders" node
2. Select "Search" → "Search Reminders"
3. Configure filters:
   - Query: "urgent"
   - Completion Status: "Incomplete Only"
   - Due Before: End of current week
   - Sort By: "Due Date"

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/n8n-nodes-reminders.git
cd n8n-nodes-reminders

# Install dependencies
npm install

# Build the package
npm run build

# Run linting
npm run lint

# Create package for testing
npm pack
```

### Testing Locally

```bash
# Build and link for local development
npm run build
npm link

# In your n8n installation directory
npm link n8n-nodes-reminders

# Restart n8n to load the nodes
```

### Project Structure

```
n8n-nodes-reminders/
├── credentials/
│   └── RemindersApi.credentials.ts    # API credentials configuration
├── nodes/
│   ├── Reminders/
│   │   └── Reminders.node.ts          # Traditional n8n node
│   └── RemindersAiTool/
│       └── RemindersAiTool.node.ts    # AI tool node
├── .github/workflows/                 # GitHub Actions
├── dist/                             # Built files
└── package.json
```

## Troubleshooting

### Connection Issues

1. **Verify Reminders CLI is running**:
   ```bash
   curl http://127.0.0.1:8080/lists
   ```

2. **Check credentials configuration**:
   - Ensure Base URL is correct
   - Verify API token if required
   - Test connection in n8n credentials page

3. **SSL/Certificate issues**:
   - Enable "Ignore SSL Issues" for development
   - Use proper certificates for production

### Common Errors

- **"Connection refused"**: Reminders CLI server not running
- **"Unauthorized"**: Invalid or missing API token
- **"List not found"**: Verify list name exists in Reminders app
- **"Invalid UUID"**: Check reminder UUID format

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Release Process

Releases are automated via GitHub Actions:

1. Use the "Release" workflow in GitHub Actions
2. Specify version (e.g., "1.1.0", "patch", "minor", "major")
3. Workflow will:
   - Run tests and build
   - Update version numbers
   - Create GitHub release
   - Publish to npm and GitHub Packages

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/your-username/n8n-nodes-reminders)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-reminders)
- [GitHub Packages](https://github.com/your-username/n8n-nodes-reminders/packages)
- [Reminders CLI](https://github.com/cromulus/reminders-cli)
- [n8n Community](https://community.n8n.io/)

## Support

- 🐛 [Report Issues](https://github.com/your-username/n8n-nodes-reminders/issues)
- 💬 [Discussions](https://github.com/your-username/n8n-nodes-reminders/discussions)
- 📖 [Documentation](https://github.com/your-username/n8n-nodes-reminders/wiki)

---

Made with ❤️ for the n8n community