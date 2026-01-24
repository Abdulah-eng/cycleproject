import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const content = await file.text()

    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '')

    // Parse CSV properly handling quoted multi-line fields
    const rows = parseCSV(cleanContent)

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Get headers and normalize
    const headers = rows[0].map((h: string) => h.trim().toLowerCase())
    const dataRows = rows.slice(1)

    const progress = {
      total: dataRows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    }

    // Process rows in batches
    const batchSize = 100
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize)
      const bikesToInsert = []

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2 // +2 for header row and 0-based index
        const row = batch[j]

        try {
          const rowData: any = {}

          headers.forEach((header: string, index: number) => {
            const value = row[index]?.trim() || null
            rowData[header] = value === '' ? null : value
          })

          // Validate required fields
          if (!rowData.brand || !rowData.model || !rowData.year || !rowData.category) {
            throw new Error('Missing required fields: brand, model, year, or category')
          }

          // Generate unique slug
          const baseSlug = `${rowData.brand}-${rowData.model}-${rowData.year}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          // Add ID to make slug unique if it exists in the CSV
          const slug = rowData.id ? `${baseSlug}-${rowData.id}` : baseSlug

          // Parse images - handle both "images" and "image urls" columns
          let imagesArray: string[] | null = null
          const imagesStr = rowData.images || rowData['image urls'] || rowData.image_urls
          if (imagesStr) {
            imagesArray = imagesStr.split(',').map((url: string) => url.trim()).filter((url: string) => url)
          }

          // Prepare bike data with correct schema column names
          const bikeData: any = {
            brand: rowData.brand,
            model: rowData.model,
            year: parseInt(rowData.year),
            slug,
            category: rowData.category,
            sub_category: rowData.sub_category || rowData.subcategory,
            price: rowData.price ? parseFloat(rowData.price.toString().replace(/[^0-9.]/g, '')) : null,
            weight: rowData.weight,
            frame: rowData.frame,
            travel_front: rowData.travel_front,
            travel_rear: rowData.travel_rear,
            wheels: rowData.wheels,
            groupset: rowData.groupset,
            fork: rowData.fork,
            suspension: rowData.suspension,
            motor: rowData.motor,
            battery: rowData.battery,
            drivetrain: rowData.drivetrain,
            brakes: rowData.brakes,
            brakes2: rowData.brakes2,
            spokes: rowData.spokes,
            brake_levers: rowData.brake_levers,
            stem: rowData.stem,
            handlebar: rowData.handlebar,
            frame_description: rowData.frame_description,
            suspension_fork_description: rowData.suspension_fork_description,
            rear_shock_description: rowData.rear_shock_description,
            rear_derailleur: rowData.rear_derailleur,
            front_derailleur: rowData.front_derailleur,
            shift_levers: rowData.shift_levers,
            cassette: rowData.cassette,
            crank: rowData.crank,
            bottom_bracket: rowData.bottom_bracket,
            chain: rowData.chain,
            pedals: rowData.pedals,
            front_hub: rowData.front_hub,
            rear_hub: rowData.rear_hub,
            grips: rowData.grips,
            saddle: rowData.saddle,
            seatpost: rowData.seatpost,
            motor3: rowData.motor3,
            battery4: rowData.battery4,
            charger: rowData.charger,
            rims: rowData.rims,
            tires: rowData.tires,
            images: imagesArray,
            geometry_data: rowData.geometry_data,
            url: rowData.url,
            title: rowData.title,
            meta_desc: rowData.meta_desc,
          }

          // Add numeric fields with proper conversion
          const numericFields = [
            'stack_reach_ratio', 'bottom_bracket_height', 'front_center', 'rake', 'trail',
            'stack', 'reach', 'top_tube_length', 'seat_tube_angle', 'seat_tube_length',
            'head_tube_angle', 'head_tube_length', 'chainstay_length', 'wheelbase',
            'bottom_bracket_drop', 'standover_height', 'rider_min_height', 'rider_max_height'
          ]

          numericFields.forEach(field => {
            if (rowData[field]) {
              const cleaned = rowData[field].toString().replace(/[^0-9.]/g, '')
              if (cleaned) {
                bikeData[field] = parseFloat(cleaned)
              }
            }
          })

          // Add integer fields (ratings 1-10)
          const integerFields = [
            'fit_flexibility_1_10', 'vfm_score_1_to_10', 'build_1_10', 'aero_1_10',
            'climb_1_10', 'suspension_1_10', 'posture_1_10', 'torso_angle_deg',
            'responsiveness_1_10', 'speed_index', 'ride_comfort_1_10'
          ]

          integerFields.forEach(field => {
            if (rowData[field]) {
              const cleaned = rowData[field].toString().replace(/[^0-9]/g, '')
              if (cleaned) {
                bikeData[field] = parseInt(cleaned)
              }
            }
          })

          // Add text bucket fields
          const bucketFields = [
            'fit_flexibility_bucket', 'vfm_score_bucket', 'build_bucket', 'aero_bucket',
            'climb_bucket', 'suspension_bucket', 'posture_bucket', 'responsiveness_bucket',
            'speed_bucket', 'ride_comfort_bucket', 'category_fit', 'surface_range',
            'battery_range', 'battery_bucket'
          ]

          bucketFields.forEach(field => {
            if (rowData[field]) {
              bikeData[field] = rowData[field]
            }
          })

          // Add score explanation fields (support both new and legacy column names)
          // Map legacy "reason" columns to new "explanation" columns
          const explanationMapping: Record<string, string[]> = {
            'fit_flexibility_explanation': ['fit_flexibility_explanation', 'fit_reason'],
            'value_for_money_explanation': ['value_for_money_explanation', 'vfm_reason'],
            'build_quality_explanation': ['build_quality_explanation', 'build_reason'],
            'aerodynamics_explanation': ['aerodynamics_explanation', 'aero_reason'],
            'climbing_efficiency_explanation': ['climbing_efficiency_explanation', 'climb_reason'],
            'riding_position_explanation': ['riding_position_explanation', 'posture_reason'],
            'handling_explanation': ['handling_explanation', 'responsiveness_reason'],
            'ride_comfort_explanation': ['ride_comfort_explanation', 'comfort_reason'],
            'surface_range_explanation': ['surface_range_explanation', 'surface_reason'],
            'overall_score_explanation': ['overall_score_explanation'],
            'performance_score_explanation': ['performance_score_explanation', 'speed_reason'],
            'value_score_explanation': ['value_score_explanation'],
            'fit_score_explanation': ['fit_score_explanation'],
            'general_score_explanation': ['general_score_explanation'],
          }

          Object.entries(explanationMapping).forEach(([dbField, possibleColumns]) => {
            for (const column of possibleColumns) {
              if (rowData[column]) {
                bikeData[dbField] = rowData[column]
                break // Use first matching column found
              }
            }
          })

          bikesToInsert.push(bikeData)
          progress.processed++
        } catch (error: any) {
          progress.processed++
          progress.failed++
          progress.errors.push({ row: rowIndex, error: error.message })
        }
      }

      // Insert batch
      if (bikesToInsert.length > 0) {
        const { data, error } = await supabaseServer
          .from('bikes')
          .insert(bikesToInsert)
          .select('id')

        if (error) {
          // Handle duplicate slugs or other errors by inserting one by one
          for (let k = 0; k < bikesToInsert.length; k++) {
            try {
              const { error: insertError } = await supabaseServer
                .from('bikes')
                .insert([bikesToInsert[k]])

              if (insertError) {
                progress.failed++
                progress.errors.push({
                  row: i + k + 2,
                  error: insertError.message || 'Insert failed'
                })
              } else {
                progress.successful++
              }
            } catch (err: any) {
              progress.failed++
              progress.errors.push({
                row: i + k + 2,
                error: err.message || 'Insert failed'
              })
            }
          }
        } else {
          progress.successful += data.length
        }
      }
    }

    return NextResponse.json(progress)
  } catch (error: any) {
    console.error('Error in CSV upload:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Proper CSV parser that handles quoted fields with newlines
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++
      } else {
        // Toggle quotes
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField)
      currentField = ''
    } else if (char === '\n' && !inQuotes) {
      // End of row (only if not inside quotes)
      currentRow.push(currentField)
      if (currentRow.some(field => field.trim())) {
        // Only add non-empty rows
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
      // Skip \r if it's \r\n
      if (text[i - 1] === '\r') {
        continue
      }
    } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
      // Handle \r\n line ending
      currentRow.push(currentField)
      if (currentRow.some(field => field.trim())) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
      i++ // Skip the \n
    } else {
      currentField += char
    }
  }

  // Add last field and row if any
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.some(field => field.trim())) {
      rows.push(currentRow)
    }
  }

  return rows
}
