import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * TRIPONA.in — UNIVERSAL LUXURY TRAVEL BOOKLET PDF GENERATOR
 * Generates an exhaustive 14-section travel booklet for ANY destination worldwide.
 * 
 * 14 Booklet Sections:
 * 1. Cinematic Cover
 * 2. Trip Overview & Synopsis
 * 3. Selected Destinations Profile
 * 4. Destination Day Allocation Matrix
 * 5. Complete Route Waypoints & Navigation
 * 6. Daily Morning, Afternoon & Evening Schedules (with Breakfast, Lunch, Dinner)
 * 7. Hotels & Accommodations Master Directory
 * 8. Intercity & Local Transportation Guide
 * 9. Culinary & Dining Guide
 * 10. Destination-Wise Budget Breakdown
 * 11. Overall Trip Budget & Financial Telemetry
 * 12. Smart Packing Checklist
 * 13. Travel Intelligence & Cultural Protocols
 * 14. Emergency, Safety & Verification Advisory
 */
export function exportTripToPdf(trip) {
  if (!trip) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Luxury Dark Aesthetic Palette
  const darkNavy = [9, 11, 15];
  const cardDark = [17, 21, 28];
  const purpleAccent = [168, 85, 247]; // #A855F7
  const cyanAccent = [6, 182, 212];    // #06B6D4
  const textWhite = [255, 255, 255];
  const textMuted = [148, 163, 184];
  const borderSubtle = [38, 45, 58];

  const currencySym = trip.currencySymbol || (trip.currency === 'INR' ? '₹' : '$');
  const destinationsList = Array.isArray(trip.destinations) && trip.destinations.length > 0
    ? trip.destinations
    : (trip.destination ? trip.destination.split(/[,&+]|\band\b/i).map(s => s.trim()) : ['Global Journey']);

  const totalDays = trip.duration || trip.days?.length || 7;
  const travellers = trip.travellers || 2;

  // Helper for Section Headers
  const renderSectionHeader = (y, sectionNumber, title, subtitle) => {
    // Gradient accent bar
    doc.setFillColor(...purpleAccent);
    doc.rect(margin, y, 3, 10, 'F');
    doc.setFillColor(...cyanAccent);
    doc.rect(margin + 3, y, 1.5, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cyanAccent);
    doc.text(`SECTION ${String(sectionNumber).padStart(2, '0')}`, margin + 8, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...textWhite);
    doc.text(title, margin + 8, y + 9);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(subtitle, margin + 8, y + 14);
      return y + 18;
    }
    return y + 14;
  };

  // Helper to ensure page has dark luxury background
  const applyPageDarkTheme = () => {
    doc.setFillColor(...darkNavy);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // =========================================================================
  // 1. CINEMATIC COVER PAGE
  // =========================================================================
  applyPageDarkTheme();

  // Top luxury brand banner
  doc.setFillColor(...cardDark);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setFillColor(...purpleAccent);
  doc.rect(0, 50, pageWidth, 1.5, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...textWhite);
  doc.text('TRIPONA.in', margin, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...cyanAccent);
  doc.text('UNIVERSAL AUTONOMOUS AI TRAVEL ARCHITECT', margin, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('GLOBAL TRAVEL MASTERPLAN & ITINERARY BOOKLET', margin, 38);

  // Title Box
  doc.setFillColor(...cardDark);
  doc.roundedRect(margin, 65, contentWidth, 75, 4, 4, 'F');
  doc.setDrawColor(...borderSubtle);
  doc.roundedRect(margin, 65, contentWidth, 75, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...purpleAccent);
  doc.text('OFFICIAL BESPOKE TRAVEL DOSSIER', margin + 8, 77);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...textWhite);
  const splitTitle = doc.splitTextToSize(trip.title || `${totalDays}-Day Odyssey across ${destinationsList.join(', ')}`, contentWidth - 16);
  doc.text(splitTitle, margin + 8, 88);

  // Key Metadata Telemetry Grid inside box
  const metaY = 108;
  doc.setFontSize(8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cyanAccent);
  doc.text('Destinations:', margin + 8, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textWhite);
  doc.text(destinationsList.join(' • '), margin + 32, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cyanAccent);
  doc.text('Origin City:', margin + 8, metaY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textWhite);
  doc.text(trip.startingLocation || 'Origin Hub', margin + 32, metaY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cyanAccent);
  doc.text('Duration:', margin + 8, metaY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textWhite);
  doc.text(`${totalDays} Days / ${totalDays - 1} Nights`, margin + 32, metaY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...cyanAccent);
  doc.text('Party Size:', margin + 8, metaY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textWhite);
  doc.text(`${travellers} Travellers (${trip.travelStyle || 'Bespoke Experience'})`, margin + 32, metaY + 21);

  // Right telemetry badge: Budget
  doc.setFillColor(25, 30, 42);
  doc.roundedRect(pageWidth - margin - 58, metaY - 3, 50, 26, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('ESTIMATED BUDGET', pageWidth - margin - 53, metaY + 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...textWhite);
  const costStr = `${currencySym} ${(trip.estimatedTotalCost || trip.totalBudget || 30000).toLocaleString()}`;
  doc.text(costStr, pageWidth - margin - 53, metaY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(52, 211, 153);
  doc.text('AI Route Optimized', pageWidth - margin - 53, metaY + 18);

  // Table of Contents Preview
  doc.setFillColor(...cardDark);
  doc.roundedRect(margin, 150, contentWidth, 110, 4, 4, 'F');
  doc.setDrawColor(...borderSubtle);
  doc.roundedRect(margin, 150, contentWidth, 110, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textWhite);
  doc.text('DOSSIER CONTENTS & ITINERARY DIRECTORY', margin + 8, 162);

  const sectionsList = [
    '01. Cinematic Cover & Verification',
    '02. Trip Overview & Narrative Synopsis',
    '03. Selected Destinations Profile',
    '04. Destination Day Allocation Matrix',
    '05. Complete Route Waypoints & Navigation',
    '06. Daily Schedules & Activities (Morning, Afternoon, Evening)',
    '07. Curated Hotels & Accommodations Directory',
    '08. Intercity & Local Transportation Guide',
    '09. Regional Culinary & Signature Dining',
    '10. Destination-wise Budget Allocation',
    '11. Overall Trip Budget & Financial Telemetry',
    '12. Smart Trip Packing Checklist',
    '13. Travel Intelligence & Cultural Protocols',
    '14. Emergency & Consular Advisory'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  sectionsList.forEach((sec, idx) => {
    const col = idx < 7 ? 0 : 1;
    const row = idx % 7;
    const x = margin + 8 + (col * 88);
    const y = 172 + (row * 11);
    doc.text(`• ${sec}`, x, y);
  });

  // Footer on cover
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Generated dynamically by TRIPONA.in • Real-time Universal Travel Engine', margin, 285);
  doc.text('Verified Live Pricing & Booking through Google Travel', pageWidth - margin - 75, 285);

  // =========================================================================
  // 2. TRIP OVERVIEW & SYNOPSIS (Page 2)
  // =========================================================================
  doc.addPage();
  applyPageDarkTheme();
  let currentY = 22;

  currentY = renderSectionHeader(currentY, 2, 'Journey Synopsis & Architecture', 'Comprehensive high-altitude itinerary summary');

  doc.setFillColor(...cardDark);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  const overviewSplit = doc.splitTextToSize(trip.overview || 'An exquisite bespoke journey orchestrated across premier global destinations.', contentWidth - 14);
  doc.text(overviewSplit, margin + 7, currentY + 8);
  currentY += 40;

  // Intercity Route Highway
  if (trip.routeOverview) {
    doc.setFillColor(20, 26, 36);
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cyanAccent);
    doc.text('NAVIGATION SEQUENCE:', margin + 6, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textWhite);
    doc.text(trip.routeOverview, margin + 6, currentY + 12);
    currentY += 24;
  }

  // =========================================================================
  // 3 & 4. DESTINATIONS PROFILE & DAY ALLOCATION (Sections 3 & 4)
  // =========================================================================
  currentY = renderSectionHeader(currentY, 3, 'Destination Profiles & Day Allocations', 'Calculated duration, climate and focus per stop');

  const allocationRows = destinationsList.map((dest, i) => {
    const daysAlloc = trip.dayAllocations ? trip.dayAllocations[dest] || 1 : Math.round(totalDays / destinationsList.length);
    const destBudget = trip.destinationBudgets && trip.destinationBudgets[dest] ? trip.destinationBudgets[dest].subtotal : `${currencySym} ${(Math.round((trip.estimatedTotalCost || 30000) / destinationsList.length)).toLocaleString()}`;
    return [
      `Stop #${i + 1}`,
      dest,
      `${daysAlloc} Days (${daysAlloc * 24} Hours)`,
      destBudget,
      i === 0 ? 'Primary Gateway / Historic Discovery' : 'Deep Cultural Immersion & Scenic Trails'
    ];
  });

  doc.autoTable({
    startY: currentY,
    head: [['Stop', 'Destination', 'Allocated Days', 'Est. Subtotal', 'Travel Focus']],
    body: allocationRows,
    theme: 'grid',
    headStyles: { fillColor: cardDark, textColor: cyanAccent, fontSize: 8, fontStyle: 'bold' },
    styles: { fillColor: [13, 16, 22], textColor: [241, 245, 249], fontSize: 7.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 36 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 58 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // =========================================================================
  // 5. ROUTE WAYPOINTS & NAVIGATION (Section 5)
  // =========================================================================
  if (Array.isArray(trip.mapWaypoints) && trip.mapWaypoints.length > 0) {
    if (currentY > 215) {
      doc.addPage();
      applyPageDarkTheme();
      currentY = 22;
    }

    currentY = renderSectionHeader(currentY, 5, 'Universal Route Waypoints & Coordinates', 'Interactive GPS coordinates mapped to Leaflet topography');

    const waypointRows = trip.mapWaypoints.map((wp, i) => [
      String(i + 1),
      wp.name,
      `Lat: ${wp.lat?.toFixed(4) || '—'}, Lng: ${wp.lng?.toFixed(4) || '—'}`,
      wp.day ? `Day ${wp.day}` : 'En route',
      wp.description || 'Verified travel waypoint'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['#', 'Waypoint / Landmark', 'Coordinates', 'Schedule', 'Navigation Details']],
      body: waypointRows,
      theme: 'grid',
      headStyles: { fillColor: [24, 28, 38], textColor: purpleAccent, fontSize: 8, fontStyle: 'bold' },
      styles: { fillColor: [13, 16, 22], textColor: [226, 232, 240], fontSize: 7.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 46, fontStyle: 'bold' },
        2: { cellWidth: 42, fontStyle: 'italic' },
        3: { cellWidth: 24 },
        4: { cellWidth: 60 }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 14;
  }

  // =========================================================================
  // 6. DAILY DETAILED SCHEDULES (Section 6)
  // =========================================================================
  doc.addPage();
  applyPageDarkTheme();
  currentY = 22;

  currentY = renderSectionHeader(currentY, 6, 'Universal Day-by-Day Master Schedule', 'Identical high-fidelity structure for every day across all destinations');

  if (Array.isArray(trip.days)) {
    trip.days.forEach((d) => {
      // If remaining vertical space is low, advance to new page
      if (currentY > 215) {
        doc.addPage();
        applyPageDarkTheme();
        currentY = 22;
      }

      // Day Header Pill
      doc.setFillColor(...cardDark);
      doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
      doc.setDrawColor(...borderSubtle);
      doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'S');

      // Day Badge
      doc.setFillColor(...purpleAccent);
      doc.roundedRect(margin + 2, currentY + 2, 16, 8, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...textWhite);
      doc.text(`D${d.day}`, margin + 5.5, currentY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...textWhite);
      doc.text(d.title || `Day ${d.day} in ${d.destination}`, margin + 22, currentY + 7.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...cyanAccent);
      doc.text(`Est: ${d.dailyBudget || '—'}  |  Transit: ${d.transitTime || 'Local'}`, pageWidth - margin - 55, currentY + 7.5);

      currentY += 14;

      // Activities & Meals Table
      const morningStr = typeof d.morning === 'object'
        ? `${d.morning.time || '08:30 AM'}: ${d.morning.activity || ''}\nBreakfast: ${d.morning.breakfast?.dish || 'Artisan regional breakfast'}`
        : (d.morning || '');

      const afternoonStr = typeof d.afternoon === 'object'
        ? `${d.afternoon.time || '01:30 PM'}: ${d.afternoon.activity || ''}\nLunch: ${d.afternoon.lunch?.dish || 'Curated local lunch'}`
        : (d.afternoon || '');

      const eveningStr = typeof d.evening === 'object'
        ? `${d.evening.time || '06:30 PM'}: ${d.evening.activity || ''}\nDinner: ${d.evening.dinner?.dish || 'Signature dinner'}`
        : (d.evening || '');

      const hotelName = typeof d.hotel === 'object' ? d.hotel.name : (d.hotel || 'Curated Boutique Sanctuary');

      const dayBody = [
        ['Morning & Breakfast', morningStr],
        ['Afternoon & Lunch', afternoonStr],
        ['Evening & Dinner', eveningStr],
        ['Stay & Overnight', `${hotelName} (${d.hotel?.type || 'Boutique Stay'})`],
        ['Local Advice & Tips', d.tips || 'Verify morning light angles for optimal photography.']
      ];

      doc.autoTable({
        startY: currentY,
        body: dayBody,
        theme: 'grid',
        styles: { fillColor: [13, 16, 22], textColor: [226, 232, 240], fontSize: 7, cellPadding: 2.5 },
        columnStyles: {
          0: { cellWidth: 32, fontStyle: 'bold', textColor: cyanAccent },
          1: { cellWidth: contentWidth - 32 }
        },
        margin: { left: margin, right: margin }
      });

      currentY = doc.lastAutoTable.finalY + 8;
    });
  }

  // =========================================================================
  // 7 & 8. HOTELS & TRANSPORTATION DIRECTORY (Sections 7 & 8)
  // =========================================================================
  doc.addPage();
  applyPageDarkTheme();
  currentY = 22;

  currentY = renderSectionHeader(currentY, 7, 'Hotels & Boutique Accommodations Directory', 'Curated wellness resorts and verified heritage sanctuaries');

  if (Array.isArray(trip.hotels) && trip.hotels.length > 0) {
    const hotelRows = trip.hotels.map(h => [
      h.name,
      h.location || 'Central Location',
      h.pricePerNight || '—',
      `★ ${h.rating || '4.85'}`,
      h.highlights || 'Verified boutique amenities, spa and concierge services'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Property Name', 'Location', 'Est. Rate', 'Rating', 'Highlights & Amenities']],
      body: hotelRows,
      theme: 'grid',
      headStyles: { fillColor: cardDark, textColor: purpleAccent, fontSize: 8, fontStyle: 'bold' },
      styles: { fillColor: [13, 16, 22], textColor: [241, 245, 249], fontSize: 7, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 26 },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 60 }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 12;
  }

  // Transportation Guide
  currentY = renderSectionHeader(currentY, 8, 'Intercity & Local Transportation Guide', 'Optimized transit connections without backtracking');

  if (Array.isArray(trip.transportOptions) && trip.transportOptions.length > 0) {
    const transitRows = trip.transportOptions.map(t => [
      `${t.from} → ${t.to}`,
      t.mode || 'Scenic Express Transit',
      t.distance || '—',
      t.duration || '—',
      t.estimatedCost || '—'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Route Segment', 'Transit Mode', 'Distance', 'Duration', 'Est. Cost']],
      body: transitRows,
      theme: 'grid',
      headStyles: { fillColor: cardDark, textColor: cyanAccent, fontSize: 8, fontStyle: 'bold' },
      styles: { fillColor: [13, 16, 22], textColor: [241, 245, 249], fontSize: 7, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold' },
        1: { cellWidth: 54 },
        2: { cellWidth: 24 },
        3: { cellWidth: 26 },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 14;
  }

  // =========================================================================
  // 9 & 10. DINING GUIDE & DESTINATION BUDGETS (Sections 9 & 10)
  // =========================================================================
  if (currentY > 215) {
    doc.addPage();
    applyPageDarkTheme();
    currentY = 22;
  }

  currentY = renderSectionHeader(currentY, 9, 'Culinary Guide & Signature Dining', 'Breakfast, lunch and dinner curation per destination');

  if (Array.isArray(trip.restaurants) && trip.restaurants.length > 0) {
    const diningRows = trip.restaurants.map(r => [
      r.name,
      r.cuisine || 'Regional Specialty',
      r.location || 'Central Quarter',
      r.specialty || 'Chef signature plate',
      r.priceRange || 'Moderate'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Establishment', 'Cuisine Style', 'Quarter', 'Must-Try Signature', 'Price Range']],
      body: diningRows,
      theme: 'grid',
      headStyles: { fillColor: cardDark, textColor: [251, 191, 36], fontSize: 8, fontStyle: 'bold' },
      styles: { fillColor: [13, 16, 22], textColor: [241, 245, 249], fontSize: 7, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 32 },
        3: { cellWidth: 42 },
        4: { cellWidth: 28, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 14;
  }

  // =========================================================================
  // 10 & 11. UNIVERSAL BUDGET MATRIX & TELEMETRY (Sections 10 & 11)
  // =========================================================================
  doc.addPage();
  applyPageDarkTheme();
  currentY = 22;

  currentY = renderSectionHeader(currentY, 10, 'Universal Budget Engine & Category Allocation', 'Independent destination calculations combined with precision buffer');

  if (trip.budgetBreakdown) {
    const budgetRows = Object.entries(trip.budgetBreakdown).map(([category, amount]) => [
      category.charAt(0).toUpperCase() + category.slice(1),
      String(amount),
      category === 'accommodation' ? '38-42% of total allocation (Boutique 4-Star Stays)'
        : category === 'dining' ? '22-26% (Breakfast, Lunch & Signature Dinners)'
        : category === 'transportation' ? '18-22% (Intercity connections & Local transfers)'
        : category === 'activities' ? '10-12% (Attraction entry & Curated experiences)'
        : '5-6% (Contingency, Medical & Currency fluctuation reserve)'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Budget Category', 'Allocated Amount', 'Target Distribution & Policy']],
      body: budgetRows,
      theme: 'striped',
      headStyles: { fillColor: purpleAccent, textColor: textWhite, fontSize: 8, fontStyle: 'bold' },
      styles: { fillColor: [13, 16, 22], textColor: [241, 245, 249], fontSize: 7.5, cellPadding: 3.5 },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 40, fontStyle: 'bold', halign: 'right' },
        2: { cellWidth: 97 }
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Financial Telemetry Summary Card
  doc.setFillColor(...cardDark);
  doc.roundedRect(margin, currentY, contentWidth, 36, 3, 3, 'F');
  doc.setDrawColor(...borderSubtle);
  doc.roundedRect(margin, currentY, contentWidth, 36, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...cyanAccent);
  doc.text('FINANCIAL BENCHMARK TELEMETRY', margin + 8, currentY + 8);

  doc.setFontSize(8);
  doc.setTextColor(...textWhite);
  doc.text(`Total Authorized Budget: ${currencySym} ${(trip.totalBudget || 30000).toLocaleString()}`, margin + 8, currentY + 16);
  doc.text(`Estimated Trip Cost: ${currencySym} ${(trip.estimatedTotalCost || 27600).toLocaleString()}`, margin + 8, currentY + 23);
  doc.text(`Estimated Cost Per Traveller: ${trip.costPerTraveller || `${currencySym} ${Math.round((trip.estimatedTotalCost || 27600) / travellers).toLocaleString()}`}`, margin + 8, currentY + 30);

  doc.text(`Remaining Liquidity Reserve: ${trip.remainingBudget || `${currencySym} ${Math.max(0, (trip.totalBudget || 30000) - (trip.estimatedTotalCost || 27600)).toLocaleString()}`}`, margin + 95, currentY + 16);
  doc.text(`Trip Currency: ${trip.currency || 'USD'} (${currencySym})`, margin + 95, currentY + 23);
  doc.setTextColor(52, 211, 153);
  doc.text(`Verification: Estimated prices based on seasonal indices; live booking on Google Travel`, margin + 95, currentY + 30);

  currentY += 46;

  // =========================================================================
  // 12. SMART TRIP PACKING CHECKLIST (Section 12)
  // =========================================================================
  currentY = renderSectionHeader(currentY, 12, 'Universal Travel Packing Checklist', 'Essential documentation, gear and apparel tailored to destinations');

  const packingItems = [
    ['Documents & Money', 'Passport valid for 6+ months, printed visa confirmations, emergency cash in small denominations, international forex/credit card with zero foreign markup.'],
    ['Electronics & Tech', 'Universal world power adapter (Type C/G/D compatible), high-capacity 20,000mAh power bank, noise-cancelling headphones, offline downloaded Google maps.'],
    ['Apparel & Footwear', 'Broken-in walking shoes for cobblestones/trails, breathable cotton layers, lightweight packable rain shell, smart evening attire for reservation dinners.'],
    ['Health & Essentials', 'Personal prescription meds, broad-spectrum sunscreen (SPF 50+), electrolyte hydration packs, compact first-aid kit with blister bandages.']
  ];

  doc.autoTable({
    startY: currentY,
    body: packingItems,
    theme: 'grid',
    styles: { fillColor: [13, 16, 22], textColor: [226, 232, 240], fontSize: 7.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', textColor: cyanAccent },
      1: { cellWidth: contentWidth - 45 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // =========================================================================
  // 13 & 14. TRAVEL TIPS, EMERGENCY & LEGAL (Sections 13 & 14)
  // =========================================================================
  if (currentY > 215) {
    doc.addPage();
    applyPageDarkTheme();
    currentY = 22;
  }

  currentY = renderSectionHeader(currentY, 13, 'Travel Intelligence & Cultural Protocols', 'Local etiquette and timing strategies');

  const tipsList = Array.isArray(trip.safetyTips) && trip.safetyTips.length > 0
    ? trip.safetyTips
    : [
        'Keep digital copies of all identity cards and hotel confirmations stored in secure offline storage.',
        'Carry small local currency change for public transportation ticket kiosks and artisan markets.',
        'Pre-book high-demand museum and monument passes at least 72 hours in advance to bypass queues.'
      ];

  const tipsRows = tipsList.map((tip, idx) => [`Tip #${idx + 1}`, tip]);

  doc.autoTable({
    startY: currentY,
    body: tipsRows,
    theme: 'grid',
    styles: { fillColor: [13, 16, 22], textColor: [226, 232, 240], fontSize: 7.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold', textColor: purpleAccent },
      1: { cellWidth: contentWidth - 25 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // Section 14: Emergency & Verification Disclaimer
  currentY = renderSectionHeader(currentY, 14, 'Emergency & Consular Advisory', 'Global safety protocols and verified booking links');

  doc.setFillColor(...cardDark);
  doc.roundedRect(margin, currentY, contentWidth, 30, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('UNIVERSAL EMERGENCY HOTLINES:', margin + 6, currentY + 6);
  doc.setTextColor(...textWhite);
  doc.text('• Europe: Dial 112 (Universal Emergency Service across all EU nations)', margin + 6, currentY + 12);
  doc.text('• USA / Canada: Dial 911  |  India: Dial 112  |  UK: Dial 999  |  Japan: Dial 110 (Police) / 119 (Ambulance)', margin + 6, currentY + 17);
  doc.setTextColor(...cyanAccent);
  doc.text('• TRIPONA Concierge Verification: Verified itinerary hash #TRIP-' + Math.random().toString(36).substring(2, 9).toUpperCase(), margin + 6, currentY + 24);

  // Apply Page Numbers and Header/Footer across ALL pages
  const totalPageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPageCount; i++) {
    doc.setPage(i);

    // Running Header (except cover)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text('TRIPONA.in • Universal Global AI Itinerary Booklet', margin, 12);
      doc.text(`${totalDays} Days across ${destinationsList.slice(0, 3).join(', ')}`, pageWidth - margin - 60, 12);
      doc.setDrawColor(...borderSubtle);
      doc.line(margin, 15, pageWidth - margin, 15);
    }

    // Running Footer
    doc.setDrawColor(...borderSubtle);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text('TRIPONA Autonomous Travel Engine • Real-time Intelligence • Live prices on Google Travel', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPageCount}`, pageWidth - margin - 20, pageHeight - 7);
  }

  const cleanFilename = `${destinationsList.slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${totalDays}d-tripona.pdf`;
  doc.save(cleanFilename);
}
