import * as d3 from 'd3'

export const PROFILE_LIST = [
        {id: "76561198045239417", altname: "elTostes"},
        {id: "76561199081589502", altname: "Rogerinho do Ingá"},
        {id: "76561198072099800", altname: "Leandro, O Zébio"},
        {id: "76561197988075974", altname: "Arret"},
        {id: "76561197989969303", altname: "Terra"},
        {id: "76561198030729173", altname: "Frefs"},
        {id: "76561198019340968", altname: "Diogo"},
        {id: "76561198178678687", altname: "Rust Cohle"},
        {id: "76561199019347586", altname: "Cano Carequinha"},
        {id: "76561198056952889", altname: "Pistoleiro do Sudoeste"},
        {id: "76561198143606012", altname: "Ahaab Himself"},
        {id: "76561199674847975", altname: "ilanvale"},
    ]

export const MULTI_PROFILES = {
        "Rogerinho do Ingá": "elTostes",
        "Arret": "Terra"
    }

export const hours_offset = 10;

export function dateRounding(date) {
    // Accepts Date ISO 8601 format (date and time UTC) as string
    return d3.timeFormat('%Y-%m-%d')(new Date(
        `${date.slice(0, -1)}+${d3.format("02")(hours_offset)}:00`
      ))
}