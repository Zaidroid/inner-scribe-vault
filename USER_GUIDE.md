
# SelfMastery App - User Guide

## Overview

SelfMastery is a privacy-focused personal development application that combines journaling, habit tracking, and AI-powered insights. All your data is stored locally on your device with end-to-end encryption, ensuring complete privacy.

## Getting Started

### First Launch
1. Open the application in your web browser
2. You'll be greeted with the dashboard showing your progress overview
3. Start by creating your first journal entry or habit

### Navigation
- **Dashboard**: Overview of your progress and quick actions
- **Journal**: Write and manage your journal entries
- **Habits**: Track and manage your daily habits
- **Settings**: Configure the app and manage your data

## Core Features

### 📝 Journaling

#### Creating a Journal Entry
1. Navigate to the Journal section
2. Click "New Entry" button
3. Fill in:
   - **Title**: A brief description of your entry
   - **Content**: Your thoughts, reflections, or experiences
   - **Mood**: Select from terrible, bad, okay, good, or great
   - **Tags**: Add relevant tags for organization
4. Click "Save Entry"

#### Managing Entries
- **View**: Click on any entry to read the full content
- **Search**: Use tags or keywords to find specific entries
- **Export**: Export individual entries to Obsidian (when configured)
- **Delete**: Remove entries you no longer need

### 🎯 Habit Tracking

#### Creating a Habit
1. Go to the Habits section
2. Click "Add Habit"
3. Configure:
   - **Name**: What you want to track (e.g., "Drink water", "Exercise")
   - **Frequency**: Daily, weekly, or monthly
   - **Target**: How many times per frequency period
4. Click "Create Habit"

#### Tracking Progress
- **Mark Complete**: Click the checkbox when you complete a habit
- **View Streaks**: See your current streak and progress
- **Progress Bar**: Visual representation of completion rate
- **Statistics**: View completion rates and trends

### 🤖 AI Insights

The app generates AI-powered insights based on your journal entries and habit data:
- **Mood Analysis**: Patterns in your emotional state
- **Behavior Correlations**: Connections between habits and mood
- **Productivity Insights**: Peak performance times and conditions
- **Recommendations**: Suggested improvements based on your data

#### Requirements for AI Features
- **Ollama**: Install and run Ollama locally
- **Configuration**: Set the correct endpoint in Settings
- **Models**: Ensure you have appropriate language models installed

### ⚙️ Settings & Configuration

#### Privacy & Security
- **Local Encryption**: All data is encrypted with AES-256
- **No Cloud Storage**: Everything stays on your device
- **Data Control**: Export, import, or delete all data at any time

#### Obsidian Integration
1. **Enable Sync**: Toggle "Enable Vault Sync" in Settings
2. **Set Path**: Enter your Obsidian vault path
3. **Export**: Journal entries will be downloaded as markdown files
4. **Format**: Entries include metadata, tags, and content

#### AI Configuration
1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Start Service**: Run `ollama serve` in terminal
3. **Configure Endpoint**: Set to `http://localhost:11434` (default)
4. **Test Connection**: Use the "Test" button in Settings

## Data Management

### Backup & Restore
- **Export**: Download all your data as encrypted JSON
- **Import**: Restore from a previous backup
- **Format**: Includes journals, habits, and settings

### Privacy Considerations
- **Local Only**: No data is sent to external servers
- **Encryption**: All sensitive data is encrypted
- **Browser Storage**: Uses IndexedDB for local persistence
- **No Tracking**: No analytics or user tracking

## Troubleshooting

### Common Issues

#### App Won't Load
- Clear browser cache and reload
- Check browser console for errors
- Try incognito/private browsing mode

#### Data Not Saving
- Ensure browser allows local storage
- Check available storage space
- Try exporting data as backup

#### AI Features Not Working
- Verify Ollama is installed and running
- Check endpoint URL in Settings
- Test connection using Settings page
- Ensure appropriate models are downloaded

#### Obsidian Export Issues
- Verify vault path is correct
- Check browser download permissions
- Ensure Obsidian is not blocking file access

### Performance Tips
- **Regular Cleanup**: Periodically export and clear old data
- **Browser Updates**: Keep your browser updated
- **Memory**: Close other tabs if experiencing slowdowns
- **Storage**: Monitor available device storage

## Maintenance Requirements

### For Optimal Performance

#### Daily
- No daily maintenance required
- App runs entirely in browser

#### Weekly
- **Backup Data**: Export your data weekly
- **Clear Browser Cache**: If experiencing slowdowns
- **Check Ollama**: Ensure AI service is running

#### Monthly
- **Review Settings**: Verify configurations
- **Update Ollama**: Check for model updates
- **Storage Cleanup**: Review and delete unnecessary data

#### As Needed
- **Browser Updates**: Install browser updates
- **Ollama Updates**: Update when new versions available
- **Data Migration**: Export data before major browser changes

### System Requirements

#### Minimum
- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+)
- 100MB available storage
- JavaScript enabled

#### Recommended
- Latest browser version
- 500MB+ available storage
- Ollama installed for AI features
- Obsidian for note integration

#### For AI Features
- **Ollama**: Download from [ollama.ai](https://ollama.ai)
- **System RAM**: 4GB+ recommended
- **Models**: Download appropriate language models
- **Network**: Local network access for API calls

## Security Best Practices

### Data Protection
- **Regular Backups**: Export data frequently
- **Secure Storage**: Keep backup files in secure location
- **Access Control**: Don't share device access
- **Browser Security**: Use latest browser versions

### Privacy Maintenance
- **Local Processing**: Verify AI processing stays local
- **No Cloud Sync**: Disable automatic cloud syncing
- **Incognito Mode**: Use for extra privacy if needed
- **Device Security**: Ensure device-level security

## Advanced Usage

### Custom Workflows
- **Morning Routine**: Journal + habit check-in
- **Evening Review**: Reflect on day + plan tomorrow
- **Weekly Analysis**: Review AI insights and patterns
- **Monthly Goals**: Set and track longer-term objectives

### Integration Tips
- **Obsidian**: Use for long-term note organization
- **Calendar**: Schedule regular journaling times
- **Reminders**: Set habits reminders in your system
- **Meditation**: Use app to track mindfulness practices

## Support & Resources

### Self-Help
- Review this guide for common questions
- Check browser console for error messages
- Test individual features to isolate issues
- Try safe mode (incognito) browsing

### Community Resources
- Ollama documentation for AI setup
- Obsidian community for integration tips
- Browser documentation for storage issues
- Local privacy communities for security advice

### Technical Specifications
- **Storage**: IndexedDB with AES-256 encryption
- **Framework**: React with TypeScript
- **AI**: Local Ollama integration
- **Export**: JSON and Markdown formats
- **Privacy**: Zero external data transmission

---

## Quick Start Checklist

- [ ] Create your first journal entry
- [ ] Set up at least one habit to track
- [ ] Configure Obsidian integration (optional)
- [ ] Install and configure Ollama for AI features (optional)
- [ ] Set up regular backup routine
- [ ] Customize settings to your preferences
- [ ] Review privacy settings
- [ ] Test export functionality

**Remember**: Your privacy is paramount. This app is designed to keep everything local and secure. Regular backups ensure you never lose your valuable personal data.
