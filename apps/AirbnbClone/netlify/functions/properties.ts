import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const propertyId = segments[3] // /.netlify/functions/properties/:id

  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET' && propertyId) {
    const result = await sql`
      SELECT p.*,
        u.name as host_name, u.avatar_url as host_avatar, u.bio as host_bio, u.created_at as host_since,
        (SELECT count(*)::int FROM properties WHERE host_id = p.host_id AND is_active = true) as host_listing_count,
        (SELECT COALESCE(AVG(r.rating)::numeric(10,1), 0) FROM reviews r WHERE r.property_id = p.id) as avg_rating,
        (SELECT count(*)::int FROM reviews r WHERE r.property_id = p.id) as review_count
      FROM properties p
      JOIN users u ON u.id = p.host_id
      WHERE p.id = ${propertyId}
    `
    const property = result[0]
    if (!property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404, headers })
    }

    const images = await sql`
      SELECT * FROM property_images WHERE property_id = ${propertyId} ORDER BY display_order ASC
    `

    const amenities = await sql`
      SELECT a.* FROM amenities a
      JOIN property_amenities pa ON pa.amenity_id = a.id
      WHERE pa.property_id = ${propertyId}
      ORDER BY a.category, a.name
    `

    const reviews = await sql`
      SELECT r.*, u.name as guest_name, u.avatar_url as guest_avatar
      FROM reviews r
      JOIN users u ON u.id = r.guest_id
      WHERE r.property_id = ${propertyId}
      ORDER BY r.created_at DESC
    `

    return new Response(JSON.stringify({ ...property, images, amenities, reviews }), { status: 200, headers })
  }

  if (request.method === 'GET') {
    const city = url.searchParams.get('city') || ''
    const checkIn = url.searchParams.get('check_in') || ''
    const checkOut = url.searchParams.get('check_out') || ''
    const guestsStr = url.searchParams.get('guests') || '0'
    const propertyType = url.searchParams.get('property_type') || ''
    const minPriceStr = url.searchParams.get('min_price') || '0'
    const maxPriceStr = url.searchParams.get('max_price') || '0'
    const minBedroomsStr = url.searchParams.get('min_bedrooms') || '0'
    const minBedsStr = url.searchParams.get('min_beds') || '0'
    const minBathroomsStr = url.searchParams.get('min_bathrooms') || '0'
    const amenitiesParam = url.searchParams.get('amenities') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '12', 10)
    const offset = (page - 1) * limit

    const guestsNum = parseInt(guestsStr, 10) || 0
    const minPrice = parseFloat(minPriceStr) || 0
    const maxPrice = parseFloat(maxPriceStr) || 0
    const minBedrooms = parseInt(minBedroomsStr, 10) || 0
    const minBeds = parseInt(minBedsStr, 10) || 0
    const minBathrooms = parseInt(minBathroomsStr, 10) || 0
    const amenityIds = amenitiesParam ? amenitiesParam.split(',').filter(Boolean) : []
    const amenityCount = amenityIds.length
    const hasDateFilter = checkIn !== '' && checkOut !== ''
    const hasAmenityFilter = amenityCount > 0

    const countResult = await sql`
      SELECT count(*)::int as total
      FROM properties p
      WHERE p.is_active = true
        AND (${city} = '' OR LOWER(p.city) LIKE LOWER('%' || ${city} || '%'))
        AND (${guestsNum} = 0 OR p.max_guests >= ${guestsNum})
        AND (${propertyType} = '' OR p.property_type = ${propertyType})
        AND (${minPrice} = 0 OR p.price_per_night >= ${minPrice})
        AND (${maxPrice} = 0 OR p.price_per_night <= ${maxPrice})
        AND (${minBedrooms} = 0 OR p.bedrooms >= ${minBedrooms})
        AND (${minBeds} = 0 OR p.beds >= ${minBeds})
        AND (${minBathrooms} = 0 OR p.bathrooms >= ${minBathrooms})
        AND (${!hasDateFilter} OR NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.property_id = p.id
          AND b.status IN ('confirmed', 'pending')
          AND b.check_in < ${checkOut || '9999-12-31'}
          AND b.check_out > ${checkIn || '1970-01-01'}
        ))
        AND (${!hasAmenityFilter} OR (
          SELECT count(*) FROM property_amenities pa
          WHERE pa.property_id = p.id AND pa.amenity_id::text = ANY(${amenityIds})
        ) >= ${amenityCount})
    `
    const countRow = countResult[0]
    const total = countRow ? (countRow as Record<string, unknown>).total as number : 0

    const properties = await sql`
      SELECT p.*,
        (SELECT url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order ASC LIMIT 1) as main_image,
        (SELECT COALESCE(AVG(r.rating)::numeric(10,1), 0) FROM reviews r WHERE r.property_id = p.id) as avg_rating,
        (SELECT count(*)::int FROM reviews r WHERE r.property_id = p.id) as review_count
      FROM properties p
      WHERE p.is_active = true
        AND (${city} = '' OR LOWER(p.city) LIKE LOWER('%' || ${city} || '%'))
        AND (${guestsNum} = 0 OR p.max_guests >= ${guestsNum})
        AND (${propertyType} = '' OR p.property_type = ${propertyType})
        AND (${minPrice} = 0 OR p.price_per_night >= ${minPrice})
        AND (${maxPrice} = 0 OR p.price_per_night <= ${maxPrice})
        AND (${minBedrooms} = 0 OR p.bedrooms >= ${minBedrooms})
        AND (${minBeds} = 0 OR p.beds >= ${minBeds})
        AND (${minBathrooms} = 0 OR p.bathrooms >= ${minBathrooms})
        AND (${!hasDateFilter} OR NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.property_id = p.id
          AND b.status IN ('confirmed', 'pending')
          AND b.check_in < ${checkOut || '9999-12-31'}
          AND b.check_out > ${checkIn || '1970-01-01'}
        ))
        AND (${!hasAmenityFilter} OR (
          SELECT count(*) FROM property_amenities pa
          WHERE pa.property_id = p.id AND pa.amenity_id::text = ANY(${amenityIds})
        ) >= ${amenityCount})
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return new Response(JSON.stringify({
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), { status: 200, headers })
  }

  if (request.method === 'POST') {
    const body = await request.json() as {
      host_id: string
      title: string
      description: string
      property_type: string
      price_per_night: number
      cleaning_fee: number
      max_guests: number
      bedrooms: number
      beds: number
      bathrooms: number
      address: string
      city: string
      state: string | null
      country: string
      latitude: number | null
      longitude: number | null
      amenity_ids?: string[]
    }

    const {
      host_id, title, description, property_type, price_per_night, cleaning_fee,
      max_guests, bedrooms, beds, bathrooms, address, city, state, country,
      latitude, longitude, amenity_ids,
    } = body

    if (!host_id || !title || !property_type || !price_per_night || !max_guests || !city || !country) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers })
    }

    const result = await sql`
      INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee,
        max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude,
        is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${host_id}, ${title}, ${description || ''}, ${property_type},
        ${price_per_night}, ${cleaning_fee || 0}, ${max_guests}, ${bedrooms || 0}, ${beds || 0},
        ${bathrooms || 0}, ${address || ''}, ${city}, ${state || null}, ${country},
        ${latitude || null}, ${longitude || null}, true, now(), now())
      RETURNING *
    `
    const property = result[0]

    if (amenity_ids && amenity_ids.length > 0) {
      for (const amenityId of amenity_ids) {
        await sql`
          INSERT INTO property_amenities (property_id, amenity_id)
          VALUES (${(property as Record<string, unknown>).id as string}, ${amenityId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    return new Response(JSON.stringify(property), { status: 201, headers })
  }

  if (request.method === 'PUT' && propertyId) {
    const body = await request.json() as {
      is_active?: boolean
      title?: string
      description?: string
      price_per_night?: number
      cleaning_fee?: number
    }

    const existing = await sql`SELECT * FROM properties WHERE id = ${propertyId}`
    const existingProp = existing[0]
    if (!existingProp) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404, headers })
    }

    const ep = existingProp as Record<string, unknown>
    const result = await sql`
      UPDATE properties SET
        is_active = ${body.is_active !== undefined ? body.is_active : ep.is_active as boolean},
        title = ${body.title !== undefined ? body.title : ep.title as string},
        description = ${body.description !== undefined ? body.description : ep.description as string},
        price_per_night = ${body.price_per_night !== undefined ? body.price_per_night : ep.price_per_night as number},
        cleaning_fee = ${body.cleaning_fee !== undefined ? body.cleaning_fee : ep.cleaning_fee as number},
        updated_at = now()
      WHERE id = ${propertyId}
      RETURNING *
    `
    const property = result[0]
    return new Response(JSON.stringify(property), { status: 200, headers })
  }

  if (request.method === 'DELETE' && propertyId) {
    const result = await sql`
      UPDATE properties SET is_active = false, updated_at = now()
      WHERE id = ${propertyId}
      RETURNING *
    `
    const property = result[0]
    if (!property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(property), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
