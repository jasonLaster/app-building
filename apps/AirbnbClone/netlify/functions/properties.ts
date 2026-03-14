import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const propertyId = segments[2] // /api/properties/:id

  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET' && propertyId) {
    const result = await sql`
      SELECT p.*,
        u.name as host_name, u.avatar_url as host_avatar, u.bio as host_bio, u.created_at as host_since,
        (SELECT count(*)::int FROM properties WHERE host_id = p.host_id AND is_active = true) as host_listing_count
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

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
