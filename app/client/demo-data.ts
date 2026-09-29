export type DemoTimelineItem = {
  label: string;
  date: string;
  detail: string;
  done: boolean;
};

export type DemoSample = {
  id: string;
  service: string;
  location: string;
  collected: string;
  collectedTime: string;
  quantity: string;
  status: "Report Ready" | "Testing" | "Completed" | "Received at Lab";
  statusClass: string;
  description: string;
  timeline: DemoTimelineItem[];
};

export const demoSamples: DemoSample[] = [
  {
    id: "DEMO-001",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "15 Sep 2026",
    collectedTime: "10:30 AM",
    quantity: "2 samples",
    status: "Report Ready",
    statusClass: "status-ready",
    description: "Routine potable water quality testing for the Hyderabad facility.",
    timeline: [
      { label: "Sample collected", date: "15 Sep 2026 • 10:30 AM", detail: "Collected at Hyderabad Facility by Nexus field team.", done: true },
      { label: "Received at laboratory", date: "15 Sep 2026 • 5:20 PM", detail: "Sample received and registered for laboratory processing.", done: true },
      { label: "Testing started", date: "16 Sep 2026 • 9:15 AM", detail: "Laboratory testing commenced.", done: true },
      { label: "Testing completed", date: "19 Sep 2026 • 3:40 PM", detail: "Required test parameters completed.", done: true },
      { label: "Report prepared", date: "20 Sep 2026 • 11:10 AM", detail: "Laboratory report prepared for customer access.", done: true },
      { label: "Report ready", date: "20 Sep 2026 • 12:00 PM", detail: "Report is ready to view and download in the client portal.", done: true },
    ],
  },
  {
    id: "DEMO-002",
    service: "Food Testing",
    location: "Hyderabad Facility",
    collected: "17 Sep 2026",
    collectedTime: "2:15 PM",
    quantity: "4 samples",
    status: "Testing",
    statusClass: "status-testing",
    description: "Routine food quality and hygiene testing for the Hyderabad facility.",
    timeline: [
      { label: "Sample collected", date: "17 Sep 2026 • 2:15 PM", detail: "Collected at Hyderabad Facility by Nexus field team.", done: true },
      { label: "Received at laboratory", date: "17 Sep 2026 • 7:10 PM", detail: "Samples received and registered.", done: true },
      { label: "Testing started", date: "18 Sep 2026 • 9:30 AM", detail: "Laboratory testing is currently in progress.", done: true },
      { label: "Testing completed", date: "Pending", detail: "This step will update when testing is completed.", done: false },
      { label: "Report ready", date: "Pending", detail: "The report will become available after approval.", done: false },
    ],
  },
  {
    id: "DEMO-003",
    service: "Swab Testing",
    location: "Hyderabad Facility",
    collected: "18 Sep 2026",
    collectedTime: "11:00 AM",
    quantity: "6 swabs",
    status: "Completed",
    statusClass: "status-complete",
    description: "Surface hygiene swab testing for the Hyderabad facility.",
    timeline: [
      { label: "Sample collected", date: "18 Sep 2026 • 11:00 AM", detail: "Swab samples collected at Hyderabad Facility.", done: true },
      { label: "Received at laboratory", date: "18 Sep 2026 • 5:45 PM", detail: "Samples received and registered.", done: true },
      { label: "Testing started", date: "19 Sep 2026 • 9:00 AM", detail: "Laboratory testing commenced.", done: true },
      { label: "Testing completed", date: "20 Sep 2026 • 4:00 PM", detail: "Testing completed; report preparation is in progress.", done: true },
      { label: "Report ready", date: "Pending", detail: "Report is awaiting final preparation/approval.", done: false },
    ],
  },
  {
    id: "DEMO-004",
    service: "Water Testing",
    location: "Hyderabad Facility",
    collected: "20 Sep 2026",
    collectedTime: "9:45 AM",
    quantity: "1 sample",
    status: "Received at Lab",
    statusClass: "status-received",
    description: "Demo water sample recently received for laboratory processing.",
    timeline: [
      { label: "Sample collected", date: "20 Sep 2026 • 9:45 AM", detail: "Collected at Hyderabad Facility by Nexus field team.", done: true },
      { label: "Received at laboratory", date: "20 Sep 2026 • 4:35 PM", detail: "Sample received and registered.", done: true },
      { label: "Testing started", date: "Pending", detail: "Testing has not started yet.", done: false },
      { label: "Testing completed", date: "Pending", detail: "This step will update after testing.", done: false },
      { label: "Report ready", date: "Pending", detail: "The report will become available after completion.", done: false },
    ],
  },
];
