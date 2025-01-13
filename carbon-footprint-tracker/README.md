# Carbon Footprint Tracker

A userscript that helps you track and understand the environmental impact of your web browsing by measuring data transfer and time spent online.

## Features

- Real-time carbon footprint tracking
- Data transfer monitoring
- Minimizable UI
- Persistent data storage

## Technical Implementation

### Carbon Calculation

The script uses two primary metrics to calculate carbon footprint based on academic research and industry standards:

#### Data Transfer (0.2g CO₂/MB)
This value is derived from multiple sources:
- [Energy Intensity of Internet Data Transmission (Aslan et al.)](https://doi.org/10.1016/j.jclepro.2017.12.239) - estimates 0.06-0.42g CO₂/MB
- [The Shift Project Digital Carbon Footprint Study](https://theshiftproject.org/en/article/unsustainable-use-online-video/) - estimates 0.13-0.24g CO₂/MB

We use 0.2g CO₂/MB as a middle-ground estimate that accounts for:
- Data center energy consumption
- Network infrastructure power usage
- Regional variations in power grid carbon intensity
- Improvements in energy efficiency

#### Time-based Impact (0.0002g CO₂/second)
This calculation considers:
- Average device power consumption (laptop/desktop) ≈ 60-100W
- Average grid carbon intensity ≈ 400g CO₂/kWh
- Calculation: (80W × 400g CO₂/kWh) ÷ (3600 seconds/hour) ≈ 0.0002g CO₂/second

Sources:
- [Electricity Map](https://app.electricitymap.org/) - Real-time grid carbon intensity data
- [Lawrence Berkeley National Laboratory](https://eta.lbl.gov/) - Device power consumption studies
- [IEA Global Energy & CO2 Status Report](https://www.iea.org/reports/global-energy-co2-status-report-2019)

Note: These are approximate values and may vary based on:
- Geographic location and local power grid
- Device type and efficiency
- Network infrastructure
- Time of day and seasonal variations

### Resource Monitoring

This userscript was also a learning opportunity to understand how to monitor network resource usage using Javascript APIs. 

The [`PerformanceObserver`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) API that is used is used to track network resource loading:
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "resource") {
      const size = entry.transferSize / (1024 * 1024); // Convert to MB
      // Calculate carbon impact...
    }
  }
});
```

It allows me to apply a measurement to each network resource request which I can then use to calculate the total carbon footprint. The API functions by allowing the developer to monitor specfic performance events in real time. By creating an interface when invoking the function and adding a callback function we can process each performance entry. Once we have access to the entries we can used the methods exposed from the object to specify what we want to monitor. In this case we want to monitor the transfer size of each resource that we can perform calculations on.

You can find the the PerformanceObserver API or any of the Javascript Performance APIs in the wild, in places like [Dyte](https://dyte.io/blog/web-api-performance-monitoring/?utm_source=chatgpt.com), [New Relic](https://docs.newrelic.com/docs/tutorial-improve-site-performance/guide-to-monitoring-core-web-vitals/), or [Google LightHouse](https://github.com/GoogleChrome/lighthouse)



### Data Persistence

- Uses Tampermonkey's storage API (`GM_getValue`/`GM_setValue`)
- Stores total carbon footprint across sessions

### UI Components

The tracker features a minimalist interface:
- Fixed position at top center of viewport
- Collapsible content panel
- Real-time updates using DOM manipulation
- SVG icons for visual elements

## Installation

1. Install a userscript manager (Tampermonkey, Greasemonkey, etc.)
2. Install this script
3. The tracker will appear on all websites you visit

## Usage

- Click the minimize button to collapse
- Watch your carbon footprint update in real-time
- Monitor data transfer in megabytes