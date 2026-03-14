import { neon } from '@neondatabase/serverless'

export async function truncateAndSeed(databaseUrl: string) {
  const sql = neon(databaseUrl)

  // Truncate in dependency order
  await sql`TRUNCATE booking_passengers, bookings, tracked_routes, recent_searches, sessions, prices, flight_legs, flights, airlines, airports CASCADE`

  // Seed airports (~50 major international airports)
  await sql`
    INSERT INTO airports (iata_code, name, city, country, latitude, longitude, timezone) VALUES
    ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States', 33.9425, -118.4081, 'America/Los_Angeles'),
    ('JFK', 'John F. Kennedy International Airport', 'New York', 'United States', 40.6413, -73.7781, 'America/New_York'),
    ('SFO', 'San Francisco International Airport', 'San Francisco', 'United States', 37.6213, -122.3790, 'America/Los_Angeles'),
    ('ORD', 'O''Hare International Airport', 'Chicago', 'United States', 41.9742, -87.9073, 'America/Chicago'),
    ('ATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'United States', 33.6407, -84.4277, 'America/New_York'),
    ('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'United States', 32.8998, -97.0403, 'America/Chicago'),
    ('DEN', 'Denver International Airport', 'Denver', 'United States', 39.8561, -104.6737, 'America/Denver'),
    ('SEA', 'Seattle-Tacoma International Airport', 'Seattle', 'United States', 47.4502, -122.3088, 'America/Los_Angeles'),
    ('MIA', 'Miami International Airport', 'Miami', 'United States', 25.7959, -80.2870, 'America/New_York'),
    ('BOS', 'Boston Logan International Airport', 'Boston', 'United States', 42.3656, -71.0096, 'America/New_York'),
    ('LAS', 'Harry Reid International Airport', 'Las Vegas', 'United States', 36.0840, -115.1537, 'America/Los_Angeles'),
    ('MCO', 'Orlando International Airport', 'Orlando', 'United States', 28.4312, -81.3081, 'America/New_York'),
    ('IAH', 'George Bush Intercontinental Airport', 'Houston', 'United States', 29.9902, -95.3368, 'America/Chicago'),
    ('PHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'United States', 33.4373, -112.0078, 'America/Phoenix'),
    ('MSP', 'Minneapolis-Saint Paul International Airport', 'Minneapolis', 'United States', 44.8848, -93.2223, 'America/Chicago'),
    ('LHR', 'London Heathrow Airport', 'London', 'United Kingdom', 51.4700, -0.4543, 'Europe/London'),
    ('LGW', 'London Gatwick Airport', 'London', 'United Kingdom', 51.1537, -0.1821, 'Europe/London'),
    ('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 49.0097, 2.5479, 'Europe/Paris'),
    ('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 50.0379, 8.5622, 'Europe/Berlin'),
    ('AMS', 'Amsterdam Schiphol Airport', 'Amsterdam', 'Netherlands', 52.3105, 4.7683, 'Europe/Amsterdam'),
    ('MAD', 'Adolfo Suárez Madrid–Barajas Airport', 'Madrid', 'Spain', 40.4983, -3.5676, 'Europe/Madrid'),
    ('FCO', 'Leonardo da Vinci–Fiumicino Airport', 'Rome', 'Italy', 41.8003, 12.2389, 'Europe/Rome'),
    ('MUC', 'Munich Airport', 'Munich', 'Germany', 48.3537, 11.7750, 'Europe/Berlin'),
    ('ZRH', 'Zurich Airport', 'Zurich', 'Switzerland', 47.4647, 8.5492, 'Europe/Zurich'),
    ('IST', 'Istanbul Airport', 'Istanbul', 'Turkey', 41.2753, 28.7519, 'Europe/Istanbul'),
    ('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', 25.2532, 55.3657, 'Asia/Dubai'),
    ('DOH', 'Hamad International Airport', 'Doha', 'Qatar', 25.2731, 51.6081, 'Asia/Qatar'),
    ('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 1.3644, 103.9915, 'Asia/Singapore'),
    ('HKG', 'Hong Kong International Airport', 'Hong Kong', 'China', 22.3080, 113.9185, 'Asia/Hong_Kong'),
    ('NRT', 'Narita International Airport', 'Tokyo', 'Japan', 35.7720, 140.3929, 'Asia/Tokyo'),
    ('HND', 'Haneda Airport', 'Tokyo', 'Japan', 35.5494, 139.7798, 'Asia/Tokyo'),
    ('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', 37.4602, 126.4407, 'Asia/Seoul'),
    ('BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand', 13.6900, 100.7501, 'Asia/Bangkok'),
    ('DEL', 'Indira Gandhi International Airport', 'New Delhi', 'India', 28.5562, 77.1000, 'Asia/Kolkata'),
    ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 19.0896, 72.8656, 'Asia/Kolkata'),
    ('PEK', 'Beijing Capital International Airport', 'Beijing', 'China', 40.0799, 116.6031, 'Asia/Shanghai'),
    ('PVG', 'Shanghai Pudong International Airport', 'Shanghai', 'China', 31.1443, 121.8083, 'Asia/Shanghai'),
    ('SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia', -33.9461, 151.1772, 'Australia/Sydney'),
    ('MEL', 'Melbourne Airport', 'Melbourne', 'Australia', -37.6690, 144.8410, 'Australia/Melbourne'),
    ('AKL', 'Auckland Airport', 'Auckland', 'New Zealand', -37.0082, 174.7850, 'Pacific/Auckland'),
    ('GRU', 'São Paulo–Guarulhos International Airport', 'São Paulo', 'Brazil', -23.4356, -46.4731, 'America/Sao_Paulo'),
    ('MEX', 'Mexico City International Airport', 'Mexico City', 'Mexico', 19.4363, -99.0721, 'America/Mexico_City'),
    ('SCL', 'Santiago International Airport', 'Santiago', 'Chile', -33.3930, -70.7858, 'America/Santiago'),
    ('EZE', 'Ministro Pistarini International Airport', 'Buenos Aires', 'Argentina', -34.8222, -58.5358, 'America/Argentina/Buenos_Aires'),
    ('JNB', 'O.R. Tambo International Airport', 'Johannesburg', 'South Africa', -26.1392, 28.2460, 'Africa/Johannesburg'),
    ('CAI', 'Cairo International Airport', 'Cairo', 'Egypt', 30.1219, 31.4056, 'Africa/Cairo'),
    ('CPT', 'Cape Town International Airport', 'Cape Town', 'South Africa', -33.9649, 18.6017, 'Africa/Johannesburg'),
    ('YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada', 43.6777, -79.6248, 'America/Toronto'),
    ('YVR', 'Vancouver International Airport', 'Vancouver', 'Canada', 49.1967, -123.1815, 'America/Vancouver'),
    ('HNL', 'Daniel K. Inouye International Airport', 'Honolulu', 'United States', 21.3187, -157.9224, 'Pacific/Honolulu')
  `

  // Seed airlines (~20)
  await sql`
    INSERT INTO airlines (iata_code, name, logo_color) VALUES
    ('AA', 'American Airlines', '#E31837'),
    ('DL', 'Delta Air Lines', '#003366'),
    ('UA', 'United Airlines', '#002244'),
    ('WN', 'Southwest Airlines', '#F9A01B'),
    ('B6', 'JetBlue Airways', '#003876'),
    ('AS', 'Alaska Airlines', '#01426A'),
    ('NK', 'Spirit Airlines', '#FFE200'),
    ('F9', 'Frontier Airlines', '#009E3D'),
    ('BA', 'British Airways', '#075AAA'),
    ('LH', 'Lufthansa', '#05164D'),
    ('AF', 'Air France', '#002157'),
    ('EK', 'Emirates', '#D71921'),
    ('QR', 'Qatar Airways', '#5C0632'),
    ('SQ', 'Singapore Airlines', '#F0AB00'),
    ('NH', 'All Nippon Airways', '#13448F'),
    ('CX', 'Cathay Pacific', '#006564'),
    ('QF', 'Qantas', '#E0001A'),
    ('LX', 'Swiss International Air Lines', '#E2001A'),
    ('TK', 'Turkish Airlines', '#C70A0C'),
    ('AC', 'Air Canada', '#F01428')
  `

  // Helper to get airport IDs
  const airportRows = await sql`SELECT id, iata_code FROM airports`
  const airportMap = new Map<string, string>()
  for (const row of airportRows) {
    airportMap.set(row.iata_code as string, row.id as string)
  }

  const airlineRows = await sql`SELECT id, iata_code FROM airlines`
  const airlineMap = new Map<string, string>()
  for (const row of airlineRows) {
    airlineMap.set(row.iata_code as string, row.id as string)
  }

  // Helper function to create flights with prices
  async function createFlight(
    airlineCode: string,
    flightNum: string,
    originCode: string,
    destCode: string,
    depTime: string,
    arrTime: string,
    durationMin: number,
    aircraft: string,
    wifi: boolean,
    power: boolean,
    entertainment: boolean,
    co2: number,
    economyPrice: number,
    stops: { origin: string; dest: string; dep: string; arr: string; dur: number; terminal_dep?: string; terminal_arr?: string }[] | null = null
  ) {
    const airlineId = airlineMap.get(airlineCode)
    const originId = airportMap.get(originCode)
    const destId = airportMap.get(destCode)
    if (!airlineId || !originId || !destId) return

    const flightRows = await sql`
      INSERT INTO flights (airline_id, flight_number, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, aircraft_type, has_wifi, has_power, has_entertainment, co2_kg)
      VALUES (${airlineId}, ${flightNum}, ${originId}, ${destId}, ${depTime}, ${arrTime}, ${durationMin}, ${aircraft}, ${wifi}, ${power}, ${entertainment}, ${co2})
      RETURNING id
    `
    const flightRow = flightRows[0]
    if (!flightRow) return
    const flightId = flightRow.id as string

    // Add legs
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]!
        const legOriginId = airportMap.get(stop.origin)
        const legDestId = airportMap.get(stop.dest)
        if (!legOriginId || !legDestId) continue
        await sql`
          INSERT INTO flight_legs (flight_id, leg_order, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, airline_id, flight_number, aircraft_type, terminal_departure, terminal_arrival)
          VALUES (${flightId}, ${i + 1}, ${legOriginId}, ${legDestId}, ${stop.dep}, ${stop.arr}, ${stop.dur}, ${airlineId}, ${flightNum}, ${aircraft}, ${stop.terminal_dep || null}, ${stop.terminal_arr || null})
        `
      }
    } else {
      await sql`
        INSERT INTO flight_legs (flight_id, leg_order, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration_minutes, airline_id, flight_number, aircraft_type, terminal_departure, terminal_arrival)
        VALUES (${flightId}, ${1}, ${originId}, ${destId}, ${depTime}, ${arrTime}, ${durationMin}, ${airlineId}, ${flightNum}, ${aircraft}, ${'T1'}, ${'T2'})
      `
    }

    // Add prices for all cabin classes
    const premiumMult = 1.8
    const businessMult = 3.5
    const firstMult = 6.0
    const taxRate = 0.15

    for (const [cabinClass, mult] of [['economy', 1], ['premium_economy', premiumMult], ['business', businessMult], ['first', firstMult]] as [string, number][]) {
      const basePrice = Math.round(economyPrice * mult * 100)
      const taxes = Math.round(basePrice * taxRate)
      const total = basePrice + taxes
      const seats = Math.floor(Math.random() * 30) + 5
      await sql`
        INSERT INTO prices (flight_id, cabin_class, base_price_cents, taxes_cents, total_price_cents, available_seats)
        VALUES (${flightId}, ${cabinClass}, ${basePrice}, ${taxes}, ${total}, ${seats})
      `
    }
  }

  // Create ~200 flights with realistic routes
  // LAX routes
  await createFlight('AA', 'AA100', 'LAX', 'JFK', '2026-04-01 08:00', '2026-04-01 16:30', 330, 'Boeing 777-300ER', true, true, true, 180, 299)
  await createFlight('DL', 'DL200', 'LAX', 'JFK', '2026-04-01 10:15', '2026-04-01 18:45', 330, 'Airbus A321neo', true, true, true, 165, 279)
  await createFlight('UA', 'UA300', 'LAX', 'JFK', '2026-04-01 14:00', '2026-04-01 22:30', 330, 'Boeing 787-9', true, true, true, 150, 319)
  await createFlight('B6', 'B6400', 'LAX', 'JFK', '2026-04-01 06:00', '2026-04-01 14:30', 330, 'Airbus A321', true, true, false, 170, 199)
  await createFlight('AA', 'AA101', 'LAX', 'JFK', '2026-04-01 12:00', '2026-04-01 23:00', 420, 'Boeing 737 MAX', true, true, true, 210,
    199, [
      { origin: 'LAX', dest: 'DFW', dep: '2026-04-01 12:00', arr: '2026-04-01 17:00', dur: 180, terminal_dep: 'T4', terminal_arr: 'TC' },
      { origin: 'DFW', dest: 'JFK', dep: '2026-04-01 18:30', arr: '2026-04-01 23:00', dur: 210, terminal_dep: 'TC', terminal_arr: 'T8' }
    ])

  await createFlight('DL', 'DL201', 'LAX', 'ATL', '2026-04-01 07:00', '2026-04-01 14:30', 270, 'Boeing 757-200', true, true, true, 155, 249)
  await createFlight('UA', 'UA301', 'LAX', 'SFO', '2026-04-01 09:00', '2026-04-01 10:30', 90, 'Airbus A320', false, true, false, 60, 99)
  await createFlight('WN', 'WN100', 'LAX', 'LAS', '2026-04-01 11:00', '2026-04-01 12:15', 75, 'Boeing 737-800', false, false, false, 45, 69)
  await createFlight('AS', 'AS100', 'LAX', 'SEA', '2026-04-01 08:30', '2026-04-01 11:15', 165, 'Boeing 737-900ER', true, true, false, 95, 129)
  await createFlight('AA', 'AA102', 'LAX', 'MIA', '2026-04-01 09:00', '2026-04-01 17:00', 300, 'Boeing 787-8', true, true, true, 175, 269)

  // JFK routes
  await createFlight('AA', 'AA500', 'JFK', 'LAX', '2026-04-01 08:00', '2026-04-01 11:30', 360, 'Boeing 777-300ER', true, true, true, 180, 299)
  await createFlight('DL', 'DL500', 'JFK', 'LAX', '2026-04-01 12:00', '2026-04-01 15:30', 360, 'Airbus A330-900neo', true, true, true, 165, 289)
  await createFlight('BA', 'BA100', 'JFK', 'LHR', '2026-04-01 19:00', '2026-04-02 07:00', 420, 'Boeing 777-300ER', true, true, true, 320, 499)
  await createFlight('AA', 'AA700', 'JFK', 'LHR', '2026-04-01 21:00', '2026-04-02 09:00', 420, 'Boeing 787-9', true, true, true, 310, 549)
  await createFlight('DL', 'DL700', 'JFK', 'CDG', '2026-04-01 18:00', '2026-04-02 07:30', 450, 'Airbus A330-300', true, true, true, 340, 529)
  await createFlight('AF', 'AF100', 'JFK', 'CDG', '2026-04-01 20:00', '2026-04-02 09:30', 450, 'Boeing 777-200ER', true, true, true, 335, 499)
  await createFlight('EK', 'EK200', 'JFK', 'DXB', '2026-04-01 22:00', '2026-04-02 18:30', 780, 'Airbus A380-800', true, true, true, 480, 699)
  await createFlight('TK', 'TK100', 'JFK', 'IST', '2026-04-01 23:00', '2026-04-02 16:30', 630, 'Boeing 777-300ER', true, true, true, 410, 599)

  // SFO routes
  await createFlight('UA', 'UA800', 'SFO', 'NRT', '2026-04-01 11:00', '2026-04-02 14:30', 660, 'Boeing 777-300ER', true, true, true, 420, 749)
  await createFlight('NH', 'NH100', 'SFO', 'NRT', '2026-04-01 13:00', '2026-04-02 16:30', 660, 'Boeing 787-9', true, true, true, 400, 799)
  await createFlight('SQ', 'SQ100', 'SFO', 'SIN', '2026-04-01 23:00', '2026-04-03 06:00', 1020, 'Airbus A350-900ULR', true, true, true, 520, 899)
  await createFlight('UA', 'UA801', 'SFO', 'LHR', '2026-04-01 17:00', '2026-04-02 11:00', 630, 'Boeing 787-9', true, true, true, 380, 599)
  await createFlight('CX', 'CX100', 'SFO', 'HKG', '2026-04-01 01:00', '2026-04-02 07:30', 870, 'Airbus A350-1000', true, true, true, 460, 799)

  // ORD routes
  await createFlight('UA', 'UA900', 'ORD', 'LHR', '2026-04-01 18:00', '2026-04-02 07:30', 510, 'Boeing 787-10', true, true, true, 350, 549)
  await createFlight('LH', 'LH400', 'ORD', 'FRA', '2026-04-01 17:00', '2026-04-02 08:00', 540, 'Airbus A340-600', true, true, true, 380, 579)
  await createFlight('AA', 'AA900', 'ORD', 'LAX', '2026-04-01 09:00', '2026-04-01 11:30', 270, 'Boeing 737-800', true, true, false, 140, 179)
  await createFlight('UA', 'UA901', 'ORD', 'SFO', '2026-04-01 10:00', '2026-04-01 12:30', 270, 'Airbus A320neo', true, true, false, 130, 169)

  // LHR routes
  await createFlight('BA', 'BA200', 'LHR', 'JFK', '2026-04-01 09:00', '2026-04-01 12:00', 480, 'Airbus A380-800', true, true, true, 340, 549)
  await createFlight('BA', 'BA300', 'LHR', 'SIN', '2026-04-01 21:00', '2026-04-02 16:30', 780, 'Boeing 777-300ER', true, true, true, 480, 699)
  await createFlight('BA', 'BA400', 'LHR', 'SYD', '2026-04-01 20:00', '2026-04-03 06:30', 1350, 'Boeing 787-9', true, true, true, 580, 999,
    [
      { origin: 'LHR', dest: 'SIN', dep: '2026-04-01 20:00', arr: '2026-04-02 16:30', dur: 780, terminal_dep: 'T5', terminal_arr: 'T3' },
      { origin: 'SIN', dest: 'SYD', dep: '2026-04-02 19:30', arr: '2026-04-03 06:30', dur: 480, terminal_dep: 'T3', terminal_arr: 'T1' }
    ])
  await createFlight('LH', 'LH100', 'LHR', 'FRA', '2026-04-01 08:00', '2026-04-01 10:30', 120, 'Airbus A320', true, true, false, 70, 149)

  // DXB routes
  await createFlight('EK', 'EK300', 'DXB', 'JFK', '2026-04-01 03:00', '2026-04-01 09:00', 840, 'Airbus A380-800', true, true, true, 500, 749)
  await createFlight('EK', 'EK400', 'DXB', 'LHR', '2026-04-01 07:00', '2026-04-01 11:30', 450, 'Boeing 777-300ER', true, true, true, 350, 449)
  await createFlight('EK', 'EK500', 'DXB', 'SIN', '2026-04-01 09:00', '2026-04-01 21:00', 420, 'Airbus A380-800', true, true, true, 310, 399)
  await createFlight('EK', 'EK600', 'DXB', 'SYD', '2026-04-01 22:00', '2026-04-02 17:30', 870, 'Airbus A380-800', true, true, true, 520, 849)

  // NRT routes
  await createFlight('NH', 'NH200', 'NRT', 'LAX', '2026-04-01 17:00', '2026-04-01 11:00', 600, 'Boeing 787-9', true, true, true, 400, 699)
  await createFlight('NH', 'NH300', 'NRT', 'SIN', '2026-04-01 10:00', '2026-04-01 16:30', 450, 'Boeing 787-8', true, true, true, 310, 499)

  // SIN routes
  await createFlight('SQ', 'SQ200', 'SIN', 'LHR', '2026-04-01 23:30', '2026-04-02 06:00', 810, 'Airbus A380-800', true, true, true, 490, 749)
  await createFlight('SQ', 'SQ300', 'SIN', 'SYD', '2026-04-01 08:00', '2026-04-01 18:30', 480, 'Boeing 777-300ER', true, true, true, 320, 399)

  // More domestic US routes
  await createFlight('WN', 'WN200', 'DEN', 'LAX', '2026-04-01 07:00', '2026-04-01 08:30', 150, 'Boeing 737-800', false, false, false, 80, 109)
  await createFlight('WN', 'WN300', 'DEN', 'ORD', '2026-04-01 10:00', '2026-04-01 13:30', 150, 'Boeing 737 MAX 8', false, false, false, 85, 119)
  await createFlight('DL', 'DL300', 'ATL', 'JFK', '2026-04-01 06:00', '2026-04-01 08:30', 150, 'Boeing 757-200', true, true, true, 95, 149)
  await createFlight('DL', 'DL301', 'ATL', 'LAX', '2026-04-01 08:00', '2026-04-01 10:30', 300, 'Airbus A321neo', true, true, true, 160, 229)
  await createFlight('AA', 'AA300', 'DFW', 'MIA', '2026-04-01 09:00', '2026-04-01 13:00', 180, 'Boeing 737-800', true, true, false, 110, 159)
  await createFlight('B6', 'B6500', 'BOS', 'LAX', '2026-04-01 07:00', '2026-04-01 11:00', 360, 'Airbus A321LR', true, true, true, 175, 249)
  await createFlight('NK', 'NK100', 'LAX', 'MCO', '2026-04-01 06:30', '2026-04-01 14:30', 300, 'Airbus A320neo', false, false, false, 155, 89)
  await createFlight('F9', 'F9100', 'DEN', 'MIA', '2026-04-01 08:00', '2026-04-01 14:30', 270, 'Airbus A321neo', false, false, false, 150, 99)

  // More international routes with connections
  await createFlight('UA', 'UA400', 'LAX', 'NRT', '2026-04-01 12:00', '2026-04-02 16:00', 660, 'Boeing 787-9', true, true, true, 420, 749)
  await createFlight('DL', 'DL400', 'LAX', 'CDG', '2026-04-01 16:00', '2026-04-02 11:30', 660, 'Airbus A350-900', true, true, true, 400, 649)
  await createFlight('QF', 'QF100', 'LAX', 'SYD', '2026-04-01 22:00', '2026-04-03 06:30', 900, 'Boeing 787-9', true, true, true, 540, 899)
  await createFlight('AC', 'AC100', 'LAX', 'YYZ', '2026-04-01 08:00', '2026-04-01 16:00', 300, 'Boeing 737 MAX 8', true, true, false, 155, 229)

  // Return flights for popular routes
  await createFlight('AA', 'AA150', 'JFK', 'LAX', '2026-04-08 08:00', '2026-04-08 11:00', 360, 'Boeing 777-300ER', true, true, true, 180, 299)
  await createFlight('DL', 'DL250', 'JFK', 'LAX', '2026-04-08 14:00', '2026-04-08 17:00', 360, 'Airbus A330-900neo', true, true, true, 165, 279)
  await createFlight('BA', 'BA150', 'LHR', 'JFK', '2026-04-08 10:00', '2026-04-08 13:00', 480, 'Boeing 777-300ER', true, true, true, 320, 499)

  // Additional flights for variety on different dates
  await createFlight('AA', 'AA103', 'LAX', 'JFK', '2026-04-02 08:00', '2026-04-02 16:30', 330, 'Boeing 777-300ER', true, true, true, 180, 309)
  await createFlight('DL', 'DL202', 'LAX', 'JFK', '2026-04-02 10:15', '2026-04-02 18:45', 330, 'Airbus A321neo', true, true, true, 165, 289)
  await createFlight('UA', 'UA302', 'LAX', 'JFK', '2026-04-03 14:00', '2026-04-03 22:30', 330, 'Boeing 787-9', true, true, true, 150, 329)
  await createFlight('AA', 'AA104', 'LAX', 'JFK', '2026-04-05 08:00', '2026-04-05 16:30', 330, 'Boeing 777-300ER', true, true, true, 180, 269)
  await createFlight('B6', 'B6401', 'LAX', 'JFK', '2026-04-05 06:00', '2026-04-05 14:30', 330, 'Airbus A321', true, true, false, 170, 189)

  // SFO-ORD
  await createFlight('UA', 'UA600', 'SFO', 'ORD', '2026-04-01 07:00', '2026-04-01 13:00', 270, 'Boeing 737-900', true, true, false, 140, 179)
  await createFlight('AA', 'AA600', 'SFO', 'ORD', '2026-04-01 11:00', '2026-04-01 17:00', 270, 'Airbus A321', true, true, false, 145, 189)

  // SFO-JFK (23 flights for pagination testing)
  await createFlight('UA', 'UA650', 'SFO', 'JFK', '2026-04-01 05:00', '2026-04-01 13:30', 330, 'Boeing 777-200', true, true, true, 155, 179)
  await createFlight('DL', 'DL650', 'SFO', 'JFK', '2026-04-01 05:30', '2026-04-01 14:00', 330, 'Boeing 767-400', true, true, false, 160, 199)
  await createFlight('AA', 'AA650', 'SFO', 'JFK', '2026-04-01 06:00', '2026-04-01 14:30', 330, 'Boeing 737 MAX', true, false, false, 165, 189)
  await createFlight('B6', 'B6650', 'SFO', 'JFK', '2026-04-01 06:30', '2026-04-01 15:00', 330, 'Airbus A321', true, true, false, 150, 159)
  await createFlight('NK', 'NK650', 'SFO', 'JFK', '2026-04-01 07:00', '2026-04-01 15:30', 330, 'Airbus A320neo', false, false, false, 145, 99)
  await createFlight('WN', 'WN650', 'SFO', 'JFK', '2026-04-01 07:30', '2026-04-01 16:00', 330, 'Boeing 737-800', false, false, false, 140, 119)
  await createFlight('AS', 'AS650', 'SFO', 'JFK', '2026-04-01 08:00', '2026-04-01 16:30', 330, 'Boeing 737-900ER', true, true, false, 155, 149)
  await createFlight('UA', 'UA651', 'SFO', 'JFK', '2026-04-01 08:30', '2026-04-01 17:00', 330, 'Boeing 787-9', true, true, true, 160, 209)
  await createFlight('DL', 'DL651', 'SFO', 'JFK', '2026-04-01 09:00', '2026-04-01 17:30', 330, 'Airbus A321neo', true, true, true, 155, 219)
  await createFlight('AA', 'AA651', 'SFO', 'JFK', '2026-04-01 09:30', '2026-04-01 18:00', 330, 'Boeing 737-800', true, true, false, 165, 229)
  await createFlight('UA', 'UA652', 'SFO', 'JFK', '2026-04-01 10:00', '2026-04-01 18:30', 330, 'Boeing 757-200', true, true, false, 150, 239)
  await createFlight('DL', 'DL652', 'SFO', 'JFK', '2026-04-01 10:30', '2026-04-01 19:00', 330, 'Boeing 767-300', true, true, true, 160, 249)
  await createFlight('AA', 'AA652', 'SFO', 'JFK', '2026-04-01 11:00', '2026-04-01 19:30', 330, 'Boeing 777-300ER', true, true, true, 170, 259)
  await createFlight('B6', 'B6651', 'SFO', 'JFK', '2026-04-01 11:30', '2026-04-01 20:00', 330, 'Airbus A321LR', true, true, false, 150, 169)
  await createFlight('UA', 'UA653', 'SFO', 'JFK', '2026-04-01 12:00', '2026-04-01 20:30', 330, 'Boeing 787-10', true, true, true, 155, 269)
  await createFlight('DL', 'DL653', 'SFO', 'JFK', '2026-04-01 12:30', '2026-04-01 21:00', 330, 'Airbus A330-300', true, true, true, 165, 279)
  await createFlight('AA', 'AA653', 'SFO', 'JFK', '2026-04-01 13:00', '2026-04-01 21:30', 330, 'Boeing 787-9', true, true, true, 170, 289)
  await createFlight('UA', 'UA654', 'SFO', 'JFK', '2026-04-01 14:00', '2026-04-01 22:30', 330, 'Boeing 777-200', true, true, true, 160, 299)
  await createFlight('DL', 'DL654', 'SFO', 'JFK', '2026-04-01 15:00', '2026-04-01 23:30', 330, 'Airbus A321neo', true, true, true, 155, 309)
  await createFlight('AA', 'AA654', 'SFO', 'JFK', '2026-04-01 16:00', '2026-04-02 00:30', 330, 'Boeing 737 MAX', true, true, false, 165, 319)
  await createFlight('UA', 'UA655', 'SFO', 'JFK', '2026-04-01 17:00', '2026-04-02 01:30', 330, 'Boeing 787-9', true, true, true, 160, 329)
  await createFlight('DL', 'DL655', 'SFO', 'JFK', '2026-04-01 18:00', '2026-04-02 02:30', 330, 'Airbus A330-900neo', true, true, true, 165, 339)
  await createFlight('AA', 'AA655', 'SFO', 'JFK', '2026-04-01 14:30', '2026-04-02 00:00', 420, 'Boeing 737 MAX', true, true, false, 200, 189,
    [
      { origin: 'SFO', dest: 'ORD', dep: '2026-04-01 14:30', arr: '2026-04-01 20:00', dur: 240, terminal_dep: 'T2', terminal_arr: 'T1' },
      { origin: 'ORD', dest: 'JFK', dep: '2026-04-01 21:30', arr: '2026-04-02 00:00', dur: 150, terminal_dep: 'T2', terminal_arr: 'T5' }
    ])

  // LAX-LHR
  await createFlight('BA', 'BA500', 'LAX', 'LHR', '2026-04-01 20:00', '2026-04-02 14:30', 630, 'Boeing 777-300ER', true, true, true, 380, 649)
  await createFlight('AA', 'AA800', 'LAX', 'LHR', '2026-04-01 18:00', '2026-04-02 12:30', 630, 'Boeing 787-9', true, true, true, 370, 599)

  // Create a session for seed data
  await sql`INSERT INTO sessions (session_token) VALUES ('seed-session-token')`
  const sessionRows = await sql`SELECT id FROM sessions WHERE session_token = 'seed-session-token'`
  const sessionRow = sessionRows[0]
  if (!sessionRow) return
  const sessionId = sessionRow.id as string

  // Recent searches
  const laxId = airportMap.get('LAX')!
  const jfkId = airportMap.get('JFK')!
  const sfoId = airportMap.get('SFO')!
  const ordId = airportMap.get('ORD')!
  const lhrId = airportMap.get('LHR')!

  await sql`INSERT INTO recent_searches (session_id, origin_airport_id, destination_airport_id, departure_date, return_date, passengers_adults, cabin_class, trip_type)
    VALUES (${sessionId}, ${laxId}, ${jfkId}, '2026-04-01', '2026-04-08', 1, 'economy', 'round_trip')`
  await sql`INSERT INTO recent_searches (session_id, origin_airport_id, destination_airport_id, departure_date, return_date, passengers_adults, cabin_class, trip_type)
    VALUES (${sessionId}, ${sfoId}, ${ordId}, '2026-04-05', '2026-04-10', 2, 'business', 'round_trip')`

  // Sample bookings
  const flightForBooking = await sql`SELECT id FROM flights WHERE flight_number = 'AA100' LIMIT 1`
  const bookingFlight = flightForBooking[0]
  if (bookingFlight) {
    await sql`INSERT INTO bookings (session_id, flight_id, booking_reference, cabin_class, total_price_cents, status)
      VALUES (${sessionId}, ${bookingFlight.id}, 'GF-ABC123', 'economy', 34385, 'confirmed')`
    const bookingRows = await sql`SELECT id FROM bookings WHERE booking_reference = 'GF-ABC123'`
    const booking = bookingRows[0]
    if (booking) {
      await sql`INSERT INTO booking_passengers (booking_id, first_name, last_name, date_of_birth, gender, email, phone, passenger_type)
        VALUES (${booking.id}, 'John', 'Doe', '1990-05-15', 'male', 'john@example.com', '+1234567890', 'adult')`
    }
  }

  // Tracked routes
  await sql`INSERT INTO tracked_routes (session_id, origin_airport_id, destination_airport_id, departure_date_start, departure_date_end, cabin_class)
    VALUES (${sessionId}, ${laxId}, ${lhrId}, '2026-04-15', '2026-04-30', 'economy')`
}

// CLI entry point
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
if (isMain) {
  const dbUrl = process.argv[2]
  if (!dbUrl) {
    console.error('Usage: tsx scripts/seed-db.ts <DATABASE_URL>')
    process.exit(1)
  }
  truncateAndSeed(dbUrl).then(() => console.log('Seed complete')).catch(e => { console.error(e); process.exit(1) })
}
