export class mountOptions {
  organizationKey = "";
  stationKey = "";
  styles = "all"; // May be 'all' or 'minimal'
  chartColors = ["red", "orange", "blue", "green", "purple"];
  creditsHtml = `<a href="https://github.com/orcasound/bioacoustic-dashboard" target="_blank">SeaStats</a> - open source soundscape dashboard. Powered by <a href="https://bcwhales.org/" target="_blank">NCCS</a> (BC Whales), <a href="https://www.orcasound.net/" target="_blank">Orcasound</a>, and <a href="https://soundspaceanalytics.ca/" target="_blank">SoundSpace Analytics</a>.`;
  charts = [
    {
      title: "Station summary",
      component: "SummaryChart",
      descriptionHtml: null,
    },
    {
      title: "Daily detections",
      component: "DailyDetectionsChart",
      descriptionHtml: `<p>The <i>Daily Detections Metric</i> shows the number of detected calls for different biological signal types within a calendar day, corrected for the corresponding hydrophone uptime. The result is a call rate (detections / 24h) that can be used to learn about acoustic activity on any given day, as well as tracing activity patterns over multiple months or years.</p>
<p>24h call rates are calculated by counting automated bio-acoustic signal detections for each UTC calendar day. Call counts are then divided by the hydrophone uptime for that interval. Only intervals with an uptime greater than 50% are considered. Days with less than 50% effort are treated as <i>no data</i> and highlighted by gray shaded areas in the interactive graphic. Call detections are counted only if the signal-to-noise ratio is greater than 5.0 and if the call classification confidence from the machine learning algorithm is above 50%.</p>
<p>For <i>Smoothing = Rolling Average</i>, the daily bar chart is transformed into a line chart that computes the arithmetic mean over a user-defined <i>Time Span </i>between one to four weeks at a step size of one UTC calendar day. Only steps that contain data points for at least 50% within the selected time window are valid.</p>`,
    },
    {
      title: "Acoustic events",
      component: "AcousticEventsChart",
      descriptionHtml: `<p>The <i>Acoustic Events Metric</i> shows time periods of acoustic presence compiled from different biological signal types. Acoustic Events effectively summarize time periods of vocally active marine life. Each bubble in the interactive graphic marks an acoustic event with information about the time-of-year, hour-of-day, the duration of the event as well as the vocalization count.</p>
<p>Acoustic events are defined as clusters of automated, chronologically adjacent bio-acoustic signal detections. The clustering algorithm DBSCAN (Density Based Clustering for Applications with Noise) is used to find call clusters based on conditions for the maximum allowed time between two calls, the minimum number of calls, and the minimum event length. Each signal type is processed with varying sets of parameters based on biological use. Call detections are counted only if the signal-to-noise ratio is greater than 5.0 and if the call classification confidence from the machine learning algorithm is above 50%. Days with less than 50% station uptime are treated as <i>no data</i> and highlighted by gray shaded areas in the interactive graphic.</p>`,
    },
    {
      title: "Spectral averages",
      component: "StaticGraphicChart",
      uploadType: "ltsa-1d",
      descriptionHtml: `<p>The Spectral Averages Metric shows the entire soundscape for a daily period. It highlights the level of acoustic energy that is present at different frequencies and times. The acoustic fingerprints of waves, rain, vessels, and biological sources on the soundscape can be explored. higher noise levels are colored yellow, quieter levels are blue or black. White areas mark periods were no data is recorded. The graphic itself is not interactive and individual daily periods can be selected through a drop-down menu.</p>
<p>Spectral averages are compiled for UTC calendar day periods from 60s average power spectral densities and resolved at 1 Hz. The dynamic range is fixed and ranges from 30 dB to 80 dB.</p>`,
    },
    {
      title: "Spectral densities",
      component: "StaticGraphicChart",
      uploadType: "spd-1m",
      descriptionHtml: `<p>Spectral Probability Density (short: SPD) plots display the recorded energy distribution across the frequency spectrum for a calendar month.</p>`,
    },
    {
      title: "Sound levels",
      component: "SoundLevelChart",
      descriptionHtml: `
<p><b>Sound Levels</b></p>
<p>The <i>Sound Levels Metric </i>shows detected sound pressure levels (SPLs) averaged over a calendar day for a variety of frequency bands. The low frequency band (10 - 100 Hz) includes vessel noise, flow noise, wave noise, and covers the communication frequency range of fin whales. The mid frequency band ( 100 - 1000 Hz) includes vessel noise, wave noise, and covers the vocalization frequency range of humpback whales. The high frequency band (1 - 10 kHz) covers the vocalization frequency of killer whales.</p>
<p>Sound pressure levels are computed by integrating 60s average power spectral densities (PSDs) over a UTC calendar day within different frequency bands. Days with less than 50% station uptime are treated as <i>no data</i> and highlighted by gray shaded areas in the interactive graphic.</p>
<p>For <i>Smoothing = Rolling Average</i>, the daily data is smoothed by computing the arithmetic mean over a user-defined <i>Time Span </i>between one to four weeks at a step size of one UTC calendar day. Only steps that contain data points for at least 50% within the selected time window are valid.</p>
<p><b>Sound Level Exceedance</b></p>
<p>The<i> Sound Level Exceedance</i> <i>Metric</i> shows the percentage of time that in-band sound levels are detected above a threshold for daily periods.</p>
<p>Exceedance times are computed from 60s average sound level measurements and divided by the recording effort for UTC calendar days. Days with less than 50% station uptime are treated as <i>no data</i> and highlighted by gray shaded areas in the interactive graphic.</p>
<p>For <i>Smoothing = Rolling Average</i>, the daily data is smoothed by computing the arithmetic mean over a user-defined <i>Time Span </i>between one to four weeks at a step size of one UTC calendar day. Only steps that contain data points for at least 50% within the selected time window are valid.</p>`,
    },
    {
      title: "Station uptime",
      component: "RecordingConsistencyChart",
      descriptionHtml: `<p>The <i>Station Uptime Metric</i> shows the percentage of time the deployed station hydrophone is operating per calendar day.</p>
<p>The station recording effort is obtained by summing the duration of each processed recording for UTC calendar day intervals. Station uptime is computed by division of the daily recording effort by 24h.</p>
<p>For <i>Smoothing = Rolling Average</i>, the daily data is smoothed by computing the arithmetic mean over a user-defined <i>Time Span </i>between one to four weeks at a step size of one UTC calendar day. Only steps that contain data points for at least 50% within the selected time window are valid.</p>`,
    },
  ];
}
