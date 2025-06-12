
import React from 'react';
import { PlatformAnalyticsData, QuickInsight, PlatformID } from '../types';
import { PLATFORMS, ChartBarIcon, LightBulbIcon } from '../constants';

const mockAnalyticsData: PlatformAnalyticsData[] = [
  {
    platformId: PlatformID.Instagram,
    metrics: [
      { label: 'Likes', value: '1.2k', change: '+10%' },
      { label: 'Comments', value: 87, change: '-2%' },
      { label: 'Reach', value: '5.5k' },
    ],
  },
  {
    platformId: PlatformID.X,
    metrics: [
      { label: 'Retweets', value: 245, change: '+15%' },
      { label: 'Replies', value: 62, change: '+5%' },
      { label: 'Impressions', value: '12.1k' },
    ],
  },
  {
    platformId: PlatformID.LinkedIn,
    metrics: [
      { label: 'Engagements', value: 310 },
      { label: 'Clicks', value: 150, change: '+8%' },
      { label: 'Views', value: '2.8k' },
    ],
  },
];

const mockQuickInsights: QuickInsight[] = [
    { id: '1', text: 'Your Instagram posts with faces tend to get 15% more engagement.' },
    { id: '2', text: 'Posting on LinkedIn around 9 AM on weekdays shows higher reach.' },
    { id: '3', text: 'X (Twitter) posts with questions are generating more replies recently.'}
];

const BasicAnalytics: React.FC = () => {
  const getPlatformInfo = (platformId: PlatformID) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  return (
    <div className="p-6 bg-[var(--color-crisp-white)] shadow-lg rounded-[10px] border border-[var(--color-charcoal-gray)]/20 space-y-6">
      <div className="flex items-center pb-2 border-b border-[var(--color-charcoal-gray)]/10">
        <ChartBarIcon className="h-6 w-6 mr-2 text-[var(--color-deep-forest)]" />
        <h2 className="text-xl font-['Montserrat'] font-semibold text-[var(--color-deep-forest)]">Basic Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {mockAnalyticsData.map(data => {
          const platformInfo = getPlatformInfo(data.platformId);
          if (!platformInfo) return null;

          return (
            <div key={data.platformId} className="p-4 bg-gray-50/50 rounded-lg border border-[var(--color-charcoal-gray)]/10 shadow-sm">
              <div className="flex items-center mb-3">
                <span className={`h-7 w-7 mr-2.5 ${platformInfo.color} rounded-md p-1 flex items-center justify-center`}>
                   {React.cloneElement(platformInfo.icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-white' })}
                </span>
                <h3 className="font-['Montserrat'] text-md font-semibold text-[var(--color-deep-forest)]">{platformInfo.name}</h3>
              </div>
              <div className="space-y-2">
                {data.metrics.map(metric => (
                  <div key={metric.label} className="flex justify-between items-baseline font-['Lora'] text-sm">
                    <span className="text-[var(--color-charcoal-gray)]/90">{metric.label}:</span>
                    <div className="flex items-baseline">
                      <span className="font-semibold text-[var(--color-deep-forest)]">{metric.value}</span>
                      {metric.change && (
                        <span className={`ml-1.5 text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          ({metric.change})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div>
        <div className="flex items-center mb-2">
            <LightBulbIcon className="h-5 w-5 mr-2 text-[var(--color-burnt-sienna)]" />
            <h3 className="text-md font-['Montserrat'] font-semibold text-[var(--color-charcoal-gray)]">Quick Insights:</h3>
        </div>
        <div className="space-y-2">
            {mockQuickInsights.map(insight => (
                 <p key={insight.id} className="text-xs font-['Lora'] text-[var(--color-charcoal-gray)]/80 p-2 bg-[var(--color-burnt-sienna)]/5 rounded-md border-l-2 border-[var(--color-burnt-sienna)]">
                    {insight.text}
                 </p>
            ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-['Lora'] text-[var(--color-charcoal-gray)]/70">Chart visualizations coming soon.</p>
        <div className="mt-2 p-4 h-24 bg-gray-100 rounded-md flex items-center justify-center border border-dashed border-[var(--color-charcoal-gray)]/30">
          <span className="text-xs text-[var(--color-charcoal-gray)]/60 font-['Montserrat']">Mock Chart Area</span>
        </div>
      </div>
       <p className="mt-4 text-xs text-center text-[var(--color-charcoal-gray)]/70 font-['Lora'] italic">
        Analytics data shown is for demonstration purposes only.
      </p>
    </div>
  );
};

export default BasicAnalytics;
