const en = {
  heroTitle: "Explore the world. Find your place.", heroSub: "Study-abroad info, all in one place.",
  search: "Search country, city, keyword", noResults: "No results found", searchHint: "Try “Manchester”, “UK”, “university”",
  explore: "Explore", compare: "Compare", about: "About", popular: "Popular destinations",
  pickCountry: "Click a highlighted country on the map, or choose below.", noData: "No data for this country yet.",
  cities: "Cities", back: "Back", home: "Home", addCompare: "Add to compare", remove: "Remove from compare", goCompare: "Go to compare",
  maxCompare: "Select 2–3 cities to compare (max 3).", emptyCompare: "No cities selected yet.", clear: "Clear",
  cost: "Living cost", monthly: "Monthly living cost", rent: "Rent", transportCost: "Transport pass", housing: "Housing",
  transport: "Transport", climate: "Climate", student: "Student life", areas: "Popular areas", schools: "Universities",
  official: "Official information", updated: "Last updated", sample: "Demo sample – not verified", pending: "Data coming soon",
  mapFail: "Map failed to load. Use the search bar or country buttons to browse cities.",
  details: "View details", mapNote: "Map: MapLibre demo tiles",
  notFoundTitle: "Page not found", notFoundBody: "The page or city you requested does not exist.",
  mapFailed: "The map could not be loaded. Choose a country or city from the list or search instead.",
  photoCredits: "Photo credits", photoNote: "Photos from Wikimedia Commons, resized for this site. Each photo is available under the license shown.", photo: "Photo",
  compareFull: "You can compare up to 3 cities. Remove one to add another.", sampleNote: "Cost figures are demo samples and have not been verified. Check official sources before deciding.",
  aboutTitle: "About StudyAtlas",
  aboutBody: "StudyAtlas helps students explore study destinations and compare daily life across cities. Version 1.0 searches registered data only; no external web search is connected yet. Cost figures are demo samples until verified sources are added.",
} as const;
export default en;
export type Dict = Record<keyof typeof en, string>;
