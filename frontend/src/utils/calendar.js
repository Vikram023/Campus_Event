// Helper utility to format dates for Google Calendar and iCal (.ics)
export function getGoogleCalendarUrl(event) {
  if (!event) return "#";
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration default

  const formatGDate = (d) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(event.title || "Campus Event");
  const details = encodeURIComponent(event.description || "Campus event ticket pass.");
  const location = encodeURIComponent(event.venue?.name || "Campus Venue");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGDate(
    startDate
  )}/${formatGDate(endDate)}&details=${details}&location=${location}`;
}

export function downloadICalFile(event) {
  if (!event) return;
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatICalDate = (d) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = event.title || "Campus Event";
  const description = (event.description || "").replace(/\n/g, " ");
  const location = event.venue?.name || "Campus Venue";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Events Hub//EN",
    "BEGIN:VEVENT",
    `UID:${event._id || Date.now()}@campusevents.edu`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `${title.replace(/[^a-z0-9]/gi, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
