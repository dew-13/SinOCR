import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useMemo } from "react";

// Dynamic import for Next.js (if needed)
const geoUrl = "/sri-lanka-districts.geojson";

interface DistrictStat {
  district: string;
  count: number;
}

export default function SriLankaDistrictMap({ districtStats }: { districtStats: DistrictStat[] }) {
  // Map district names to counts
  const districtData: Record<string, number> = {};
  districtStats.forEach((d) => {
    districtData[d.district.trim().toLowerCase()] = d.count;
  });

  const max = Math.max(...districtStats.map((d) => d.count), 1);
  const colorScale = scaleLinear<string>().domain([0, max]).range(["#e0f2fe", "#0284c7"]);

  // For legend
  const legendSteps = 5;
  const legendValues = useMemo(() => {
    return Array.from({ length: legendSteps + 1 }, (_, i) => Math.round((i * max) / legendSteps));
  }, [max]);

  return (
    <div className="w-full flex flex-col items-center">
      <ComposableMap
        projection="geoMercator"
        width={400}
        height={500}
        projectionConfig={{
          scale: 5000,
          center: [80.7, 7.8], // Center on Sri Lanka
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const districtName = geo.properties.DISTRICT_NAME?.trim().toLowerCase();
              const value = districtData[districtName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(value)}
                  stroke="#fff"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#f59e42", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        {legendValues.map((val, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-8 h-4"
              style={{ background: colorScale(val), borderRadius: 2, border: "1px solid #e5e7eb" }}
            ></div>
            <span className="text-xs text-gray-500">{val}</span>
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-700">Registered Students</span>
      </div>
    </div>
  );
} 