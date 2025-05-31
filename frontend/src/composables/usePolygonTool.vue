import { watch } from 'vue' import type { Ref } from 'vue' import type
MapboxDraw from '@mapbox/mapbox-gl-draw' import type { Feature, Polygon as
GeoPolygon } from 'geojson' export interface AppPolygon { id?: string name:
string coordinates: number[][][] createdAt?: number featureId?: string } export
function usePolygonTool({ polygons, selectedPolygon, }: { polygons: Ref
<AppPolygon[]></AppPolygon[]>
