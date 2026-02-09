import { Bike } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface SpecsTableProps {
  bike: Bike
  dict: any
}

interface SpecSection {
  title: string
  specs: { label: string; value: string | null }[]
}

export default function SpecsTable({ bike, dict }: SpecsTableProps) {
  const t = (key: string) => dict?.specs?.[key] || key

  const sections: SpecSection[] = [
    {
      title: t('general'),
      specs: [
        { label: t('brand'), value: bike.brand },
        { label: t('model'), value: bike.model },
        { label: t('year'), value: bike.year?.toString() || null },
        { label: t('price'), value: bike.price ? formatPrice(bike.price) : null },
        { label: t('weight'), value: bike.weight },
        { label: t('category'), value: bike.category },
        { label: t('sub_category'), value: bike.sub_category },
        { label: t('groupset'), value: bike.groupset },
        { label: t('wheels'), value: bike.wheels },
      ],
    },
    {
      title: t('frame'),
      specs: [
        { label: t('frame'), value: bike.frame_description || bike.frame },
        { label: t('suspension_fork'), value: bike.suspension_fork_description || bike.fork },
        { label: t('rear_shock'), value: bike.rear_shock_description },
        { label: t('suspension_type'), value: bike.suspension }, // Added as requested
      ],
    },
    {
      title: t('drivetrain'),
      specs: [
        { label: t('shift_levers'), value: bike.shift_levers },
        { label: t('rear_derailleur'), value: bike.rear_derailleur },
        { label: t('front_derailleur'), value: bike.front_derailleur },
        { label: t('cassette'), value: bike.cassette },
        { label: t('crank'), value: bike.crank },
        { label: t('bottom_bracket'), value: bike.bottom_bracket },
        { label: t('chain'), value: bike.chain },
      ],
    },
    {
      title: t('wheels'),
      specs: [
        { label: t('front_hub'), value: bike.front_hub },
        { label: t('rear_hub'), value: bike.rear_hub },
        { label: t('rims'), value: bike.rims },
        { label: t('spokes'), value: bike.spokes }, // Added spokes
        { label: t('tires'), value: bike.tires },
      ],
    },
    {
      title: t('brakes'),
      specs: [
        { label: t('brake_type'), value: bike.brakes }, // mapped to 'Brake Type' in en.json
        { label: t('brake_description'), value: bike.brakes2 }, // mapped to 'Brake Description' in en.json
        { label: t('brake_levers'), value: bike.brake_levers },
      ],
    },
    {
      title: t('cockpit'),
      specs: [
        { label: t('stem'), value: bike.stem },
        { label: t('handlebar'), value: bike.handlebar },
        { label: t('grips'), value: bike.grips },
      ],
    },
    {
      title: t('seat'),
      specs: [
        { label: t('saddle'), value: bike.saddle },
        { label: t('seatpost'), value: bike.seatpost },
      ],
    },
  ]

  // Add e-bike section if applicable
  if (bike.motor || bike.battery || bike.motor3 || bike.battery4) {
    sections.push({
      title: t('electric_components'),
      specs: [
        { label: t('motor'), value: bike.motor3 || bike.motor }, // Prefer motor3 if available
        { label: t('battery'), value: bike.battery4 || bike.battery }, // Prefer battery4 if available
        { label: t('charger'), value: bike.charger },
        { label: t('battery_range'), value: bike.battery_range },
      ],
    })
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        // Filter out empty specs
        const validSpecs = section.specs.filter((spec) => spec.value && spec.value.trim() !== '')

        if (validSpecs.length === 0) return null

        return (
          <div key={section.title}>
            <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validSpecs.map((spec, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {spec.label}
                  </div>
                  <div className="text-sm text-gray-900">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
