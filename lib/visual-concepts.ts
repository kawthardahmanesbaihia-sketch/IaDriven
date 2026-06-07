/**
 * Visual Concept Groups — reusable semantic signal definitions.
 *
 * Each group names a visually recognisable phenomenon and lists:
 *   phrases  – CLIP-optimised visual labels to look for in top-N results
 *   dests    – destination IDs that are compatible with this phenomenon
 *   excludes – destination IDs that are INCOMPATIBLE (used for elimination)
 *
 * The Geographic Reasoning Engine imports these groups to drive
 * environment-level boosts and eliminations without duplicating
 * keyword lists across every rule.
 */

export interface VisualConceptGroup {
  phrases:  string[]   // keywords / phrases to match against CLIP label text
  dests:    string[]   // destinations to boost when matched
  excludes: string[]   // destinations to heavily reduce when matched
}

export const VISUAL_CONCEPT_GROUPS: Record<string, VisualConceptGroup> = {

  arctic_polar: {
    phrases: ["arctic", "tundra", "permafrost", "polar", "ice sheet", "polar bear", "snowmobile", "midnight sun arctic", "husky sled"],
    dests:   ["iceland", "norway", "finland", "sweden", "canada", "alaska", "greenland", "antarctica", "mongolia"],
    excludes:["maldives", "seychelles", "bali", "thailand", "kenya", "mauritius", "dominicanrepublic", "jamaica", "bahamas", "borabora", "fiji", "hawaii"],
  },

  northern_lights: {
    phrases: ["aurora", "northern lights", "borealis", "aurora borealis"],
    dests:   ["iceland", "norway", "finland", "sweden", "canada", "alaska", "greenland"],
    excludes:["maldives", "seychelles", "bali", "thailand", "morocco", "kenya", "brazil", "india", "vietnam", "greece", "italy", "spain", "france"],
  },

  fjord_coastal_cliff: {
    phrases: ["fjord", "fjord reflection", "coastal cliff fjord"],
    dests:   ["norway", "iceland", "newzealand", "chile", "greenland", "scotland"],
    excludes:["maldives", "morocco", "kenya", "thailand"],
  },

  alpine_snow: {
    phrases: ["ski resort", "ski slope", "ski mountain", "alpine village", "snow peaks alps", "powder snow ski", "alpine chalet snow", "mountain cable car"],
    dests:   ["switzerland", "austria", "france", "norway", "canada", "chile", "newzealand", "bhutan", "nepal", "slovakia", "slovenia", "germany"],
    excludes:["maldives", "seychelles", "thailand", "kenya", "dubai"],
  },

  mediterranean_coast: {
    phrases: ["mediterranean", "blue dome white church", "turquoise mediterranean sea", "mediterranean harbour", "mediterranean cliff village"],
    dests:   ["greece", "italy", "croatia", "spain", "turkey", "france", "portugal", "lebanon", "morocco", "tunisia"],
    excludes:["iceland", "finland", "norway", "sweden", "mongolia", "kenya"],
  },

  safari_savanna: {
    phrases: ["safari", "savanna", "savannah", "wildebeest", "maasai", "serengeti", "ngorongoro", "okavango", "big five", "game drive", "lion pride", "giraffe acacia", "zebra herd", "hippo river africa", "elephant herd africa"],
    dests:   ["kenya", "tanzania", "southafrica", "botswana", "namibia", "zimbabwe", "zambia", "rwanda", "ethiopia"],
    excludes:["maldives", "seychelles", "france", "italy", "japan", "iceland", "finland", "norway", "switzerland", "bali", "vietnam", "malaysia"],
  },

  tropical_beach: {
    phrases: ["overwater bungalow", "coral reef snorkel", "turquoise lagoon palm", "manta ray tropical", "coconut palm white sand", "crystal lagoon island", "pristine tropical beach"],
    dests:   ["maldives", "seychelles", "bali", "thailand", "malaysia", "philippines", "fiji", "borabora", "bahamas", "dominicanrepublic", "hawaii", "jamaica", "mauritius", "srilanka"],
    excludes:["iceland", "finland", "norway", "sweden", "switzerland", "canada", "mongolia", "greenland"],
  },

  desert_sand: {
    phrases: ["sand dune vast desert", "sahara dune camel sunset", "desert oasis palm", "red sand dune desert arid"],
    dests:   ["morocco", "egypt", "namibia", "mongolia", "chile", "jordan", "saudiarabia", "oman", "qatar", "algeria", "tunisia", "uzbekistan", "india"],
    excludes:["iceland", "norway", "finland", "newzealand", "maldives", "seychelles"],
  },

  jungle_rainforest: {
    phrases: ["tropical jungle canopy", "dense rainforest green", "jungle waterfall lush", "amazon river jungle", "cloud forest canopy"],
    dests:   ["brazil", "colombia", "ecuador", "peru", "costarica", "panama", "bolivia", "laos", "cambodia", "vietnam", "malaysia", "thailand", "bali", "madagascar", "philippines", "srilanka"],
    excludes:["iceland", "norway", "mongolia", "egypt", "jordan", "desert"],
  },

  buddhist_culture: {
    phrases: ["buddhist temple gold spire", "buddhist monk orange robe", "prayer flag mountain buddhist", "incense buddhist ornate gold", "stupa buddhist white dome"],
    dests:   ["japan", "thailand", "cambodia", "laos", "bhutan", "srilanka", "china", "vietnam", "mongolia", "myanmar"],
    excludes:["maldives", "seychelles", "norway", "iceland"],
  },

  islamic_architecture: {
    phrases: ["mosque minaret dome", "islamic mosaic blue tile", "ornate islamic arch", "muezzin call islamic"],
    dests:   ["morocco", "egypt", "jordan", "dubai", "turkey", "saudiarabia", "oman", "qatar", "lebanon", "uzbekistan", "malaysia", "india", "tunisia", "algeria"],
    excludes:["iceland", "norway", "japan", "finland", "mongolia"],
  },

  medieval_old_town: {
    phrases: ["medieval cobblestone old town", "gothic spire castle europe", "european old town fairy tale", "medieval town square cobblestone"],
    dests:   ["czechrepublic", "austria", "germany", "france", "belgium", "netherlands", "poland", "hungary", "croatia", "ireland", "scotland", "unitedkingdom", "romania", "slovakia", "bulgaria", "estonia", "latvia", "lithuania", "slovenia", "switzerland", "portugal", "spain"],
    excludes:["maldives", "kenya", "dubai", "bali", "thailand"],
  },

  futuristic_megacity: {
    phrases: ["futuristic glass skyscraper night", "modern glass tower skyline", "cyberpunk neon city", "hypermodern city tower"],
    dests:   ["japan", "southkorea", "singapore", "dubai", "hongkong", "china", "unitedstates", "malaysia"],
    excludes:["iceland", "norway", "morocco", "kenya", "mongolia", "bhutan"],
  },

  neon_street: {
    phrases: ["neon sign street asian city night", "neon light cyberpunk electric night", "neon street market night"],
    dests:   ["japan", "southkorea", "hongkong", "china", "singapore", "vietnam"],
    excludes:["iceland", "norway", "mongolia", "egypt", "kenya"],
  },

  volcanic_geothermal: {
    phrases: ["active volcano eruption lava", "volcanic crater lake geothermal", "lava flow black volcanic", "geothermal steam vent"],
    dests:   ["iceland", "hawaii", "indonesia", "bali", "philippines", "costarica", "ethiopia", "ecuador", "nicaragua"],
    excludes:["maldives", "seychelles", "netherlands", "egypt"],
  },

  himalayan_high: {
    phrases: ["himalayan mountain snow peak", "prayer flag mountain pass himalaya", "high altitude himalaya monastery"],
    dests:   ["nepal", "bhutan", "india", "china"],
    excludes:["maldives", "seychelles", "kenya", "bahamas", "netherlands"],
  },

  vineyard_wine: {
    phrases: ["vineyard rolling hill wine country", "grapevine row vineyard harvest", "wine estate cellar barrel"],
    dests:   ["france", "italy", "spain", "portugal", "argentina", "chile", "georgia", "australia", "newzealand", "southafrica", "germany"],
    excludes:["arctic", "desert", "iceland", "mongolia"],
  },

  night_market: {
    phrases: ["night market lantern food asia", "asian night market neon street food", "street food market stall asia night"],
    dests:   ["thailand", "vietnam", "cambodia", "laos", "malaysia", "china", "southkorea", "singapore", "taiwan"],
    excludes:["iceland", "norway", "mongolia"],
  },

  ancient_ruins: {
    phrases: ["ancient ruins stone column civilization", "ancient archaeological site carved", "ancient temple civilization ruins stones"],
    dests:   ["greece", "italy", "egypt", "jordan", "mexico", "peru", "cambodia", "turkey", "india", "lebanon", "guatemala", "bolivia"],
    excludes:["iceland", "maldives", "singapore"],
  },

  canal_city: {
    phrases: ["canal waterway boat european bridge", "canal city water reflections old", "venetian canal gondola"],
    dests:   ["netherlands", "belgium", "sweden", "finland", "czechrepublic"],
    excludes:["desert", "sahara", "mongolia"],
  },

  patagonia: {
    phrases: ["patagonia wilderness glacier wind", "granite peak patagonia glacial lake", "torres del paine patagonia"],
    dests:   ["chile", "argentina"],
    excludes:["maldives", "thailand", "morocco", "egypt"],
  },

  cherry_blossom: {
    phrases: ["cherry blossom pink tree spring", "sakura cherry blossom path pink"],
    dests:   ["japan", "southkorea", "netherlands"],
    excludes:["sahara", "arctic", "mongolia"],
  },

  island_paradise: {
    phrases: ["tropical island coral atoll aerial turquoise", "paradise island coconut palm aerial", "remote tropical island turquoise water"],
    dests:   ["maldives", "fiji", "borabora", "seychelles", "mauritius", "bahamas", "hawaii", "philippines", "indonesia", "bali"],
    excludes:["iceland", "norway", "mongolia", "nepal"],
  },

  silk_road: {
    phrases: ["blue tile mosaic dome silk road", "colourful mosaic geometric ancient mosque", "caravanserai silk road ancient"],
    dests:   ["uzbekistan", "turkey", "morocco", "iran", "jordan"],
    excludes:["iceland", "norway", "canada", "australia"],
  },

  nordic_coastal: {
    phrases: ["scandinavian wooden house colorful coastal", "nordic fishing village colourful red", "coastal fishing village nordic"],
    dests:   ["norway", "denmark", "sweden", "finland", "greenland"],
    excludes:["thailand", "maldives", "kenya", "brazil"],
  },

  rice_terrace: {
    phrases: ["terraced rice paddy field hillside", "rice terrace green terraced mountain"],
    dests:   ["vietnam", "philippines", "bali", "china", "srilanka", "cambodia", "laos", "india"],
    excludes:["iceland", "desert", "arctic"],
  },

  mountain_village: {
    phrases: ["traditional mountain village stone house", "remote mountain village alpine traditional"],
    dests:   ["switzerland", "austria", "greece", "morocco", "bhutan", "nepal", "georgia", "armenia", "peru", "bolivia", "ethiopia"],
    excludes:["maldives", "seychelles", "singapore"],
  },

  gorilla_primate: {
    phrases: ["mountain gorilla trekking", "gorilla silverback forest"],
    dests:   ["rwanda", "uganda"],
    excludes:["iceland", "norway", "dubai", "netherlands"],
  },

  caribbean: {
    phrases: ["turquoise caribbean beach palm resort", "caribbean island tropical clear turquoise", "caribbean beach reggae music resort"],
    dests:   ["jamaica", "bahamas", "dominicanrepublic", "cuba", "costarica"],
    excludes:["iceland", "norway", "switzerland", "mongolia"],
  },

  art_nouveau_baroque: {
    phrases: ["art nouveau baroque ornate facade european", "baroque ornate building grand facade"],
    dests:   ["austria", "hungary", "czechrepublic", "belgium", "france", "germany", "spain", "slovakia"],
    excludes:["mongolia", "desert", "arctic", "maldives"],
  },

}

/** Flat lookup: keyword phrase → concept group name */
export const PHRASE_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(VISUAL_CONCEPT_GROUPS).flatMap(([name, g]) =>
    g.phrases.map(p => [p, name])
  )
)
