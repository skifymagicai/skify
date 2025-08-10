#!/usr/bin/env node

/**
 * Replit Status Monitor
 * Monitors https://status.replit.com for platform infrastructure updates
 * Specifically tracks database migration service status
 */

const fetch = require('node-fetch');

class ReplitStatusMonitor {
  constructor() {
    this.statusUrl = 'https://status.replit.com/api/v2/status.json';
    this.incidentsUrl = 'https://status.replit.com/api/v2/incidents.json';
    this.checkInterval = 60000; // Check every minute
    this.lastStatus = null;
  }

  async fetchStatus() {
    try {
      const response = await fetch(this.statusUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching Replit status:', error.message);
      return null;
    }
  }

  async fetchIncidents() {
    try {
      const response = await fetch(this.incidentsUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching incidents:', error.message);
      return null;
    }
  }

  formatStatus(status) {
    const indicators = {
      'none': '🟢 Operational',
      'minor': '🟡 Minor Issues',
      'major': '🟠 Major Issues',
      'critical': '🔴 Critical Issues'
    };
    return indicators[status] || `❓ Unknown (${status})`;
  }

  async checkDatabaseServices(incidents) {
    const dbRelatedKeywords = [
      'database', 'migration', 'deployment', 'postgres', 'sql',
      'infrastructure', 'platform', 'deployment'
    ];
    
    if (!incidents || !incidents.incidents) return [];
    
    return incidents.incidents.filter(incident => {
      const description = (incident.name + ' ' + incident.body).toLowerCase();
      return dbRelatedKeywords.some(keyword => description.includes(keyword));
    });
  }

  logStatusUpdate(status, incidents) {
    const timestamp = new Date().toISOString();
    const overallStatus = this.formatStatus(status.indicator);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Replit Status Check - ${timestamp}`);
    console.log('='.repeat(60));
    console.log(`Overall Status: ${overallStatus}`);
    console.log(`Description: ${status.description}`);
    
    if (incidents && incidents.length > 0) {
      console.log('\n🚨 Database/Deployment Related Incidents:');
      incidents.forEach(incident => {
        console.log(`  • ${incident.name}`);
        console.log(`    Status: ${incident.status}`);
        console.log(`    Created: ${new Date(incident.created_at).toLocaleString()}`);
        if (incident.incident_updates && incident.incident_updates.length > 0) {
          const latest = incident.incident_updates[0];
          console.log(`    Latest: ${latest.body}`);
        }
      });
    }
    
    // Check if status improved
    if (this.lastStatus && this.lastStatus !== status.indicator) {
      if (status.indicator === 'none' && this.lastStatus !== 'none') {
        console.log('\n🎉 STATUS IMPROVED! Platform is now operational!');
        console.log('✅ You can now retry your deployment!');
      } else if (status.indicator !== 'none' && this.lastStatus === 'none') {
        console.log('\n⚠️ STATUS DEGRADED! New issues detected.');
      }
    }
    
    this.lastStatus = status.indicator;
  }

  async monitor() {
    console.log('🔍 Starting Replit Status Monitor...');
    console.log('👁️ Watching for database migration service restoration...');
    console.log('⏰ Checking every minute for updates...\n');

    while (true) {
      const [status, incidents] = await Promise.all([
        this.fetchStatus(),
        this.fetchIncidents()
      ]);

      if (status) {
        const dbIncidents = await this.checkDatabaseServices(incidents);
        this.logStatusUpdate(status.status, dbIncidents);
        
        // If operational and was previously having issues, highlight this
        if (status.status.indicator === 'none' && dbIncidents.length === 0) {
          console.log('\n✅ DEPLOYMENT READY: Platform appears operational!');
        }
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, this.checkInterval));
    }
  }
}

// Usage instructions
console.log(`
🚀 Replit Status Monitor for Skify Deployment

This tool monitors Replit's platform status and alerts you when
the database migration service is restored.

Usage:
  node replit-status-monitor.js

What it monitors:
  ✓ Overall platform status
  ✓ Database-related incidents
  ✓ Deployment service issues
  ✓ Infrastructure problems

When to redeploy:
  ✓ Status shows "Operational"
  ✓ No database-related incidents
  ✓ You receive the "DEPLOYMENT READY" message

Press Ctrl+C to stop monitoring.
`);

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new ReplitStatusMonitor();
  monitor.monitor().catch(console.error);
}

module.exports = ReplitStatusMonitor;