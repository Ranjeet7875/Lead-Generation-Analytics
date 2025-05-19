import { useState, useEffect } from 'react';
const generateSampleData = () => {
  const channels = ['Paid Search', 'Social Media', 'Email', 'Organic', 'Referral'];
  const campaigns = ['Summer Sale', 'Product Launch', 'Retargeting', 'Brand Awareness'];
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2025, 4, 15);
  
  // Generate leads data
  const leads = [];
  for (let i = 0; i < 10000; i++) {
    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const leadScore = Math.floor(Math.random() * 100);
    const cost = Math.random() * 20 + 5;
    
    leads.push({
      id: `lead-${i}`,
      date: date.toISOString().split('T')[0],
      channel,
      campaign,
      leadScore,
      cost,
      converted: Math.random() > 0.7
    });
  }
  
  return leads;
};

// Dashboard layout component
const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: {
      start: '2025-01-01',
      end: '2025-05-15'
    },
    campaigns: [],
    leadScoreRange: [0, 100],
    channels: []
  });

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      const generatedData = generateSampleData();
      setData(generatedData);
      setFilteredData(generatedData);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      const dateMatches = itemDate >= startDate && itemDate <= endDate;
      const campaignMatches = filters.campaigns.length === 0 || 
                             filters.campaigns.includes(item.campaign);
      const channelMatches = filters.channels.length === 0 || 
                            filters.channels.includes(item.channel);
      const scoreMatches = item.leadScore >= filters.leadScoreRange[0] && 
                          item.leadScore <= filters.leadScoreRange[1];
      
      return dateMatches && campaignMatches && channelMatches && scoreMatches;
    });
    
    setFilteredData(filtered);
  }, [filters, data]);

  // Update filters based on user input
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Calculate summary metrics
  const calculateMetrics = () => {
    if (filteredData.length === 0) return {
      totalLeads: 0,
      avgLeadScore: 0,
      conversionRate: 0,
      costPerLead: 0,
      totalCost: 0
    };
    
    const totalLeads = filteredData.length;
    const totalCost = filteredData.reduce((sum, lead) => sum + lead.cost, 0);
    const totalScore = filteredData.reduce((sum, lead) => sum + lead.leadScore, 0);
    const conversions = filteredData.filter(lead => lead.converted).length;
    
    return {
      totalLeads,
      avgLeadScore: (totalScore / totalLeads).toFixed(1),
      conversionRate: ((conversions / totalLeads) * 100).toFixed(1),
      costPerLead: (totalCost / totalLeads).toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  // Calculate metrics by channel
  const calculateChannelMetrics = () => {
    const channels = {};
    
    filteredData.forEach(lead => {
      if (!channels[lead.channel]) {
        channels[lead.channel] = {
          leads: 0,
          cost: 0,
          conversions: 0,
          totalScore: 0
        };
      }
      
      channels[lead.channel].leads++;
      channels[lead.channel].cost += lead.cost;
      channels[lead.channel].totalScore += lead.leadScore;
      if (lead.converted) channels[lead.channel].conversions++;
    });
    
    return Object.keys(channels).map(channel => ({
      name: channel,
      leads: channels[channel].leads,
      conversions: channels[channel].conversions,
      conversionRate: ((channels[channel].conversions / channels[channel].leads) * 100).toFixed(1),
      cpl: (channels[channel].cost / channels[channel].leads).toFixed(2),
      avgScore: (channels[channel].totalScore / channels[channel].leads).toFixed(1)
    }));
  };

  // Get unique campaign and channel values for filters
  const getFilterOptions = () => {
    const campaigns = [...new Set(data.map(item => item.campaign))];
    const channels = [...new Set(data.map(item => item.channel))];
    return { campaigns, channels };
  };

  // Calculate lead distribution by score
  const calculateLeadScoreDistribution = () => {
    const distribution = {
      "Low (0-30)": 0,
      "Medium (31-70)": 0,
      "High (71-100)": 0
    };
    
    filteredData.forEach(lead => {
      if (lead.leadScore <= 30) distribution["Low (0-30)"]++;
      else if (lead.leadScore <= 70) distribution["Medium (31-70)"]++;
      else distribution["High (71-100)"]++;
    });
    
    return Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));
  };

  // Calculate campaign performance
  const calculateCampaignPerformance = () => {
    const campaigns = {};
    
    filteredData.forEach(lead => {
      if (!campaigns[lead.campaign]) {
        campaigns[lead.campaign] = {
          leads: 0,
          cost: 0,
          conversions: 0
        };
      }
      
      campaigns[lead.campaign].leads++;
      campaigns[lead.campaign].cost += lead.cost;
      if (lead.converted) campaigns[lead.campaign].conversions++;
    });
    
    return Object.keys(campaigns).map(campaign => ({
      name: campaign,
      leads: campaigns[campaign].leads,
      conversions: campaigns[campaign].conversions,
      conversionRate: ((campaigns[campaign].conversions / campaigns[campaign].leads) * 100).toFixed(1),
      cpl: (campaigns[campaign].cost / campaigns[campaign].leads).toFixed(2)
    }));
  };

  const metrics = calculateMetrics();
  const channelMetrics = calculateChannelMetrics();
  const campaignPerformance = calculateCampaignPerformance();
  const leadScoreDistribution = calculateLeadScoreDistribution();
  const filterOptions = getFilterOptions();

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Lead Generation Analytics</h1>
        <div className="user-info">
          <span className="user-name">Marketing Agency Pro</span>
          <div className="user-avatar"></div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input 
                  type="date" 
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Campaigns</label>
              <select 
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('campaigns', selected);
                }}
              >
                {filterOptions.campaigns.map(campaign => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Channels</label>
              <select 
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('channels', selected);
                }}
              >
                {filterOptions.channels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Lead Score Range: {filters.leadScoreRange[0]} - {filters.leadScoreRange[1]}</label>
              <div className="range-inputs">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={filters.leadScoreRange[0]}
                  onChange={(e) => handleFilterChange('leadScoreRange', [
                    parseInt(e.target.value), 
                    filters.leadScoreRange[1]
                  ])}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={filters.leadScoreRange[1]}
                  onChange={(e) => handleFilterChange('leadScoreRange', [
                    filters.leadScoreRange[0], 
                    parseInt(e.target.value)
                  ])}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="content">
          {isLoading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : (
            <>
              <div className="metrics-summary">
                <div className="metric-card">
                  <h3>Total Leads</h3>
                  <p className="metric-value">{metrics.totalLeads.toLocaleString()}</p>
                </div>
                <div className="metric-card">
                  <h3>Avg. Lead Score</h3>
                  <p className="metric-value">{metrics.avgLeadScore}</p>
                </div>
                <div className="metric-card">
                  <h3>Conversion Rate</h3>
                  <p className="metric-value">{metrics.conversionRate}%</p>
                </div>
                <div className="metric-card">
                  <h3>Cost Per Lead</h3>
                  <p className="metric-value">${metrics.costPerLead}</p>
                </div>
                <div className="metric-card">
                  <h3>Total Ad Spend</h3>
                  <p className="metric-value">${metrics.totalCost}</p>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-container lead-by-channel">
                  <h3>Channel Performance</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Leads</th>
                        <th>Conv. Rate</th>
                        <th>Cost/Lead</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelMetrics.map(channel => (
                        <tr key={channel.name}>
                          <td>{channel.name}</td>
                          <td>{channel.leads}</td>
                          <td>{channel.conversionRate}%</td>
                          <td>${channel.cpl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="chart-container lead-quality">
                  <h3>Lead Quality Distribution</h3>
                  <div className="score-distribution">
                    {leadScoreDistribution.map(category => (
                      <div className="score-bar" key={category.name}>
                        <div className="score-label">{category.name}</div>
                        <div className="score-value" 
                             style={{width: `${(category.value / filteredData.length) * 100}%`}}>
                          {category.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="campaign-performance">
                <h3>Campaign Performance</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Leads</th>
                      <th>Conversions</th>
                      <th>Conv. Rate</th>
                      <th>Cost/Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignPerformance.map(campaign => (
                      <tr key={campaign.name}>
                        <td>{campaign.name}</td>
                        <td>{campaign.leads}</td>
                        <td>{campaign.conversions}</td>
                        <td>{campaign.conversionRate}%</td>
                        <td>${campaign.cpl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;