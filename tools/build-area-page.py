"""
Render a service-area page from tools/area-template.html.

The template was lifted from the hand-written Culver City page, so every new city
inherits the same layout, schema blocks, form wiring and footer. Only the local
content differs. Run from the repo root:

    python tools/build-area-page.py            # render every city in CITIES
    python tools/build-area-page.py santa-monica

Every claim in a city's copy must be verified against the city before it is added
here. Do not assert ordinance numbers, adoption dates or fee amounts.
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, 'tools', 'area-template.html')

# Long dashes are banned in everything this repo ships. Referenced by codepoint so
# that this guard does not itself contain the characters it rejects.
BANNED_DASHES = (chr(8212), chr(8211))


def faq_schema(pairs):
    items = []
    for q, a in pairs:
        items.append(
            '    {\n'
            '      "@type": "Question",\n'
            '      "name": %s,\n'
            '      "acceptedAnswer": {\n'
            '        "@type": "Answer",\n'
            '        "text": %s\n'
            '      }\n'
            '    }' % (json.dumps(q), json.dumps(a))
        )
    return ',\n'.join(items)


def faq_visible(pairs):
    out = []
    for q, a in pairs:
        out.append(
            '      <div class="area-faq-item">\n'
            '        <h3 class="area-faq-q">%s</h3>\n'
            '        <p class="area-faq-a">%s</p>\n'
            '      </div>' % (q, a)
        )
    return '\n'.join(out)


CITY_NAMES = {
    'culver-city': 'Culver City', 'mar-vista': 'Mar Vista', 'west-la': 'West LA',
    'playa-vista': 'Playa Vista', 'mid-city': 'Mid City', 'marina-del-rey': 'Marina del Rey',
    'beverly-hills': 'Beverly Hills', 'pacific-palisades': 'Pacific Palisades',
    'westchester': 'Westchester', 'el-segundo': 'El Segundo', 'malibu': 'Malibu',
    'inglewood': 'Inglewood', 'bel-air': 'Bel Air', 'hawthorne': 'Hawthorne',
    'santa-monica': 'Santa Monica', 'venice': 'Venice',
    'palms': 'Palms', 'playa-del-rey': 'Playa del Rey', 'del-rey': 'Del Rey',
    'ladera-heights': 'Ladera Heights', 'westwood': 'Westwood', 'brentwood': 'Brentwood',
    'cheviot-hills': 'Cheviot Hills', 'sawtelle': 'Sawtelle', 'baldwin-hills': 'Baldwin Hills',
    'manhattan-beach': 'Manhattan Beach',
}


def nearby(slugs):
    return '\n'.join(
        '        <a href="/areas/%s/">%s</a>' % (s, CITY_NAMES[s]) for s in slugs
    )


def bullets(items):
    return '\n'.join(
        '        <li><strong>%s</strong> %s</li>' % (b, rest) for b, rest in items
    )


CITIES = {}

# ---------------------------------------------------------------- Santa Monica
CITIES['santa-monica'] = dict(
    CITY='Santa Monica',
    TITLE='Remodeling Contractor in Santa Monica, CA | New Cali',
    META_DESC='Santa Monica remodeling contractor. Kitchens, baths, ADUs and whole-home renovations permitted through Santa Monica Building & Safety, not LADBS. Lic #1008892.',
    OG_DESC='Santa Monica remodeling contractor. Kitchens, bathrooms, ADUs and whole-home renovations permitted through Santa Monica Building and Safety. Lic #1008892.',
    TW_DESC='Santa Monica remodeling contractor. Permitted through Santa Monica Building and Safety. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in neighbouring Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Santa Monica homeowners, permitted through the Santa Monica Building and Safety Division.',
    WIKI='https://en.wikipedia.org/wiki/Santa_Monica,_California',
    SVC_NAME='Home Remodeling in Santa Monica',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Santa Monica, California. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Santa Monica, CA',
    HERO_SUB='Santa Monica writes its own building rules, and they are stricter than the ones next door. Knowing that before you design is the difference between one plan check and three.',
    EYEBROW_CITY='Santa Monica, California',
    INTRO_P1='Santa Monica is an eight-square-mile city with an unusually wide range of housing packed into it. There are 1920s Spanish and Craftsman bungalows through Ocean Park and the Pico district, mid-century single-family homes across Sunset Park, larger traditionals north of Montana, and a dense band of apartments and condos through Wilshire-Montana and downtown. The build years run from the 1910s to last year, and what is behind the walls changes completely across that range.',
    INTRO_P2='What makes Santa Monica different is not the houses, it is the city. Santa Monica is its own municipality with its own Building and Safety Division inside its Community Development Department, and its own local rules layered on top of state law. It is one of the more demanding jurisdictions on the Westside, and a contractor who mostly works City of LA jobs will price a Santa Monica project as though it were a Mar Vista project and then discover the difference at plan check. We price the Santa Monica version.',
    HOODS='Ocean Park, Sunset Park, North of Montana, Wilshire-Montana, the Pico district, Mid-City Santa Monica, and the condo corridors through downtown.',
    SVC1='Bungalow kitchens opened up without losing the period character, and condo kitchens reworked inside a fixed footprint where plumbing cannot move far.',
    SVC2='Guest baths and primary suites in 1920s bungalows and in newer condos alike, with the waterproofing assembly detailed to code and documented.',
    SVC3="ADUs and garage conversions permitted under Santa Monica's own rules, which are not the City of LA's. We check your parcel before you commission any design.",
    SVC4='Whole-house renovations of Ocean Park and Sunset Park homes: seismic and foundation work, full systems replacement, structure and finishes on one contract.',
    SVC5_TITLE='Rent-Controlled &amp; Multi-Family Work',
    SVC5="Santa Monica has one of the strongest rent-control regimes in California, and it reaches into what you may do to an occupied or previously occupied unit. Before we scope multi-family or duplex work we confirm the unit's status with the city, because the wrong assumption here is not a cost overrun, it is a legal problem. If your project touches a controlled unit we will tell you plainly and route you to counsel.",
    PERMIT_LEAD="Santa Monica is not part of the City of Los Angeles for permitting purposes. Your remodel is reviewed, permitted and inspected by Santa Monica's own Building and Safety Division within the Community Development Department, under the Santa Monica Municipal Code. Expect a more thorough review than you would get one city over, and budget the schedule for it rather than being surprised by it.",
    PERMIT_BULLETS=bullets([
        ('City of Santa Monica permits and inspections,', 'not LADBS, for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Santa Monica adds its own ADU requirements', 'on top of California state ADU law, so what is allowed here does not match what is allowed in the City of LA. We verify your specific parcel against the current rules before design money is spent.'),
        ('Green building and energy requirements are enforced tightly here,', 'so insulation, glazing, electrification and Title 24 compliance need to be in the scope from the start rather than value-engineered in at the end.'),
        ('Rent-controlled and previously tenanted units carry real restrictions.', "We confirm a unit's status with the city before scoping, and we will tell you when a project needs a lawyer rather than a contractor."),
        ('Pre-1978 homes require lead-safe work practices,', 'which covers most of Ocean Park and the older Pico-district blocks. We test rather than assume before demolition or sanding begins.'),
    ]),
    N1_H='The plan check is the schedule',
    N1_P='In some cities the build is the long pole. In Santa Monica the review often is. We build the realistic review time into the schedule we hand you, and we submit a complete package the first time, because a resubmittal here costs weeks rather than days. If someone quotes you a Santa Monica start date that assumes a City of LA timeline, that date is fiction.',
    N2_H='Parking, staging and neighbours are a real constraint',
    N2_P='Much of Ocean Park and the Pico district is permit parking on narrow streets with no alley. Where the crew parks, where the dumpster sits and when material lands all have to be arranged before day one, and the rules are enforced. This is not a detail we mention afterwards as an excuse; it goes into the plan up front.',
    N3_H='Older bungalows are worth restoring, not erasing',
    N3_P='The character details in a 1920s Santa Monica bungalow, the original casings, the coved plaster, the front elevation, are usually worth more than what would replace them. We separate what genuinely has to be rebuilt for code and structure from what is simply old, and we do not talk you into demolishing the part of the house you actually bought it for.',
    CTA_H='Building in Santa Monica? Let us price the real version.',
    NEARBY=nearby(['culver-city', 'venice', 'mar-vista', 'west-la']),
    FAQ=[
        ('Does a Santa Monica remodel get permitted through LADBS?',
         'No. Santa Monica is its own incorporated city and your project is reviewed, permitted and inspected by the Santa Monica Building and Safety Division within the Community Development Department, under the Santa Monica Municipal Code. LADBS has no role. Contractors who work mostly in the City of LA routinely underestimate this, because the submittal package, the review depth and the inspection scheduling are all different. We pull Santa Monica permits in our own name under License #1008892.'),
        ('Are Santa Monica ADU rules the same as Los Angeles ADU rules?',
         "No. California state law sets a floor that every city has to meet, but Santa Monica layers its own requirements on top, so setbacks, height, coverage and design standards are judged against Santa Monica's rules rather than the City of LA's. The practical answer for your property depends on the parcel, so we check it against the current rules before you pay for any design work."),
        ('How much does a kitchen or bathroom remodel cost in Santa Monica?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen typically lands between $40,000 and $120,000, depending on layout changes, cabinetry level and whether plumbing or electrical relocates. Two things push Santa Monica projects up relative to neighbouring cities: the condition of original systems in pre-war bungalows, and the energy and green-building work the city expects to see in the permit set. Both are identified during the estimate and written into the scope, not discovered later.'),
        ('My Santa Monica property is a duplex with a long-term tenant. Can you remodel it?',
         "Sometimes, and sometimes the honest answer is not without legal advice first. Santa Monica has strong rent-control and tenant-protection rules that reach into what can be done to an occupied or previously occupied unit. We confirm the unit's status with the city before scoping the work, and if the project touches a controlled unit we will say so plainly and tell you to speak to a lawyer before you commit. We would rather lose the job than put you in that position."),
        ('How long does a Santa Monica permit take?',
         'Longer than most Westside cities, and it varies with the scope and how complete the submittal is. We do not quote you a number we cannot stand behind, but we do two things about it: we build the realistic review window into the schedule you sign, and we submit a complete package the first time. Most of the delay homeowners experience here comes from resubmittals, which is the part a contractor actually controls.'),
    ],
)

# ---------------------------------------------------------------------- Venice
CITIES['venice'] = dict(
    CITY='Venice',
    TITLE='Remodeling Contractor in Venice, CA | New Cali Construction',
    META_DESC='Venice remodeling contractor. Kitchens, baths, ADUs and whole-home work inside the coastal zone, where a permit needs coastal clearance first. Lic #1008892.',
    OG_DESC='Venice remodeling contractor. Kitchens, bathrooms, ADUs and whole-home renovations inside the Venice Coastal Zone. Lic #1008892.',
    TW_DESC='Venice remodeling contractor working inside the Venice Coastal Zone. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in neighbouring Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Venice homeowners, including projects inside the Venice Coastal Zone that require coastal clearance before a building permit is issued.',
    WIKI='https://en.wikipedia.org/wiki/Venice,_Los_Angeles',
    SVC_NAME='Home Remodeling in Venice',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Venice, California, including coastal-zone projects. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Venice, CA',
    HERO_SUB='Almost every Venice house sits in the coastal zone, and that single fact changes what you can build, how long it takes, and what your remodel is even called.',
    EYEBROW_CITY='Venice, California',
    INTRO_P1='Venice is walk streets and canals, 1920s beach bungalows sitting next to steel-and-glass rebuilds, narrow lots, and some of the tightest site access on the Westside. A twenty-five foot wide lot with no alley, a neighbour three feet away and a walk street instead of a road is a completely different build from a Mar Vista tract house, and it needs to be planned that way from the first drawing rather than solved on site.',
    INTRO_P2='The bigger difference is regulatory. Venice is part of the City of Los Angeles, so LADBS issues the building permit, but almost all of Venice also sits inside the Venice Coastal Zone. That means a coastal clearance has to be resolved through City Planning before LADBS will issue anything, and depending on the project the California Coastal Commission can be involved as well. It is a second approval track running ahead of the first, and it is where Venice projects actually stall.',
    HOODS='The walk streets, the Venice canals, Oakwood, Milwood, the Oxford Triangle, Marina Peninsula, and the blocks either side of Abbot Kinney.',
    SVC1='Small beach-bungalow kitchens reworked for real storage and light, and open-plan kitchens in rebuilt Venice homes where the kitchen is the main room.',
    SVC2='Guest baths and primary suites on tight footprints, with the waterproofing assembly detailed properly for a house that lives in salt air.',
    SVC3='Garage conversions and detached ADUs in Venice, planned around coastal clearance, parking replacement and lot coverage before design money is spent.',
    SVC4='Whole-house renovations of Venice bungalows and canal-adjacent homes: foundation and structural work, full systems, and finishes chosen for coastal conditions.',
    SVC5_TITLE='Coastal Zone Clearance',
    SVC5='This is the piece that sinks Venice schedules. Before LADBS issues a demolition, grading or building permit for a Venice coastal project, the project has to clear the Venice Coastal Zone Specific Plan track through City Planning, and larger projects can go to the California Coastal Commission on top of that. We identify which track your project is on at the estimate stage and put the honest timeline in writing, rather than quoting you a start date that assumes it does not exist.',
    PERMIT_LEAD='Venice is City of Los Angeles, so LADBS pulls the building permit. But nearly all of Venice sits inside the Venice Coastal Zone, and there a building permit cannot issue until the project has cleared the coastal track through City Planning under the Venice Coastal Zone Specific Plan. Two approvals, in sequence, and the second one is the one that decides your schedule.',
    PERMIT_BULLETS=bullets([
        ('LADBS issues the building permit,', 'but only after the coastal clearance is resolved. Permits are pulled in our name under License #1008892, never in yours.'),
        ('The Venice Coastal Zone Specific Plan sits in front of LADBS.', 'A Venice coastal development project needs its Specific Plan clearance through City Planning before a demolition, grading or building permit will issue. We establish which track your project falls on before you commit to a design.'),
        ('In the coastal zone, how much of the exterior you touch changes what your project is.', 'A project that modifies no more than half the exterior walls is treated as a remodel; go past that and it can be reviewed as new development, with a different and slower approval path. This single line moves Venice budgets and schedules more than any finish selection, so we design to it deliberately.'),
        ('The California Coastal Commission can be a party,', 'depending on the project and its location. Where that applies we say so at the estimate rather than after you have paid for drawings.'),
        ('Site access is a design input, not a logistics detail.', 'Walk streets, canal frontage, twenty-five foot lots and no alley decide how material lands, where the crew parks and what equipment can physically reach the work. We plan it before day one.'),
    ]),
    N1_H='The 50 percent line decides your project',
    N1_P='In the coastal zone a remodel is defined by how much of the exterior wall area you modify, and staying at or under half of it keeps you on the remodel track. Push past it and the same house can be reviewed as new development, on a slower path with more scrutiny. Plenty of Venice homeowners cross that line by accident, chasing one more window. We put the line on the drawing and design to it on purpose.',
    N2_H='Salt air is a material specification',
    N2_P='Three blocks from the water, ordinary exterior fasteners, flashing and hardware do not last. We specify for the environment the house actually sits in, which costs a little more at purchase and considerably less over the ten years afterwards. This is one of the few places where the cheaper product is straightforwardly the wrong product.',
    N3_H='A twenty-five foot lot is built differently',
    N3_P='On a narrow Venice lot with a neighbour a few feet away, shoring, underpinning, protecting the adjacent structure and simply getting equipment to the rear of the site are real line items, not overhead. They belong in the written scope at the start. A quote that does not mention them is not a cheaper project, it is an incomplete one.',
    CTA_H='Building in Venice? Let us map the coastal track first.',
    NEARBY=nearby(['culver-city', 'santa-monica', 'mar-vista', 'marina-del-rey']),
    FAQ=[
        ('Do I need a coastal permit to remodel my Venice house?',
         'Most likely yes, in the sense that your project has to clear the coastal track before LADBS will issue a building permit. Nearly all of Venice sits inside the Venice Coastal Zone, and a Venice coastal development project has to be cleared through City Planning under the Venice Coastal Zone Specific Plan before a demolition, grading or building permit is issued. Some projects qualify for an exemption within that process rather than a full permit. Which one applies to you depends on the property and the scope, and we establish it at the estimate stage rather than after you have paid an architect.'),
        ('What counts as a remodel versus new construction in the Venice coastal zone?',
         'It turns on how much of the exterior you modify. A project that changes no more than half of the exterior walls is treated as a remodel; beyond that it can be reviewed as new development, which is a slower and more heavily scrutinised path. This matters enormously, because a design that quietly drifts past that threshold changes your approval route, your timeline and your budget. We show you where the line falls on your drawings before you commit to them.'),
        ('Does the California Coastal Commission get involved in my project?',
         'It can, depending on the project and where it sits. Not every Venice remodel reaches the Commission, and we will not tell you it does in order to pad a timeline. What we will do is identify at the estimate which approvals your specific project needs and put the realistic sequence in writing, so you are planning against something honest.'),
        ('How much does a remodel cost in Venice?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen typically lands between $40,000 and $120,000, but Venice carries two cost drivers that inland projects do not. The first is approvals: coastal clearance takes time, and time on a construction project is money. The second is the site itself, since narrow lots, walk streets and no alley access make shoring, protection and material handling into real line items. Both go into the written scope before you sign.'),
        ('Can I build an ADU in Venice?',
         'Often yes, but the coastal zone adds a layer that inland ADU projects do not have, and parking, lot coverage and the coastal clearance all interact. Garage conversions in particular need care, because the garage may be doing work in the parking calculation that you cannot simply remove. We check your parcel against both the ADU rules and the coastal track before you spend anything on design, because in Venice the honest answer is genuinely property-specific.'),
    ],
)


LA_CITY = {'@type': 'City', 'name': 'Los Angeles', 'sameAs': 'https://en.wikipedia.org/wiki/Los_Angeles'}
LA_COUNTY = {'@type': 'AdministrativeArea', 'name': 'Los Angeles County',
             'sameAs': 'https://en.wikipedia.org/wiki/Los_Angeles_County,_California'}


# ===================================================================== 2026-11
# Ten neighbourhood pages added 2026-11-17. Facts are limited to what is public
# record (Wikipedia, Mapping L.A., the permit authority for each parcel type).
# No project counts, client names or reviews: none of these areas has a
# verified New Cali job list behind it, so the copy describes the housing and
# the permit path, never "our work here".

# ----------------------------------------------------------------------- Palms
CITIES['palms'] = dict(
    LOCAL_WORK=False,
    CITY='Palms',
    ZIPS=['90034'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Palms, CA | New Cali Construction',
    META_DESC='Palms remodeling contractor for ZIP 90034. Kitchens, baths, ADUs and rental-unit renovations in Westside Village and beyond, permitted through LADBS. Lic #1008892.',
    OG_DESC='Palms remodeling contractor, ZIP 90034. Houses in Westside Village and renovations in rental buildings, permitted through LADBS. Lic #1008892.',
    TW_DESC='Palms remodeling contractor, ZIP 90034, permitted through LADBS. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in neighbouring Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and renovating houses, duplexes and small rental buildings in Palms, Los Angeles (ZIP 90034), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Palms,_Los_Angeles',
    SVC_NAME='Home Remodeling in Palms',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners and small-building owners in Palms, Los Angeles, ZIP 90034. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Palms, Los Angeles',
    HERO_SUB='Palms is mostly apartments, with a pocket of single-family homes in Westside Village. A remodel here is either an owner-occupied house or a rental building where tenant rules come first.',
    EYEBROW_CITY='Palms, Los Angeles 90034',
    INTRO_P1='Palms is the oldest neighborhood annexed to the City of Los Angeles, and very little of its original housing is left. Until the early 1960s most of it was Craftsman and Spanish single-family homes and small duplexes. The city then rezoned most of the district for multifamily, and the bungalows along Motor Avenue, Overland Avenue, Palms Boulevard and National Boulevard were largely replaced by two- and three-story apartment buildings. A few original houses survive, often with a second unit built where the backyard used to be.',
    INTRO_P2='The main group of owner-occupied houses is Westside Village, the grid bounded by Overland Avenue, Sepulveda Boulevard, National Boulevard and Charnock Road, built just before the Second World War and expanded or rebuilt house by house ever since. So a Palms project is usually one of two things: a small house that has been added onto two or three times, or a rental building with tenants in it. Both are City of Los Angeles work through LADBS, and the second also answers to the Los Angeles Housing Department. We scope for whichever one you own.',
    HOODS='Westside Village, the Motor Avenue and Overland Avenue corridors, the blocks around the Palms Expo Line station, and the streets bordering Cheviot Hills, Mar Vista and Culver City. ZIP code 90034.',
    SVC1='Small galley kitchens in pre-war houses opened up and rewired, and apartment kitchens replaced unit by unit in occupied buildings, with the schedule planned around tenants.',
    SVC2='Bathrooms in Westside Village houses that were added onto over decades, and unit bathrooms in rental buildings where the waterproofing has to outlast frequent turnover.',
    SVC3='Backyard ADUs and garage conversions on single-family and duplex lots. Many Palms lots already have a second structure, so we check what is permitted on record before you design.',
    SVC4='Whole-house renovations of Westside Village homes, where earlier additions, mixed-era wiring and old supply lines all have to be brought to one standard.',
    SVC5_TITLE='Rental and Small Multi-Family Work',
    SVC5="Most Palms housing is rental, and much of it sits in older buildings covered by the City of Los Angeles Rent Stabilization Ordinance. Renovating an occupied or rent-stabilized unit can bring tenant-protection requirements from the Los Angeles Housing Department. We confirm a building's status before we scope the work, and we tell you plainly when a project needs a tenant-law attorney before it needs a contractor.",
    PERMIT_LEAD='Palms is a neighborhood of the City of Los Angeles, so the building permit comes from LADBS, the Los Angeles Department of Building and Safety. For a house that is the whole story. For a rental building it is half of it: the Los Angeles Housing Department has its own rules for work on rent-stabilized units, and they set the order of operations.',
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Rent-stabilized units carry Housing Department rules.', "Older Palms apartment buildings are commonly covered by the Rent Stabilization Ordinance, and major work on an occupied unit can require a tenant habitability plan before construction starts. We check the building's status first."),
        ('Second units need a paper trail.', 'Many Palms lots have a back unit built decades ago. We compare what stands on the lot with what LADBS has on record before you design an addition or an ADU around it.'),
        ('Pre-1978 buildings require lead-safe work practices,', 'and that covers most of the housing here. We test rather than assume before demolition or sanding begins.'),
        ('Zoning and overlays are checked on ZIMAS,', "the City of LA's parcel map, before design starts, so a zoning surprise shows up at the estimate and not at plan check."),
    ]),
    N1_H='Most Palms houses have grown',
    N1_P='Very few Palms houses are the size they were built. Rooms were added at the back, porches were enclosed, garages were half converted. Some of that was permitted and some was not. Before we price a remodel we pull the permit history and compare it to what is standing, because unpermitted work that the new scope touches has to be legalized or rebuilt.',
    N2_H='Parking and access are tight',
    N2_P='Palms is one of the densest neighborhoods in Los Angeles, and street parking is contested from early morning. Dumpster placement, crew parking and deliveries are arranged before day one, and in an occupied building we schedule noisy work and water shutoffs with written notice to tenants.',
    N3_H='Old supply lines and small electrical service',
    N3_P='Pre-war houses and 1960s apartment buildings both tend to hide galvanized supply piping and electrical service sized for far fewer appliances. When the walls are open we price repiping and a panel upgrade as options in the written scope, so the cheaper moment to do them is not missed.',
    CTA_H='Remodeling in Palms? Tell us if it is a house or a building.',
    NEARBY=nearby(['cheviot-hills', 'mar-vista', 'culver-city', 'west-la']),
    FAQ=[
        ('Who issues building permits in Palms?',
         'The City of Los Angeles. Palms is a Los Angeles neighborhood, not a separate city, so plans go to LADBS, the Los Angeles Department of Building and Safety. Palms addresses use ZIP code 90034. If the property is a rental building, the Los Angeles Housing Department also has rules for work on rent-stabilized units. New Cali Construction pulls permits in its own name under License #1008892.'),
        ('Can I renovate a rent-stabilized unit in Palms?',
         "Usually yes, but the order of operations matters. Older Palms apartment buildings are commonly covered by the City of Los Angeles Rent Stabilization Ordinance, and major work on an occupied unit can require a tenant habitability plan through the Los Angeles Housing Department before construction begins. We confirm the building's status before scoping, and if the project affects tenants we tell you to speak with a tenant-law attorney first."),
        ('Can I add an ADU to my Palms lot?',
         'Often yes. California ADU law applies across the City of Los Angeles, and many Palms single-family and duplex lots can take a detached ADU or a garage conversion. The catch here is that many lots already have a back unit or an old addition, so we check what is permitted on record before you pay for design.'),
        ('How much does a remodel cost in Palms?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen typically lands between $40,000 and $120,000, depending on layout changes and finish level. In Palms the cost drivers are the age of the plumbing and electrical and, in rental buildings, scheduling around tenants. Both are written into the scope before you sign.'),
    ],
)

# --------------------------------------------------------------- Playa del Rey
CITIES['playa-del-rey'] = dict(
    LOCAL_WORK=False,
    CITY='Playa del Rey',
    ZIPS=['90293'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Playa del Rey, CA | New Cali',
    META_DESC='Playa del Rey remodeling contractor, ZIP 90293. Kitchens, baths and whole-home remodels on the bluffs and by the lagoon, in the coastal zone. Lic #1008892.',
    OG_DESC='Playa del Rey remodeling contractor, ZIP 90293. Bluff homes, lagoon cottages and beach condos, coastal zone and LADBS permits. Lic #1008892.',
    TW_DESC='Playa del Rey remodeling contractor, ZIP 90293, coastal zone and LADBS. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Playa del Rey homeowners (ZIP 90293), including coastal-zone projects that need coastal clearance through Los Angeles City Planning before LADBS issues a building permit.',
    WIKI='https://en.wikipedia.org/wiki/Playa_del_Rey,_Los_Angeles',
    SVC_NAME='Home Remodeling in Playa del Rey',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Playa del Rey, Los Angeles, ZIP 90293, including coastal-zone projects. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Playa del Rey, Los Angeles',
    HERO_SUB='Bluff-top houses, lagoon-side cottages and beach condos, much of it inside the coastal zone and all of it in salt air. Both facts belong in the plan before the first drawing.',
    EYEBROW_CITY='Playa del Rey, Los Angeles 90293',
    INTRO_P1='Playa del Rey sits between Ballona Creek and LAX, and its housing splits by elevation. Lower Playa del Rey, around Del Rey Lagoon and along Culver Boulevard, Pershing Drive and Vista del Mar, was built on former wetland and dune. It holds beach houses, condo buildings and the closely built 1956 apartments locals call the Jungle, on Rees, Sunridge and Surf Streets. The Del Rey Hills east of Pershing Drive were developed from 1928 onward, with single-family homes on the bluffs looking out over the Ballona Wetlands and the bay.',
    INTRO_P2='Playa del Rey is part of the City of Los Angeles, so LADBS issues the building permit, but much of the neighborhood lies inside the California coastal zone. That adds a coastal review step through City Planning ahead of the building permit for many projects. The south end sits right against LAX, and the whole neighborhood lives in salt air. A good Playa del Rey remodel is planned around all three.',
    HOODS='Lower Playa del Rey around Del Rey Lagoon, the Jungle, the Culver Boulevard and Pershing Drive corridors, the Del Rey Hills on the bluffs, and the condo buildings along Vista del Mar. ZIP code 90293.',
    SVC1='Beach-condo kitchens reworked inside fixed plumbing, and bluff-home kitchens opened toward the view, with hardware and appliances chosen for salt air.',
    SVC2='Bathrooms in beach cottages, condos and bluff houses, with waterproofing and ventilation detailed for a damp, salty marine layer.',
    SVC3='Garage conversions and detached ADUs where the lot and the coastal rules allow them. We check coastal zone status and lot constraints before design money is spent.',
    SVC4='Whole-house renovations of Del Rey Hills homes and lagoon-side houses: structure, systems, windows and exterior finishes specified for the coast.',
    SVC5_TITLE='Coastal Zone and Condo Work',
    SVC5="Many Playa del Rey projects need coastal clearance through Los Angeles City Planning before LADBS issues a permit, and condo projects need the association's approval as well. We identify both tracks at the estimate, prepare the HOA package, and put the honest sequence in writing rather than a start date that ignores them.",
    PERMIT_LEAD='Playa del Rey is a City of Los Angeles neighborhood, so LADBS issues the building permit. Much of it also sits inside the coastal zone, where a coastal development permit or an exemption is settled through City Planning first. Which one applies depends on the parcel and on how much of the house you change.',
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Coastal zone status is checked first.', 'We look the parcel up on ZIMAS, the City of LA parcel map, before design starts. If it sits inside the coastal zone, the coastal step is scheduled ahead of plan check.'),
        ('Lower Playa del Rey is former wetland.', 'Low-lying lots near the lagoon and Ballona Creek can carry flood-zone and soils questions that bluff lots do not. We check the designations before structural work is priced.'),
        ('Condo work needs association approval', 'on top of the city permit: plans, insurance naming the HOA, approved work hours and elevator or stair protection.'),
        ('Pre-1978 homes require lead-safe work practices,', 'which covers most of the neighborhood. We test before demolition or sanding begins.'),
    ]),
    N1_H='Salt air shortens the life of the wrong product',
    N1_P='Within a few blocks of the beach, standard exterior fasteners, flashing, hinges and light fixtures corrode early. We specify stainless or coated hardware and marine-rated exterior products in the written scope. They cost more at purchase and far less over the next decade.',
    N2_H='LAX is a neighbor',
    N2_P='The south end of Playa del Rey sits next to LAX, close enough that the airport bought out and cleared the Surfridge neighborhood just to the south. If earlier owners upgraded windows or insulation against noise, we identify them before demolition so a remodel does not quietly undo them, and we price acoustic glazing where it matters.',
    N3_H='Bluff lots and lagoon lots are different builds',
    N3_P='A house on the Del Rey Hills bluff and a cottage near the lagoon a few hundred yards away sit on very different ground. Slope, drainage, soils and access change the foundation and shoring scope. We price the ground your house actually stands on, which is why we look before we quote.',
    CTA_H='Building in Playa del Rey? Let us check the coastal track first.',
    NEARBY=nearby(['westchester', 'playa-vista', 'marina-del-rey', 'del-rey']),
    FAQ=[
        ('Do I need a coastal permit to remodel in Playa del Rey?',
         'Possibly. Much of Playa del Rey, ZIP 90293, lies inside the California coastal zone, and there many projects must be cleared through Los Angeles City Planning, as a coastal development permit or an exemption, before LADBS issues the building permit. Interior work usually moves faster than exterior changes or additions. We check your parcel and scope at the estimate stage and tell you which track applies.'),
        ('Who issues building permits in Playa del Rey?',
         'The City of Los Angeles, through LADBS. Playa del Rey is a Los Angeles neighborhood, not a separate city like neighboring El Segundo. New Cali Construction pulls the permits and schedules the inspections under License #1008892.'),
        ('What does salt air mean for my remodel?',
         'It changes the specification, mainly for anything exterior or exposed: fasteners, flashing, hinges, railings, light fixtures and window hardware. Standard products corrode early within a few blocks of the ocean. We write coastal-grade materials into the scope so the price you sign covers the version that lasts.'),
        ('How much does a remodel cost in Playa del Rey?',
         'Planning ranges match the rest of the Westside: roughly $15,000 to $35,000 for a guest bathroom and $40,000 to $120,000 for a full kitchen. What moves a Playa del Rey project is coastal review time, coastal-grade materials and, on bluff lots, foundation and access work. Each is priced in the written scope before you sign.'),
    ],
)

# --------------------------------------------------------------------- Del Rey
CITIES['del-rey'] = dict(
    LOCAL_WORK=False,
    CITY='Del Rey',
    ZIPS=['90066', '90230'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Del Rey, CA | New Cali Construction',
    META_DESC='Del Rey remodeling contractor for ZIP 90066 and the Culver City-addressed 90230 blocks. Kitchens, baths and ADUs on post-war lots, LADBS permits. Lic #1008892.',
    OG_DESC='Del Rey remodeling contractor, ZIP 90066 and 90230. Post-war homes, garage ADUs and LADBS permits, even where the address says Culver City. Lic #1008892.',
    TW_DESC='Del Rey remodeling contractor, ZIP 90066 and 90230, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in neighbouring Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for homeowners in Del Rey, Los Angeles (ZIP codes 90066 and 90230), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Del_Rey,_Los_Angeles',
    SVC_NAME='Home Remodeling in Del Rey',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Del Rey, Los Angeles, ZIP codes 90066 and 90230. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Del Rey, Los Angeles',
    HERO_SUB='Del Rey is wrapped on three sides by Culver City, and some of its houses carry a Culver City mailing address. The permit still comes from Los Angeles, and that is the first thing we check.',
    EYEBROW_CITY='Del Rey, Los Angeles 90066',
    INTRO_P1='Del Rey is a 2.7-square-mile neighborhood between Culver City, Mar Vista, Marina del Rey and Playa Vista, bounded by the Culver City line, Ballona Creek, Centinela Creek and Lincoln Boulevard. It grew up along the 1902 streetcar line from Culver City to Playa del Rey, now the Culver Boulevard median bike path, and it stayed a district of market gardens into the 1950s. Most of its houses are the modest single-story homes that replaced those gardens, on streets like Braddock Drive, Inglewood Boulevard, McConnell Avenue and Beethoven Street.',
    INTRO_P2='So a Del Rey remodel usually starts with a 1940s or 1950s house of two or three bedrooms, one or two baths and a detached garage. The layouts are closed, the electrical service is small, and the lots are flat and regular, which makes additions and garage ADUs practical. Jurisdiction is the part people get wrong. Del Rey is inside the City of Los Angeles, so LADBS issues the permit even when the envelope says Culver City.',
    HOODS='The Braddock Drive and Inglewood Boulevard blocks, the streets along Ballona Creek and the Culver Boulevard bike path, the Maxella and Glencoe area near Marina del Rey, and the blocks bordering Culver City. ZIP codes 90066 and 90230.',
    SVC1='Closed 1950s kitchens opened to the living room, with the beam, the panel capacity and the new circuits written into the scope from the start.',
    SVC2='A second full bathroom added to a two-bedroom, one-bath house, or the original bath rebuilt with proper waterproofing and ventilation.',
    SVC3="Detached garages converted into permitted ADUs, and new backyard ADUs on Del Rey's flat, regular lots, checked against the parcel before design.",
    SVC4='Whole-house remodels and rear additions on post-war homes, with structure, systems and finishes handled on one contract.',
    SVC5_TITLE='The Culver City Address Question',
    SVC5="Some Del Rey streets carry a Culver City mailing address and the 90230 ZIP code while sitting inside the City of Los Angeles. The mailing address does not decide who issues your permit. The parcel does. We confirm jurisdiction on the city's parcel records before anything is designed, because a set drawn for the wrong building department gets drawn twice.",
    PERMIT_LEAD='Del Rey is a neighborhood of the City of Los Angeles, so LADBS issues the building permit. Next door, Culver City runs its own building department with its own rules, and the city line wraps around Del Rey on three sides. On some blocks the two jurisdictions face each other across the street.',
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections,', 'not Culver City Building Safety, for any property inside the Los Angeles city limit. Pulled in our name under License #1008892, never in yours.'),
        ('Jurisdiction is confirmed by parcel, not by mailing address.', 'We check the parcel on ZIMAS, the City of LA parcel map, before design starts.'),
        ('Garage conversions and backyard ADUs', 'follow California state ADU law as applied by the City of Los Angeles. Flat lots with utilities near the back make many of them straightforward.'),
        ('Panel upgrades are common.', 'Post-war houses here often still run small electrical services, and a new kitchen or an ADU usually needs more capacity.'),
        ('Pre-1978 homes require lead-safe work practices,', 'which covers most Del Rey houses. We test before demolition or sanding begins.'),
    ]),
    N1_H='Raised floors make the systems work cheaper',
    N1_P='Many post-war Del Rey houses sit on a raised foundation over a crawl space. That makes rerouting plumbing and running new circuits far easier than in a slab house, and it lets us look at the foundation and the cripple walls. Where bolting or bracing is missing we price it as a line item rather than leaving it for later.',
    N2_H='Ballona Creek is a neighbor',
    N2_P='Blocks along Ballona Creek and Centinela Creek sit low. Before we price an addition or an ADU on those streets we check drainage, grading and any flood designation on the parcel, because those answers decide the foundation and the finished floor height.',
    N3_H='Two cities, one street',
    N3_P='Permit rules, inspectors and street-use rules change at the city line. We plan staging, parking and inspections for the jurisdiction your house is actually in, and we keep the neighbors on the other side of the line informed all the same.',
    CTA_H='Remodeling in Del Rey? We confirm your jurisdiction first.',
    NEARBY=nearby(['culver-city', 'mar-vista', 'playa-vista', 'marina-del-rey']),
    FAQ=[
        ('My Del Rey address says Culver City. Who issues my permit?',
         'The parcel decides, not the mailing address. Some Del Rey streets use a Culver City mailing address and the 90230 ZIP code while sitting inside the City of Los Angeles, where LADBS issues permits. Other nearby blocks really are Culver City, which has its own Building Safety Division. We confirm which one applies on the parcel records before any design work.'),
        ('What ZIP codes does Del Rey cover?',
         'Most of Del Rey uses ZIP code 90066, which it shares with Mar Vista. Some blocks near the Culver City line carry 90230 with a Culver City mailing address. New Cali Construction works in both, from its office at 10000 Washington Blvd in Culver City.'),
        ('Can I convert my Del Rey garage into an ADU?',
         'In most cases yes. California ADU law allows conversion of an existing detached garage on a single-family lot, and Del Rey lots are typically flat with utilities close to the back. We check the parcel, the setbacks and the existing structure before you pay for design, then handle the drawings, the LADBS submittal and the build.'),
        ('What does a kitchen remodel cost in Del Rey?',
         'A full kitchen typically lands between $40,000 and $120,000, and a guest bathroom between $15,000 and $35,000. In a post-war Del Rey house the two items that most often add cost are a structural beam for an opened wall and an electrical panel upgrade. Both are in our written estimate before work starts.'),
    ],
)

# -------------------------------------------------------------- Ladera Heights
CITIES['ladera-heights'] = dict(
    LOCAL_WORK=False,
    CITY='Ladera Heights',
    ZIPS=['90056'], PLACE_TYPE='Place', WITHIN=LA_COUNTY,
    TITLE='Remodeling Contractor in Ladera Heights, CA | New Cali',
    META_DESC='Ladera Heights remodeling contractor, ZIP 90056. Mid-century and 1960s custom homes, permitted through LA County Public Works, not LADBS. Lic #1008892.',
    OG_DESC='Ladera Heights remodeling contractor, ZIP 90056. Mid-century homes on sloped lots, permitted through Los Angeles County Public Works. Lic #1008892.',
    TW_DESC='Ladera Heights remodeling contractor, ZIP 90056, LA County permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Ladera Heights homeowners (ZIP 90056), permitted through Los Angeles County Public Works for unincorporated parcels and through LADBS for the small section inside the City of Los Angeles.',
    WIKI='https://en.wikipedia.org/wiki/Ladera_Heights,_California',
    SVC_NAME='Home Remodeling in Ladera Heights',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Ladera Heights, California, ZIP 90056. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Ladera Heights, CA',
    HERO_SUB='Most of Ladera Heights is unincorporated Los Angeles County, so the permit comes from the County, not LADBS and not Culver City. A small part is inside the City of Los Angeles. Your parcel decides which.',
    EYEBROW_CITY='Ladera Heights, California 90056',
    INTRO_P1='Ladera Heights began in the late 1940s with the homes of Old Ladera, east of La Cienega Boulevard and south of Slauson Avenue. Custom homes followed in the 1960s, many by architect-builders such as Valentine, on curving hillside streets with views across the basin. Upper Ladera runs north of Slauson between La Cienega and Shenandoah Avenue. Lower Ladera, the larger section, runs south of Slauson between Wooster Avenue and La Cienega, and the houses on Wooster once backed onto the Fox Hills golf course.',
    INTRO_P2='That leaves a stock of single-story ranch and mid-century homes with long rooflines, large windows and sloped lots, now well over half a century old. Remodels here are about modernizing kitchens and baths without flattening the architecture, replacing original systems, and managing hillside drainage. The permit path differs from the neighborhoods around it. Most of Ladera Heights is unincorporated, so Los Angeles County Public Works issues building permits and county zoning, not the City of LA code, sets the rules.',
    HOODS='Upper Ladera, Lower Ladera and Old Ladera, the streets off Slauson Avenue, La Cienega Boulevard and Wooster Avenue, and the blocks near the Ladera Center and Kenneth Hahn State Recreation Area. ZIP code 90056.',
    SVC1='Mid-century kitchens updated with the period in mind: walls opened where the roof framing allows, original proportions kept, and the electrical service brought up to modern loads.',
    SVC2='Original 1950s and 1960s bathrooms rebuilt from the studs, with new supply and drain lines, proper waterproofing, and the ventilation the original rooms never had.',
    SVC3="ADUs and garage conversions under Los Angeles County rules, which differ from the City of LA's. We confirm the parcel's jurisdiction and slope before design.",
    SVC4='Whole-house renovations of ranch and custom mid-century homes: structure, roofing, windows, systems and finishes on one coordinated contract.',
    SVC5_TITLE='Unincorporated County Permitting',
    SVC5='Most Ladera Heights homes are permitted by Los Angeles County Public Works under county zoning and building rules, which have their own submittal requirements and inspection scheduling. A contractor used to LADBS or Culver City will submit the wrong package. We confirm jurisdiction first and prepare the set for the authority that will actually review it.',
    PERMIT_LEAD='Ladera Heights is mostly unincorporated Los Angeles County, with a small section inside the City of Los Angeles. In the county area, building permits are issued by Los Angeles County Public Works Building and Safety, and zoning is set by the county. In the city section, LADBS applies. The two sides look identical from the street.',
    PERMIT_BULLETS=bullets([
        ('Los Angeles County Public Works permits and inspections', 'for most Ladera Heights parcels. Pulled in our name under License #1008892, never in yours.'),
        ('A small section is inside the City of Los Angeles,', 'where LADBS issues permits instead. We confirm which side your parcel is on before design starts.'),
        ('County ADU rules are not City of LA ADU rules.', 'California state law sets the floor, and the county applies it under its own zoning code. We check your parcel against the rules that actually govern it.'),
        ('Sloped lots bring drainage and grading questions.', 'Additions and hardscape on hillside parcels can need grading review and an engineered drainage plan. We identify that at the estimate.'),
        ('Pre-1978 homes require lead-safe work practices,', 'and nearly every Ladera Heights house predates that line. We test before demolition or sanding begins.'),
    ]),
    N1_H='The mid-century design is the value',
    N1_P='The long low rooflines, large windows and open plans of 1950s and 1960s Ladera homes are what buyers pay for. We keep the architecture and replace what is worn out behind it, and we tell you when a proposed change works against the house rather than for it.',
    N2_H='Original systems are at the end of their life',
    N2_P='A house from the late 1940s or the 1960s that has never been fully redone usually has original drain lines, an undersized electrical panel and old ductwork. We inspect and price those in the written scope, because they are cheaper to replace while walls and ceilings are open.',
    N3_H='Water runs downhill toward your neighbor',
    N3_P='On a sloped Ladera lot, a new patio, addition or driveway changes where the rain goes. Drainage is designed into the project from the start, with runoff handled on your property, so the remodel does not create a problem for the house below.',
    CTA_H='Building in Ladera Heights? Start with the right permit office.',
    NEARBY=nearby(['baldwin-hills', 'westchester', 'inglewood', 'culver-city']),
    FAQ=[
        ('Who issues building permits in Ladera Heights?',
         'For most parcels, Los Angeles County Public Works. Ladera Heights is an unincorporated community, so county building and zoning rules apply instead of the City of Los Angeles code or Culver City rules. A small section lies inside the City of Los Angeles, where LADBS applies. We confirm the jurisdiction on the parcel record before design.'),
        ('Can I build an ADU in Ladera Heights?',
         'Often yes. California ADU law applies in unincorporated Los Angeles County, and the county administers it under its own zoning code. Slope, access and setbacks matter on Ladera lots, so we check the specific parcel before you pay for any design work.'),
        ('What ZIP code is Ladera Heights?',
         'Ladera Heights homes use ZIP code 90056. The ZIP code does not settle jurisdiction on its own, so we confirm county or city on the parcel record for every project.'),
        ('How much does a remodel cost in Ladera Heights?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000. In Ladera Heights the larger homes, sloped lots and original systems tend to push whole-house projects toward the higher tiers. The written scope you sign itemizes each of those costs.'),
    ],
)

# -------------------------------------------------------------------- Westwood
CITIES['westwood'] = dict(
    LOCAL_WORK=False,
    CITY='Westwood',
    ZIPS=['90024', '90025'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Westwood, Los Angeles | New Cali',
    META_DESC='Westwood remodeling contractor for ZIP 90024 and 90025. Wilshire Corridor condos, 1920s and 1930s homes and North Village buildings, LADBS permits. Lic #1008892.',
    OG_DESC='Westwood remodeling contractor, ZIP 90024 and 90025. High-rise condos, period homes and LADBS permits. Lic #1008892.',
    TW_DESC='Westwood remodeling contractor, ZIP 90024 and 90025, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home and condo renovations for Westwood homeowners (ZIP codes 90024 and 90025), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Westwood,_Los_Angeles',
    SVC_NAME='Home Remodeling in Westwood',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, condo renovation and whole-home remodeling for homeowners in Westwood, Los Angeles, ZIP codes 90024 and 90025. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Westwood, Los Angeles',
    HERO_SUB='High-rise condos on Wilshire, period homes on the single-family streets, and student buildings in the North Village. Three kinds of building, each with its own approval path.',
    EYEBROW_CITY='Westwood, Los Angeles 90024',
    INTRO_P1='Westwood was laid out by the Janss Investment Company on the former Wolfskill Ranch starting in 1922, ahead of UCLA opening its Westwood campus in 1929. The single-family streets north and south of Wilshire still hold many homes from those first decades, Spanish Colonial Revival, Tudor and traditional houses from the 1920s and 1930s, alongside later rebuilds. Part of Holmby Hills, south of Sunset and east of Beverly Glen Boulevard and Comstock Avenue, also falls within Westwood.',
    INTRO_P2='The other half of Westwood is vertical. Wilshire Boulevard is lined with condominium towers, the North Village west of Gayley Avenue is mostly multifamily housing for UCLA students, and apartment and condo buildings run along Westwood Boulevard. A Westwood remodel can be a period house where the job is protecting original detail, or a high-floor condo where the job is working within the building rules. We scope for the one you own.',
    HOODS='The Wilshire Corridor condo towers, the single-family streets around Westwood Village, the Westwood portion of Holmby Hills, North Village, and the blocks along Westwood Boulevard. ZIP codes 90024 and 90025.',
    SVC1="Period kitchens in 1920s and 1930s homes reworked without losing their character, and condo kitchens in Wilshire towers rebuilt inside the building's fixed plumbing stacks.",
    SVC2='Primary and guest baths in period homes and high-rise condos, waterproofed and inspected so the unit below never becomes your problem.',
    SVC3='Backyard ADUs and garage conversions on single-family lots, checked against setbacks, hillside rules and any private restrictions before design.',
    SVC4='Whole-house renovations of Westwood period homes: seismic work, systems replacement, structure and finishes on one contract.',
    SVC5_TITLE='High-Rise Condo Remodeling',
    SVC5='Wilshire Corridor towers run their own approval process before the city sees your plans: board or management review, insurance certificates naming the association, freight elevator bookings, restricted work hours and protection of common areas. We prepare that package, then pull the LADBS permits the work still requires, and we do not order materials until both are in hand.',
    PERMIT_LEAD="Westwood is part of the City of Los Angeles, so permits go through LADBS. In a condo tower the building's own approval comes first and is often stricter than the code. In single-family areas, the city's floor-area limits and any hillside designation on the parcel shape what an addition can be.",
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Condo associations review before the city does.', 'Plans, product specifications, insurance naming the association and an approved schedule usually have to be on file before work begins.'),
        ('Single-family zones carry floor-area limits.', 'The City of LA caps residential floor area on single-family lots, and some parcels add hillside rules. We confirm the buildable envelope on ZIMAS before anyone designs an addition.'),
        ('Shared condo walls and floors are fire- and sound-rated.', 'Cutting into them means restoring the rating, and inspectors check it closely.'),
        ('Pre-1978 buildings require lead-safe work practices,', 'which covers most period homes and many older apartment and condo buildings. We test before demolition begins.'),
    ]),
    N1_H='The building sets the schedule',
    N1_P='In a Wilshire tower, the freight elevator, the loading dock and the approved work hours decide when material arrives and when noisy work can happen. We book those first and build the schedule around them, which keeps the job from stalling halfway with a building manager at the door.',
    N2_H='Plaster, steel windows and original tile',
    N2_P='Many Westwood period homes still have plaster walls, steel casement windows and decorative tile. Plaster is cut and patched differently from drywall, and steel windows can often be restored rather than replaced. We price the version that keeps them and show you the cost of the alternative.',
    N3_H='Access near UCLA and the Village',
    N3_P='Near the campus and Westwood Village, parking is scarce and streets fill at the start of each academic quarter. Deliveries, dumpster permits and crew parking are arranged in advance, and we schedule around the academic calendar where it affects access.',
    CTA_H='Remodeling in Westwood? House or tower, we plan for both.',
    NEARBY=nearby(['brentwood', 'bel-air', 'west-la', 'sawtelle']),
    FAQ=[
        ('Do I need HOA approval to remodel a Westwood condo?',
         'Almost always. Wilshire Corridor and other Westwood condo buildings typically require plan review by the board or management, a contractor certificate of insurance naming the association, approved work hours and elevator bookings. LADBS permits still apply to plumbing, electrical and structural work. We prepare the association package and handle the city permits.'),
        ('Who issues building permits in Westwood?',
         'The City of Los Angeles, through LADBS. Westwood is a Los Angeles neighborhood, with addresses mostly in ZIP code 90024 and some blocks to the south in 90025. New Cali Construction pulls permits and schedules inspections under License #1008892.'),
        ('Can I add on to my Westwood house?',
         'Often, within limits. The City of LA caps floor area on single-family lots, and parcels with a hillside designation have extra rules. Private deed restrictions can apply in some tracts too. We confirm the buildable envelope for your parcel before you commission a design.'),
        ('How much does a Westwood condo remodel cost?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000. High-rise work adds logistics cost, such as elevator time, protection of common areas and restricted hours, and that cost is itemized in the scope rather than added later.'),
    ],
)

# ------------------------------------------------------------------- Brentwood
CITIES['brentwood'] = dict(
    LOCAL_WORK=False,
    CITY='Brentwood',
    ZIPS=['90049'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Brentwood, Los Angeles | New Cali',
    META_DESC='Brentwood remodeling contractor, ZIP 90049. Fire-zone and hillside remodels north of Sunset, Brentwood Park and Glen homes south of it, LADBS permits. Lic #1008892.',
    OG_DESC='Brentwood remodeling contractor, ZIP 90049. Hillside and fire-zone work north of Sunset, flat-lot remodels south of it. Lic #1008892.',
    TW_DESC='Brentwood remodeling contractor, ZIP 90049, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Brentwood homeowners (ZIP 90049), including hillside projects in the Very High Fire Hazard Severity Zone north of Sunset Boulevard, permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Brentwood,_Los_Angeles',
    SVC_NAME='Home Remodeling in Brentwood',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Brentwood, Los Angeles, ZIP 90049, including hillside and fire-zone projects. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Brentwood, Los Angeles',
    HERO_SUB='Sunset Boulevard splits Brentwood in two. North of it are canyons in a Very High Fire Hazard Severity Zone. South of it are flat streets of traditional homes. The rules change at that line.',
    EYEBROW_CITY='Brentwood, Los Angeles 90049',
    INTRO_P1='Brentwood runs from the 405 west to the Santa Monica city line and Sullivan Canyon, and from Wilshire Boulevard north to Mulholland Drive. Its housing follows the ground. South of Sunset it is mostly flat: Brentwood Park, with large traditional estates between San Vicente Boulevard, Oakmont, Allenford and Cliffwood, Brentwood Glen, with small lots and single-family homes between Sunset, the 405 and the VA grounds, and the streets around San Vicente and its coral-tree median.',
    INTRO_P2='North of Sunset, Kenter, Mandeville, Bundy and Sullivan Canyons climb into the Santa Monica Mountains, and the state has designated that area a Very High Fire Hazard Severity Zone. Crestwood Hills, in upper Kenter Canyon, holds a cluster of protected mid-century modern houses. So a Brentwood project can be a flat-lot remodel, a hillside job under fire-zone construction rules, or work on an architecturally significant house. Each needs a different plan.',
    HOODS='Brentwood Park, Brentwood Glen, Brentwood Terrace, Crestwood Hills, Kenter, Mandeville, Bundy and Sullivan Canyons, and the streets around San Vicente Boulevard. ZIP code 90049.',
    SVC1='Kitchens in traditional Brentwood Park homes and in hillside mid-century houses, opened up where the structure allows and specified to the level these homes call for.',
    SVC2='Primary suites and guest baths with full waterproofing and ventilation and, in older homes, new supply and drain lines behind the finishes.',
    SVC3='Detached ADUs and garage conversions on flat lots south of Sunset. On hillside parcels, fire-zone, access and slope rules decide what is possible, and we check them first.',
    SVC4='Whole-house renovations on flat and hillside lots: structure, seismic, systems, windows and roofing, with fire-resistant materials where the zone requires them.',
    SVC5_TITLE='Fire-Zone and Hillside Work',
    SVC5="North of Sunset, Brentwood sits in a Very High Fire Hazard Severity Zone. Additions and major exterior work there must meet California's wildland-urban interface construction standards for roofing, vents, siding, decks and glazing, and hillside parcels add City of LA hillside rules on size and grading. We write those requirements into the scope before design, not after plan check sends comments back.",
    PERMIT_LEAD="Brentwood is part of the City of Los Angeles, so LADBS issues permits. North of Sunset two more layers apply: fire-zone construction standards and the city's hillside rules. South of Sunset the path is simpler, though floor-area limits, neighborhood associations and private deed restrictions still shape what you can build.",
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Very High Fire Hazard Severity Zone requirements', 'apply north of Sunset. Roofing, vents, exterior walls, decks and windows on new work must meet wildland-urban interface standards.'),
        ('Hillside parcels carry extra limits', 'on floor area, height and grading under City of LA hillside rules. We confirm the designation on ZIMAS before design.'),
        ('Protected homes need extra review.', "Some Crestwood Hills houses and other architecturally significant homes are protected. We check a property's status before proposing exterior changes."),
        ('Canyon access is a cost item.', 'Narrow canyon roads limit truck size and delivery times, and Mandeville Canyon is one long dead-end road. We plan logistics before the first delivery.'),
    ]),
    N1_H='Fire-zone rules reach remodels too',
    N1_P='Owners north of Sunset are often surprised that an addition or a new deck has to meet fire-zone construction standards even though the original house never did. We specify ember-resistant vents, Class A roofing and approved exterior materials where they are required, and we tell you which parts of the existing house the rules do not reach.',
    N2_H='The canyon sets the schedule',
    N2_P='A house up Mandeville or Kenter Canyon can be a long way from the nearest wide street. Truck size, delivery windows, where a dumpster can legally sit and how the crew parks without blocking a fire lane all go into the plan before day one.',
    N3_H='Flat-lot homes still hide surprises',
    N3_P='South of Sunset, many houses are older than they look after decades of updates. Cast-iron drains, ungrounded circuits and unbolted foundations are common in homes of this age once the walls are open. We inspect before we price and write the likely items into the scope.',
    CTA_H='Building in Brentwood? We check fire-zone and hillside rules first.',
    NEARBY=nearby(['westwood', 'pacific-palisades', 'santa-monica', 'sawtelle']),
    FAQ=[
        ('Is my Brentwood home in a fire zone?',
         'If it is north of Sunset Boulevard, very likely. The state has designated Brentwood from Mulholland down to Sunset a Very High Fire Hazard Severity Zone. That affects additions and major exterior work, which must meet wildland-urban interface construction standards. We confirm the designation for your parcel before design.'),
        ('Who issues building permits in Brentwood?',
         'The City of Los Angeles, through LADBS. Brentwood is a Los Angeles neighborhood in ZIP code 90049, not part of the separate City of Santa Monica next door. New Cali Construction pulls permits and schedules inspections under License #1008892.'),
        ('Can I build an ADU in Brentwood?',
         'On many flat lots south of Sunset, yes, under California ADU law as applied by the City of Los Angeles. North of Sunset, fire-zone, hillside and street-access rules can limit or block an ADU, depending on the parcel. We check your lot before you spend anything on design.'),
        ('How much does a Brentwood remodel cost?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000, with whole-house work in the higher tiers. Hillside access, fire-zone materials and the finish level of the house are the main cost drivers here, and all three are itemized in the scope before you sign.'),
    ],
)

# --------------------------------------------------------------- Cheviot Hills
CITIES['cheviot-hills'] = dict(
    LOCAL_WORK=False,
    CITY='Cheviot Hills',
    ZIPS=['90064', '90034', '90035'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Cheviot Hills, CA | New Cali',
    META_DESC='Cheviot Hills remodeling contractor, ZIP 90064. 1920s homes west of Motor Avenue and early-1950s houses east of it, permitted through LADBS. Lic #1008892.',
    OG_DESC='Cheviot Hills remodeling contractor, ZIP 90064. Period homes, early-1950s houses and remodel-or-rebuild planning. Lic #1008892.',
    TW_DESC='Cheviot Hills remodeling contractor, ZIP 90064, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Cheviot Hills homeowners (ZIP 90064, with edge blocks in 90034 and 90035), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Cheviot_Hills,_Los_Angeles',
    SVC_NAME='Home Remodeling in Cheviot Hills',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Cheviot Hills, Los Angeles, ZIP 90064. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Cheviot Hills, Los Angeles',
    HERO_SUB='Two building eras on either side of Motor Avenue: 1920s homes to the west, early-1950s houses on the old country club land to the east. Different houses, different remodels.',
    EYEBROW_CITY='Cheviot Hills, Los Angeles 90064',
    INTRO_P1='Cheviot Hills was founded in 1924, and the residential section west of Motor Avenue was built up through the 1920s. East of Motor Avenue and south of Forrester Drive, much of the neighborhood sits on the former California Country Club, where the houses date to the early 1950s. The neighborhood is framed by the Rancho Park Golf Course and Hillcrest Country Club to the north and Manning Avenue to the southwest, with Century City, Beverlywood, Castle Heights and Palms around it.',
    INTRO_P2='The 1920s houses have plaster walls, original windows and period detail worth keeping. The early-1950s houses have simpler framing and are generally easier to open up and add onto. Values have climbed to the point where many original houses have been torn down for new construction. A remodel is the alternative, and it only makes sense when it is planned well: keep what makes the house worth saving, and replace what is past its life.',
    HOODS='The streets west of Motor Avenue, the former California Country Club tract east of Motor and south of Forrester Drive, Castle Heights, Monte-Mar Vista, and the blocks along Club Drive. ZIP code 90064, with some edge blocks in 90034 and 90035.',
    SVC1='1920s kitchens opened with care for plaster, trim and window placement, and early-1950s kitchens reworked into open plans where the framing makes it practical.',
    SVC2='Period bathrooms rebuilt around original tile where it can be saved, and 1950s bathrooms taken back to the studs with new waterproofing and supply lines.',
    SVC3='Detached ADUs and garage conversions on single-family lots, checked against setbacks, floor-area limits and the existing garage before design.',
    SVC4='Whole-house renovations as an alternative to a teardown: seismic work, new systems, structural changes and finishes on one contract.',
    SVC5_TITLE='Remodel or Rebuild Analysis',
    SVC5='In Cheviot Hills the first honest question is often whether to remodel at all. We look at the foundation, structure, systems and the floor area the lot allows, then set out what a remodel would deliver against what a rebuild would require. If a remodel is the wrong answer for your house, we say so before anyone pays for drawings.',
    PERMIT_LEAD="Cheviot Hills is a City of Los Angeles neighborhood, so permits go through LADBS. The city's floor-area limits for single-family lots shape every addition, and several homeowners' associations cover parts of the area. We check the parcel and any private restrictions before design.",
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Floor-area limits shape additions.', 'The City of LA caps residential floor area on single-family lots. We confirm the remaining allowance on your lot before anyone designs a second story or a rear addition.'),
        ("Homeowners' associations cover parts of the area,", 'including the Cheviot Hills Homeowners Association and separate associations in Castle Heights and California Country Club Estates. We check for private restrictions on your tract.'),
        ('Pre-1978 homes require lead-safe work practices,', 'which covers essentially every original house here. We test before demolition or sanding begins.'),
        ('Seismic retrofits fit naturally into a remodel.', 'Older raised-foundation houses often lack foundation bolting or cripple-wall bracing. When the floors or walls are open, adding it costs far less than doing it later.'),
    ]),
    N1_H='Plaster walls need a plaster plan',
    N1_P='Original 1920s houses have plaster on lath, not drywall. Cutting, patching and matching it takes different methods and different trades, and a bad patch stays visible. We plan plaster repair as its own line item rather than pricing it as drywall.',
    N2_H='The 1950s houses open up well',
    N2_P='The early-1950s homes east of Motor Avenue tend to have simpler framing and fewer original details to protect. That often makes them the better candidates for opening walls, reworking layouts and adding space, and we design to that strength.',
    N3_H='New construction next door affects your job',
    N3_P="New houses on neighboring lots are common here. That can mean shared staging, competing parking, and a neighbor's work changing drainage or shared fences. We coordinate with adjacent sites and photograph conditions at the property line before we start.",
    CTA_H='Remodeling in Cheviot Hills? See remodel against rebuild first.',
    NEARBY=nearby(['palms', 'west-la', 'beverly-hills', 'culver-city']),
    FAQ=[
        ('Who issues building permits in Cheviot Hills?',
         'The City of Los Angeles, through LADBS. Cheviot Hills is a Los Angeles neighborhood, mostly in ZIP code 90064, with some edge blocks in 90034 and 90035. New Cali Construction pulls permits and schedules inspections under License #1008892.'),
        ('Should I remodel or tear down my Cheviot Hills house?',
         'It depends on the foundation, the structure, the condition of the systems and how much floor area your lot still allows. We assess those first and give you a written comparison of what a remodel delivers against what a rebuild requires, so you can decide before paying for design.'),
        ('Can I add a second story in Cheviot Hills?',
         'Often, within the floor-area limits the City of LA sets for single-family lots. The existing foundation usually needs engineering review to carry a second floor. We confirm the remaining allowance and the structural path before design starts.'),
        ('How much does a remodel cost in Cheviot Hills?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000. Plaster work, period details and seismic upgrades in 1920s houses are the usual cost drivers, and each one is itemized in the written scope.'),
    ],
)

# -------------------------------------------------------------------- Sawtelle
CITIES['sawtelle'] = dict(
    LOCAL_WORK=False,
    CITY='Sawtelle',
    ZIPS=['90025', '90064', '90049'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Sawtelle, Los Angeles | New Cali',
    META_DESC='Sawtelle remodeling contractor for ZIP 90025, 90064 and 90049. Bungalows, duplexes and condos around Sawtelle Japantown, permitted through LADBS. Lic #1008892.',
    OG_DESC='Sawtelle remodeling contractor, ZIP 90025, 90064 and 90049. Bungalows, duplexes and condos, LADBS permits. Lic #1008892.',
    TW_DESC='Sawtelle remodeling contractor, ZIP 90025, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in nearby Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and renovating bungalows, duplexes and condos in Sawtelle, Los Angeles (ZIP codes 90025, 90064 and 90049), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Sawtelle,_Los_Angeles',
    SVC_NAME='Home Remodeling in Sawtelle',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Sawtelle, Los Angeles, ZIP codes 90025, 90064 and 90049. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Sawtelle, Los Angeles',
    HERO_SUB='A former city of its own, now a dense pocket of the Westside where early bungalows, duplexes, condos and newer small-lot homes share the same blocks.',
    EYEBROW_CITY='Sawtelle, Los Angeles 90025',
    INTRO_P1='Sawtelle was its own city, incorporated in 1899 around the Sawtelle Veterans Home, and it was absorbed into Los Angeles in the 1920s after a long annexation fight. The neighborhood inside the City of LA runs roughly from the 405 west to Centinela Avenue and from National Boulevard north to San Vicente Boulevard and the VA grounds, about a mile to either side of Santa Monica Boulevard. Sawtelle Japantown, along Sawtelle Boulevard, was formally designated in 2015.',
    INTRO_P2='Housing on these blocks is mixed. There are early bungalows on streets like Corinth, Butler, Purdue and Stoner Avenues, duplexes and small apartment buildings from the post-war decades, condos along the boulevards, and newer small-lot homes where older houses were replaced. That mix sets the remodel. A bungalow needs its original systems replaced, a condo needs association approval, and a duplex needs its legal unit count confirmed before anything is designed.',
    HOODS='Sawtelle Japantown along Sawtelle Boulevard, the residential streets between the 405 and Centinela Avenue, the blocks either side of Santa Monica and Olympic Boulevards, and the streets near the VA campus. ZIP codes 90025, 90064 and 90049.',
    SVC1="Bungalow kitchens rebuilt around new wiring and plumbing, and condo kitchens reworked inside the building's existing plumbing stacks.",
    SVC2='Bathrooms in bungalows, duplex units and condos, with waterproofing detailed to code and supply lines replaced while the walls are open.',
    SVC3='Garage conversions and backyard ADUs on single-family and duplex lots, starting with a check of what the city has on record for the property.',
    SVC4='Whole-house renovations of early Sawtelle bungalows: foundation and seismic work, full systems replacement, and finishes on one contract.',
    SVC5_TITLE='Duplex and Small-Building Work',
    SVC5="Sawtelle has many duplexes and small apartment buildings, some with units added over the decades. Before we design anything we confirm the legal unit count on the city's records and whether rent-stabilization rules apply. If a unit is unpermitted or tenant-occupied, the plan changes, and we tell you before you commit.",
    PERMIT_LEAD='Sawtelle is part of the City of Los Angeles, so permits go through LADBS. A small unincorporated Sawtelle area, mostly federal and state land around the VA, falls under Los Angeles County, but the residential lots in the neighborhood are city parcels. Condo projects add association approval on top.',
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Legal unit count is verified first.', 'Older duplexes and fourplexes are checked against city records before we design around an assumed number of units.'),
        ('Rent-stabilized units carry Housing Department rules.', 'Older rental buildings are commonly covered by the City of LA Rent Stabilization Ordinance, and work on occupied units can require a tenant habitability plan.'),
        ('Condo owners need HOA approval too,', 'including insurance naming the association, agreed work hours and protection of common areas.'),
        ('Pre-1978 homes require lead-safe work practices,', 'and most original Sawtelle housing predates that line. We test before demolition or sanding begins.'),
    ]),
    N1_H='Narrow lots, close neighbors',
    N1_P='Sawtelle lots are narrow and side yards are tight. Scaffolding, excavation and material storage have to fit within a few feet of the property line, so we plan protection of the neighboring structure and the staging before day one.',
    N2_H='Parking is scarce near Japantown',
    N2_P='Restaurant traffic on Sawtelle Boulevard and permit-parking blocks nearby make crew parking and deliveries a real constraint. We arrange dumpster permits, delivery windows and parking before work starts, so trades do not lose hours looking for a spot.',
    N3_H='Early wiring is still in some walls',
    N3_P='The oldest Sawtelle bungalows can still have cloth-insulated or knob-and-tube circuits spliced into later wiring. We trace what is actually in the walls before pricing the electrical, rather than quoting the optimistic version and correcting it later.',
    CTA_H='Remodeling in Sawtelle? We start with what the city has on record.',
    NEARBY=nearby(['west-la', 'westwood', 'brentwood', 'santa-monica']),
    FAQ=[
        ('Is Sawtelle part of the City of Los Angeles?',
         'Yes, for residential property. Sawtelle was a separate city until it was annexed in the 1920s, and today its homes are permitted by LADBS. A small unincorporated area nearby is mostly federal and state land around the VA campus. Sawtelle addresses fall mainly in ZIP codes 90025, 90064 and 90049.'),
        ('Can I add an ADU to my Sawtelle duplex?',
         'Sometimes. California ADU law allows ADUs on many multifamily lots as well as single-family lots, but the rules differ and the existing unit count matters. We confirm the legal units on record and check the lot before you pay for design.'),
        ('Do you remodel condos in Sawtelle?',
         'Yes. A condo remodel needs association approval, a certificate of insurance naming the HOA, agreed work hours and protected common areas, plus LADBS permits for plumbing, electrical or structural work. We prepare the association package and handle the city permits.'),
        ('How much does a bathroom remodel cost in Sawtelle?',
         'A guest bathroom generally runs $15,000 to $35,000, and a primary suite with layout changes runs higher. In older Sawtelle houses, replacing original supply lines and wiring is the most common addition to the scope, and it is priced in writing before you sign.'),
    ],
)

# --------------------------------------------------------------- Baldwin Hills
CITIES['baldwin-hills'] = dict(
    LOCAL_WORK=False,
    CITY='Baldwin Hills',
    ZIPS=['90008', '90016'], PLACE_TYPE='Place', WITHIN=LA_CITY,
    TITLE='Remodeling Contractor in Baldwin Hills, CA | New Cali',
    META_DESC='Baldwin Hills remodeling contractor for ZIP 90008 and 90016. Hillside homes in the Dons, Baldwin Vista and Village Green condos, LADBS permits. Lic #1008892.',
    OG_DESC='Baldwin Hills remodeling contractor, ZIP 90008 and 90016. Hillside homes, Village Green condos and LADBS permits. Lic #1008892.',
    TW_DESC='Baldwin Hills remodeling contractor, ZIP 90008 and 90016, LADBS permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in neighbouring Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Baldwin Hills homeowners (ZIP codes 90008 and 90016), permitted through the Los Angeles Department of Building and Safety.',
    WIKI='https://en.wikipedia.org/wiki/Baldwin_Hills,_Los_Angeles',
    SVC_NAME='Home Remodeling in Baldwin Hills',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Baldwin Hills, Los Angeles, ZIP codes 90008 and 90016. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Baldwin Hills, Los Angeles',
    HERO_SUB='Hillside homes with pools in the Dons, view houses in Baldwin Vista, and the landmark garden apartments of Village Green. Each part of Baldwin Hills asks for a different remodel.',
    EYEBROW_CITY='Baldwin Hills, Los Angeles 90008',
    INTRO_P1='Baldwin Hills is the City of Los Angeles neighborhood bounded by La Cienega Boulevard, Crenshaw Boulevard, Stocker Street and Obama Boulevard, with Culver City to the west and Leimert Park across Crenshaw. Baldwin Hills Estates, known locally as the Dons because nearly every street name starts with Don, such as Don Luis Drive and Don Mariano Drive, is a hillside neighborhood of view homes with swimming pools and condominiums built out over steep slopes. Baldwin Vista covers the north side of the hills between La Cienega and La Brea.',
    INTRO_P2='Village Green, originally Baldwin Hills Village, is a garden-city complex designated a National Historic Landmark in 2001 and now owned as condominiums. Baldwin Village, between La Brea and Marlton Avenue, is mostly mid-century apartment buildings. So the work splits three ways: hillside houses where slope, drainage and structure lead the scope, a landmark complex where association and historic review come first, and rental buildings where tenant rules apply.',
    HOODS='Baldwin Hills Estates (the Dons), Baldwin Vista, Village Green, Baldwin Village, and the blocks near Kenneth Hahn State Recreation Area and Stocker Street. ZIP codes 90008 and 90016.',
    SVC1='Kitchens in mid-century hillside homes opened toward the view, with the structure checked before any wall comes out.',
    SVC2='Bathrooms rebuilt from the studs in mid-century houses and condos, with new drain and supply lines and waterproofing detailed to code.',
    SVC3='ADUs and garage conversions where slope and access allow. On hillside lots we check grading, drainage and street access before design.',
    SVC4='Whole-house renovations of hillside view homes: foundation and drainage work, systems, windows and finishes on one contract.',
    SVC5_TITLE='Hillside Structure and Drainage',
    SVC5='Homes in the Dons and Baldwin Vista sit on slopes, and some condominiums project out over them on posts. Before we scope a remodel we look at the foundation, the retaining walls and where the water goes, because on a hillside those decide the cost and the safety of everything built on top. Where an engineer is needed, we bring one in at the start.',
    PERMIT_LEAD="Baldwin Hills is a City of Los Angeles neighborhood, so LADBS issues the building permit. Hillside parcels add the city's hillside rules on size, height and grading. Village Green's owners association reviews changes to its landmark buildings, and older apartment buildings carry Rent Stabilization rules through the Los Angeles Housing Department.",
    PERMIT_BULLETS=bullets([
        ('LADBS permits and inspections', 'for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Hillside parcels carry extra limits', 'on floor area, height and grading under City of LA hillside rules, and slopes can require geotechnical review. We check the designation on ZIMAS before design.'),
        ('Village Green is a National Historic Landmark.', 'Exterior and common-area changes go through the owners association first, and historic character is part of that review. Interior work still needs LADBS permits where the code requires them.'),
        ('Older apartment buildings carry Rent Stabilization rules.', 'Baldwin Village apartments are commonly covered by the City of LA Rent Stabilization Ordinance, so work on occupied units follows Housing Department requirements.'),
        ('Pre-1978 homes require lead-safe work practices,', 'which covers most of the neighborhood. We test before demolition or sanding begins.'),
    ]),
    N1_H='Posts, slopes and retaining walls',
    N1_P='Some Baldwin Hills condos and houses are partly supported on posts or step down the hillside on retaining walls. We inspect those supports before planning heavier finishes, new decks or added rooms, and we price any repair the engineer calls for as part of the job.',
    N2_H='Pools are part of the scope',
    N2_P='Many hillside homes in the Dons have pools, and a remodel that touches the yard, the rear wall or the drainage usually touches the pool too. We plan access, protection and drainage around it rather than finding the problem halfway through.',
    N3_H='The view is what you are paying for',
    N3_P='Many of these floor plans were drawn before the city view was valued the way buyers value it now. Opening the rear of the house toward the view is often the biggest improvement available, and it is a structural job, so we design it with the engineering in place from the start.',
    CTA_H='Building in Baldwin Hills? We start with the slope.',
    NEARBY=nearby(['ladera-heights', 'culver-city', 'mid-city', 'inglewood']),
    FAQ=[
        ('Who issues building permits in Baldwin Hills?',
         'The City of Los Angeles, through LADBS. Baldwin Hills is a Los Angeles neighborhood, with addresses mainly in ZIP codes 90008 and 90016. Neighboring Ladera Heights and View Park-Windsor Hills are unincorporated county areas with a different permit office, so we confirm the jurisdiction on every parcel.'),
        ('Can I remodel my Village Green condo?',
         'Interior remodels are generally possible, but Village Green is a National Historic Landmark run by an owners association, so exterior and common-area changes go through association review, and LADBS permits any plumbing, electrical or structural work. We prepare the association package and follow its rules on scheduling and access.'),
        ('Does a hillside remodel in Baldwin Hills need an engineer?',
         'Often. Additions, decks, retaining walls and work that changes drainage on a slope usually need structural and sometimes geotechnical engineering, and hillside parcels carry extra City of LA rules. We identify that at the estimate so it is in the price and the schedule.'),
        ('How much does a remodel cost in Baldwin Hills?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000. On hillside lots, foundation, retaining-wall and drainage work can move a project into the higher tiers, and those items are itemized in the written scope.'),
    ],
)

# ------------------------------------------------------------- Manhattan Beach
CITIES['manhattan-beach'] = dict(
    LOCAL_WORK=False,
    CITY='Manhattan Beach',
    ZIPS=['90266'], PLACE_TYPE='City', WITHIN=LA_COUNTY,
    TITLE='Remodeling Contractor in Manhattan Beach, CA | New Cali',
    META_DESC='Manhattan Beach remodeling contractor, ZIP 90266. Sand Section, Tree Section and Hill Section homes, permitted by the City of Manhattan Beach. Lic #1008892.',
    OG_DESC='Manhattan Beach remodeling contractor, ZIP 90266. Walk-street cottages, Tree Section homes and Hill Section view houses. Lic #1008892.',
    TW_DESC='Manhattan Beach remodeling contractor, ZIP 90266, city permits. Lic #1008892.',
    SCHEMA_DESC='New Cali Construction is a licensed design-build general contractor based in Culver City, remodeling kitchens and bathrooms, building ADUs and garage conversions, and delivering whole-home renovations for Manhattan Beach homeowners (ZIP 90266), permitted through the City of Manhattan Beach rather than LADBS.',
    WIKI='https://en.wikipedia.org/wiki/Manhattan_Beach,_California',
    SVC_NAME='Home Remodeling in Manhattan Beach',
    SVC_DESC='Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in Manhattan Beach, California, ZIP 90266. Written line-item scope, locked price, and weekly photo updates through completion.',
    H1='Remodeling Contractor in Manhattan Beach, CA',
    HERO_SUB='Manhattan Beach is its own city with its own building department, and its neighborhoods differ sharply: walk streets by the sand, larger lots in the Tree Section, view homes on the Hill.',
    EYEBROW_CITY='Manhattan Beach, California 90266',
    INTRO_P1='Manhattan Beach is a 3.9-square-mile city with 2.1 miles of ocean frontage, one of the three Beach Cities of the South Bay. The Sand Section is a grid of small lots and walk streets running down to the Strand, with El Porto at the north end. The Hill Section has steep lots with ocean and city views. The Tree Section has larger lots and a mix of original houses and newer homes. East Manhattan Beach, across Sepulveda Boulevard, includes Manhattan Village, Manhattan Heights and Liberty Village.',
    INTRO_P2='Many homes here have already been remodeled or rebuilt, and the originals that remain are mostly beach cottages on small lots or post-war houses on larger ones. Remodels are judged against the new construction next door, so finish quality matters, but so does the paperwork. Manhattan Beach is not part of Los Angeles. The City of Manhattan Beach reviews and inspects the work, and the western part of the city lies inside the coastal zone.',
    HOODS='The Sand Section and the Strand, El Porto, the Hill Section, the Tree Section, the Gas Lamp and Poets Sections, and East Manhattan Beach including Manhattan Village, Manhattan Heights and Liberty Village. ZIP code 90266.',
    SVC1='Kitchens in beach cottages and post-war homes rebuilt to the standard of the new construction around them, with salt-air hardware near the sand.',
    SVC2='Primary suites and guest baths with full waterproofing and ventilation detailed for the marine layer.',
    SVC3="ADUs and garage conversions under Manhattan Beach's own rules, which are not the City of LA's. Small Sand Section lots make the parcel check essential.",
    SVC4='Whole-house renovations and additions in the Tree and Hill Sections: structure, systems and finishes on one contract.',
    SVC5_TITLE='Coastal Zone Projects',
    SVC5='The western part of Manhattan Beach lies inside the California coastal zone, where many projects need coastal review on top of the building permit. We confirm at the estimate stage whether your parcel is in the zone and which review your scope triggers, and the honest timeline goes in writing.',
    PERMIT_LEAD="Manhattan Beach is an independent city. Your remodel is reviewed, permitted and inspected by the City of Manhattan Beach Community Development Department under the Manhattan Beach Municipal Code, not by LADBS or Los Angeles County. Its zoning, design and coastal rules are its own.",
    PERMIT_BULLETS=bullets([
        ('City of Manhattan Beach permits and inspections,', 'not LADBS, for structural, plumbing, electrical and mechanical work. Pulled in our name under License #1008892, never in yours.'),
        ('Coastal zone parcels need coastal review', 'in addition to the building permit. We confirm whether your parcel is in the zone before design.'),
        ('Manhattan Beach applies its own ADU rules', "on top of California state law, so setbacks, height and lot requirements are judged by the city's code. We check your parcel against the current rules."),
        ('Small lots make staging a design input.', "On Sand Section walk streets and narrow lots there is little room for material, dumpsters or equipment. We plan logistics under the city's street-use rules before day one."),
        ('Pre-1978 homes require lead-safe work practices.', 'Most remaining original houses predate that line. We test before demolition or sanding begins.'),
    ]),
    N1_H='Your remodel is compared to new construction',
    N1_P='Many Manhattan Beach streets already have new homes on them, so every future buyer will judge a remodel against them. We spend where it shows and where it protects value, and we tell you when a remodel cannot close that gap and a different plan makes more sense.',
    N2_H='Walk streets limit access',
    N2_P='Sand Section houses on walk streets have no vehicle frontage, so material is carried in by hand or staged from the rear alley where there is one. That labor is a real line item, and it belongs in the written scope rather than a change order.',
    N3_H='Salt air and sand',
    N3_P='Near the beach, fasteners, hinges, flashing and exterior fixtures corrode early, and blowing sand wears finishes and sliding door tracks. We specify coastal-grade products in the scope so the price covers the version that lasts.',
    CTA_H="Building in Manhattan Beach? We work to the city's own rules.",
    NEARBY=nearby(['el-segundo', 'hawthorne', 'playa-del-rey', 'westchester']),
    FAQ=[
        ('Does a Manhattan Beach remodel go through LADBS?',
         'No. Manhattan Beach is an independent city, so your project is reviewed, permitted and inspected by the City of Manhattan Beach under its own municipal code. LADBS and Los Angeles County have no role. New Cali Construction pulls permits in its own name under License #1008892.'),
        ('Do I need a coastal permit in Manhattan Beach?',
         'It depends on where the parcel is and what you are changing. The western part of the city lies inside the California coastal zone, where many projects need coastal review in addition to the building permit. We confirm your parcel and scope at the estimate stage.'),
        ('What ZIP code does Manhattan Beach use?',
         'Manhattan Beach homes use ZIP code 90266. It covers every section of the city, from El Porto and the Sand Section to the Tree Section, the Hill Section and East Manhattan Beach.'),
        ('How much does a remodel cost in Manhattan Beach?',
         'A guest bathroom generally runs $15,000 to $35,000 and a full kitchen between $40,000 and $120,000, with whole-house work in the higher tiers. Coastal review, hand-carry access on walk streets and the finish level set by new construction nearby are the main cost drivers, and each is itemized before you sign.'),
    ],
)


def _ld(obj):
    # Indent nested lines to sit inside the template's two-space JSON-LD block.
    return json.dumps(obj, indent=2, ensure_ascii=False).replace('\n', '\n  ')


def area_served(d):
    """areaServed for both JSON-LD blocks.

    Pages without ZIPS keep the original single City object, byte for byte.
    Pages with ZIPS get the place plus one Place per ZIP code. Only postalCode,
    region and country are set on those: no street address ever appears here,
    so the office address in "address" stays the only street address on the page.
    """
    zips = d.pop('ZIPS', None)
    ptype = d.pop('PLACE_TYPE', 'City')
    within = d.pop('WITHIN', None)
    if not zips:
        biz = ('{\n    "@type": "City",\n    "name": "%s",\n    "sameAs": "%s"\n  }'
               % (d['CITY'], d['WIKI']))
        svc = '{\n    "@type": "City",\n    "name": "%s"\n  }' % d['CITY']
        return biz, svc
    place = {'@type': ptype, 'name': d['CITY'], 'sameAs': d['WIKI']}
    if within:
        place['containedInPlace'] = within
    items = [place] + [
        {'@type': 'Place', 'name': 'ZIP code %s' % z,
         'address': {'@type': 'PostalAddress', 'postalCode': z,
                     'addressRegion': 'CA', 'addressCountry': 'US'}}
        for z in zips]
    return _ld(items), _ld(items)


def render(slug):
    d = dict(CITIES[slug])
    faq = d.pop('FAQ')
    d['AREA_SERVED_LD'], d['SVC_AREA_SERVED_LD'] = area_served(d)
    # The stock photos are not from this city. Pages without a verified local
    # job list (LOCAL_WORK=False) must not caption them as local work.
    if d.pop('LOCAL_WORK', True):
        d['INTRO_IMG_ALT'] = '%s remodeling work by New Cali Construction' % d['CITY']
        d['GAL_SCOPE'] = 'in %s and across the Westside' % d['CITY']
        d['GAL_ALT'] = 'Completed %s remodel by New Cali Construction' % d['CITY']
    else:
        d['INTRO_IMG_ALT'] = 'Remodeling work by New Cali Construction'
        d['GAL_SCOPE'] = 'across the Westside'
        d['GAL_ALT'] = 'Completed remodel by New Cali Construction'
    d['SLUG'] = slug
    d['URL'] = 'https://www.newcaliconstruction.com/areas/%s/' % slug
    d['FAQ_SCHEMA'] = faq_schema(faq)
    d['FAQ_VISIBLE'] = faq_visible(faq)
    # Culver City is the head office and always belongs in the footer; the page's own
    # city is added next to it unless it is Culver City itself.
    foot = ['culver-city'] if slug == 'culver-city' else ['culver-city', slug]
    d['FOOTER_AREAS'] = '\n'.join(
        '      <a href="/areas/%s/">%s</a>' % (s2, CITY_NAMES[s2]) for s2 in foot)

    html = io.open(TEMPLATE, encoding='utf-8').read()
    # CITY last: it is a substring of several other values.
    keys = sorted([k for k in d if k != 'CITY'], key=len, reverse=True) + ['CITY']
    for k in keys:
        html = html.replace('{{%s}}' % k, d[k])

    # Metadata length is a correctness property of the page, not a style choice.
    # A previous pass fixed these in the HTML but not here, and the next
    # regeneration silently put the over-long versions back.
    import html as _h
    t = _h.unescape(re.search(r'<title>(.*?)</title>', html, re.S).group(1))
    d = _h.unescape(re.search(r'<meta name="description" content="(.*?)"', html, re.S).group(1))
    if len(t) > 60:
        raise SystemExit('%s: title is %d chars, max 60: %s' % (slug, len(t), t))
    if len(d) > 165:
        raise SystemExit('%s: meta description is %d chars, max 165' % (slug, len(d)))

    left = re.findall(r'\{\{[A-Z0-9_]+\}\}', html)
    if left:
        raise SystemExit('%s: unfilled tokens %s' % (slug, sorted(set(left))))
    for ch in BANNED_DASHES:
        if ch in html:
            raise SystemExit('%s: long dash found at U+%04X, banned' % (slug, ord(ch)))

    # An area page is a LocalBusiness, so a rating here is the business rating
    # itself. Google: pages where "the entity that's being reviewed controls the
    # reviews about itself" are "ineligible for star review feature", and "Don't
    # aggregate reviews or ratings from other websites" rules out borrowing the
    # Yelp numbers. The generator used to emit 4.9 from 50 reviews, which matched
    # no review corpus at all. Ship the CSLB credential instead.
    #
    # The mirror-image rule is why index.html carries no review markup either:
    # more than one Review on an item without an aggregateRating is the error
    # Search Console raised on 2026-08-29.
    if 'aggregateRating' in html:
        raise SystemExit('%s: aggregateRating on a LocalBusiness, banned as self-serving' % slug)
    if len(re.findall(r'"@type"\s*:\s*"Review"', html)) > 1:
        raise SystemExit('%s: multiple Review objects with no aggregateRating, Google rejects it' % slug)

    out_dir = os.path.join(ROOT, 'areas', slug)
    if not os.path.isdir(out_dir):
        os.makedirs(out_dir)
    out = os.path.join(out_dir, 'index.html')
    io.open(out, 'w', encoding='utf-8', newline='').write(html)

    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    for b in blocks:
        json.loads(b)  # raises on malformed schema
    print('areas/%s/index.html  %d bytes  %d JSON-LD blocks OK' % (slug, len(html), len(blocks)))


if __name__ == '__main__':
    targets = sys.argv[1:] or sorted(CITIES)
    for s in targets:
        if s not in CITIES:
            raise SystemExit('unknown city: %s (have: %s)' % (s, ', '.join(sorted(CITIES))))
        render(s)
