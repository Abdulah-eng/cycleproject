import { Bike } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface SpecsTableProps {
  bike: Bike
}

interface SpecSection {
  title: string
  specs: { label: string; value: string | null }[]
}

export default function SpecsTable({ bike }: SpecsTableProps) {
  const sections: SpecSection[] = [
    {
      title: 'Frame',
      specs: [
        { label: 'Frame', value: bike.frame_description || bike.frame },
        { label: 'Suspension Fork', value: bike.suspension_fork_description || bike.fork },
        { label: 'Rear Shock', value: bike.rear_shock_description },
      ],
    },
    {
      title: 'Drivetrain',
      specs: [
        { label: 'Shift Levers', value: bike.shift_levers },
        { label: 'Rear Derailleur', value: bike.rear_derailleur },
        { label: 'Front Derailleur', value: bike.front_derailleur },
        { label: 'Cassette', value: bike.cassette },
        { label: 'Crank', value: bike.crank },
        { label: 'Bottom Bracket', value: bike.bottom_bracket },
        { label: 'Chain', value: bike.chain },
      ],
    },
    {
      title: 'Wheels',
      specs: [
        { label: 'Front Hub', value: bike.front_hub },
        { label: 'Rear Hub', value: bike.rear_hub },
        { label: 'Rims', value: bike.rims },
        { label: 'Spokes', value: bike.spokes },
        { label: 'Tires', value: bike.tires },
      ],
    },
    {
      title: 'Brakes',
      specs: [
        { label: 'Brakes', value: bike.brakes },
        { label: 'Brake Levers', value: bike.brake_levers },
      ],
    },
    {
      title: 'Cockpit',
      specs: [
        { label: 'Stem', value: bike.stem },
        { label: 'Handlebar', value: bike.handlebar },
        { label: 'Grips', value: bike.grips },
      ],
    },
    {
      title: 'Seat',
      specs: [
        { label: 'Saddle', value: bike.saddle },
        { label: 'Seatpost', value: bike.seatpost },
      ],
    },
    {
      title: 'General',
      specs: [
        { label: 'Brand', value: bike.brand },
        { label: 'Model', value: bike.model },
        { label: 'Year', value: bike.year?.toString() || null },
        { label: 'Price', value: bike.price ? formatPrice(bike.price) : null },
        { label: 'Weight', value: bike.weight },
        { label: 'Category', value: bike.category },
        { label: 'Sub Category', value: bike.sub_category },
        { label: 'Groupset', value: bike.groupset },
        { label: 'Wheels', value: bike.wheels },
      ],
    },
  ]

  // Add e-bike section if applicable
  if (bike.motor || bike.battery) {
    sections.push({
      title: 'Electric Components',
      specs: [
        { label: 'Motor', value: bike.motor || bike.motor3 },
        { label: 'Battery', value: bike.battery || bike.battery4 },
        { label: 'Charger', value: bike.charger },
        { label: 'Battery Range', value: bike.battery_range },
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
