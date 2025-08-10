#!/usr/bin/env node

/**
 * Replit Platform Status Monitor
 * Automated monitoring for database migration infrastructure restoration
 */

import https from 'https';

const STATUS_URL = 'https://status.replit.com';
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ALERT_KEYWORDS = ['database', 'migration', 'deployment', 'infrastructure', 'outage'];

class PlatformStatusMonitor {
  constructor() {
    this.lastKnownStatus = null;
    this.issueStartTime = new Date('2025-08-10');
    this.monitoringActive = true;
  }

  async checkStatus() {
    try {
      console.log(`[${new Date().toISOString()}] Checking Replit status...`);
      
      const statusData = await this.fetchStatus();
      const currentStatus = this.parseStatus(statusData);
      
      if (this.hasStatusChanged(currentStatus)) {
        this.handleStatusChange(currentStatus);
      }
      
      this.lastKnownStatus = currentStatus;
      
      if (currentStatus.isFullyOperational) {
        console.log('✅ All systems operational - Ready for deployment retry');
        return true;
      }
      
      console.log(`⏳ Status: ${currentStatus.summary}`);
      return false;
      
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
      return false;
    }
  }

  fetchStatus() {
    return new Promise((resolve, reject) => {
      const request = https.get(STATUS_URL, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve(data);
        });
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy(new Error('Status check timeout'));
      });
    });
  }

  parseStatus(htmlData) {
    const status = {
      isFullyOperational: false,
      summary: 'Unknown',
      relevantIssues: [],
      timestamp: new Date().toISOString()
    };

    // Check for operational status
    if (htmlData.includes('All Systems Operational')) {
      status.isFullyOperational = true;
      status.summary = 'All Systems Operational';
    }

    // Check for database/deployment related issues
    const lowerData = htmlData.toLowerCase();
    ALERT_KEYWORDS.forEach(keyword => {
      if (lowerData.includes(keyword) && lowerData.includes('issue')) {
        status.relevantIssues.push(keyword);
      }
    });

    if (status.relevantIssues.length > 0) {
      status.summary = `Issues detected: ${status.relevantIssues.join(', ')}`;
    } else if (!status.isFullyOperational) {
      status.summary = 'Some systems experiencing issues';
    }

    return status;
  }

  hasStatusChanged(currentStatus) {
    if (!this.lastKnownStatus) return true;
    
    return (
      this.lastKnownStatus.isFullyOperational !== currentStatus.isFullyOperational ||
      this.lastKnownStatus.summary !== currentStatus.summary
    );
  }

  handleStatusChange(currentStatus) {
    console.log('\n🔄 STATUS CHANGE DETECTED:');
    console.log(`Previous: ${this.lastKnownStatus?.summary || 'Unknown'}`);
    console.log(`Current: ${currentStatus.summary}`);
    
    if (currentStatus.isFullyOperational && this.lastKnownStatus && !this.lastKnownStatus.isFullyOperational) {
      console.log('\n🎉 PLATFORM RESTORED! Ready for deployment retry:');
      this.logDeploymentInstructions();
    }
    
    this.logStatusToFile(currentStatus);
  }

  logDeploymentInstructions() {
    console.log('\n📋 DEPLOYMENT RETRY STEPS:');
    console.log('1. Verify database connection: npm run db:push');
    console.log('2. Test build process: npm run build');
    console.log('3. Initiate deployment through Replit interface');
    console.log('4. Monitor migration logs for successful execution');
  }

  logStatusToFile(status) {
    const logEntry = {
      timestamp: status.timestamp,
      status: status.summary,
      isOperational: status.isFullyOperational,
      issues: status.relevantIssues,
      issueDowntime: this.calculateDowntime()
    };

    // In a real implementation, this would write to a persistent log file
    console.log('📝 Status logged:', JSON.stringify(logEntry, null, 2));
  }

  calculateDowntime() {
    const now = new Date();
    const downtime = now - this.issueStartTime;
    const hours = Math.floor(downtime / (1000 * 60 * 60));
    const minutes = Math.floor((downtime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  async startMonitoring() {
    console.log('🚀 Starting Replit Platform Status Monitor');
    console.log(`📡 Monitoring URL: ${STATUS_URL}`);
    console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000 / 60} minutes`);
    console.log(`📅 Issue started: ${this.issueStartTime.toISOString()}\n`);

    // Initial check
    const isOperational = await this.checkStatus();
    
    if (isOperational) {
      console.log('\n✅ Platform is operational! You can attempt deployment now.');
      return;
    }

    // Set up periodic monitoring
    const interval = setInterval(async () => {
      if (!this.monitoringActive) {
        clearInterval(interval);
        return;
      }

      const isOperational = await this.checkStatus();
      if (isOperational) {
        console.log('\n🎯 Platform restored! Stopping monitor.');
        clearInterval(interval);
        this.monitoringActive = false;
      }
    }, CHECK_INTERVAL);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down monitor...');
      clearInterval(interval);
      this.monitoringActive = false;
      process.exit(0);
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PlatformStatusMonitor();
  monitor.startMonitoring().catch(console.error);
}

export default PlatformStatusMonitor;