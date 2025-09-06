export const NAVIGATION_ITEMS = [
  {
    title: 'Basic Price Reports',
    icon: 'trending_up',
    items: [
      { title: 'Latest Prices', path: '/basic/latest-prices' },
      { title: 'Historical Trends', path: '/basic/historical-trends' },
      { title: 'Monthly Averages', path: '/basic/monthly-averages' },
      { title: 'Price Records', path: '/basic/price-records' },
    ],
  },
  {
    title: 'Time Analysis Reports',
    icon: 'schedule',
    items: [
      { title: 'Seasonal Patterns', path: '/time/seasonal-patterns' },
      { title: 'Year-over-Year Comparisons', path: '/time/year-over-year' },
      { title: 'Period-to-Period Analysis', path: '/time/period-to-period' },
    ],
  },
  {
    title: 'Advanced Analytics',
    icon: 'assessment',
    items: [
      { title: 'Advanced Analytics', path: '/advanced/analytics' },
    ],
  },
];

export const COMMODITIES = [
  { value: 'onion', label: 'Onion' },
  { value: 'potato', label: 'Potato' },
];