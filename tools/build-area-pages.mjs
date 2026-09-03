/**
 * Builds the service-area landing pages under /areas/.
 *
 *   node tools/build-area-pages.mjs
 *
 * Every city below has its own copy - housing stock, permit authority, the
 * problems we actually run into there, and its own FAQs. Nothing is templated
 * prose; the template only supplies chrome (nav, form, footer, schema shape).
 * Add a city to CITIES and re-run to publish a new page.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.newcaliconstruction.com';

/* ------------------------------------------------------------------ data - */

const CITIES = [
  {
    slug: 'mar-vista',
    name: 'Mar Vista',
    title: 'Remodeling Contractor in Mar Vista | New Cali Construction',
    desc: 'Licensed Mar Vista remodeling contractor. Kitchen, bathroom, ADU and whole-home remodels on Mar Vista’s post-war homes. Written scope, locked price. Lic #1008892.',
    heroSub: 'Opening up post-war floor plans, adding second bathrooms, and turning alley garages into permitted ADUs - a mile and a half from our Culver City shop.',
    heroImg: '/images/home-remodel/home-remodel-1.jpg',
    introImg: '/images/kitchen/kitchen-3.jpg',
    intro: [
      'Mar Vista is a post-war neighborhood almost end to end. Most of the housing stock is 1940s and 1950s two- and three-bedroom homes on 5,000 to 6,500 square foot lots, with larger properties up around Mar Vista Hill. They were built with closed-off galley kitchens, one bathroom, a single-pane window package and a detached garage off the alley - which is exactly the list of things homeowners here call us about.',
      'So the work is predictable: take down the kitchen wall, carve a second full bath out of the hallway, and convert the alley garage into a permitted ADU. What is less predictable is what a 1948 house hides behind the plaster. On a Mar Vista remodel we budget for the electrical panel, the supply lines and the structural beam up front, in the written scope - not as a change order in week three.'
    ],
    hoods: 'Mar Vista Hill, Grand View, the McLaughlin and Beethoven Street blocks, the Venice Boulevard corridor, and the streets bordering Palms and Del Rey.',
    permitBody: 'Mar Vista is not its own city - it is a neighborhood of the City of Los Angeles, so every permit goes through LADBS (Los Angeles Department of Building and Safety) and its West LA district office. We pull them, we meet the inspectors, and the permit path is written into your scope before you sign.',
    permitBullets: [
      '<strong>LADBS plan check</strong> for anything structural, plus separate electrical, plumbing and mechanical permits on a full remodel.',
      '<strong>Panel upgrades are routine here.</strong> Plenty of Mar Vista homes still run 100-amp service (some with the original fuse box). New kitchen circuits generally will not pass inspection without addressing it.',
      '<strong>Garage-conversion ADUs are unusually straightforward</strong> in Mar Vista - the alley access, the sewer lateral and the power drop are already at the back of the lot.',
      '<strong>Galvanized supply piping</strong> is common in this vintage. If we open the walls anyway, repiping to copper or PEX during the remodel costs a fraction of doing it later.'
    ],
    notes: [
      { h: 'That wall is almost always load-bearing', p: 'In these floor plans the wall between the kitchen and living room usually carries roof load. Removing it means a beam, an engineer’s calculation, and posts carried down to new footings - real money that belongs in the estimate on day one, not week three.' },
      { h: 'Raised foundations, not slabs', p: 'Most Mar Vista homes sit on a raised perimeter foundation over a crawl space. That makes repiping and rewiring far cheaper than in a slab house - and while we are under there we check whether the cripple walls were ever seismically braced.' },
      { h: 'Fifty-foot lots set the ceiling', p: 'Side yards are tight, so additions here go to the rear or up rather than out. We confirm the buildable envelope against setbacks and lot coverage before anyone pays for a design.' }
    ],
    services: {
      kitchen: 'Opening the closed 1950s galley kitchen into the living room is the single most requested Mar Vista project on our board.',
      bathroom: 'Adding a second full bathroom to a two-bed, one-bath house - usually taken out of a hallway closet and the back bedroom.',
      adu: 'Alley-access garages convert into permitted one-bedroom ADUs about as cleanly as anywhere on the Westside.',
      home: 'Whole-house remodels on and around Mar Vista Hill, where the floor plan needs to change and not just the finishes.'
    },
    faqs: [
      { q: 'What does a kitchen remodel cost in Mar Vista?', a: 'Most Mar Vista kitchens land between $25,000 and $100,000+ depending on whether you keep the layout or open the wall. Budget separately for what the house’s age brings with it - a service panel upgrade and a structural beam are the two line items that most often surprise homeowners here. Both are in our written estimate before work starts.' },
      { q: 'Who issues building permits for Mar Vista?', a: 'The City of Los Angeles does. Mar Vista is an LA neighborhood, not a separate city, so plans go to LADBS and are typically handled through the West LA district office. New Cali Construction pulls the permits, schedules the inspections and carries California Contractor License #1008892.' },
      { q: 'Can I convert my Mar Vista garage into an ADU?', a: 'In most cases yes. California ADU law lets homeowners convert an existing detached garage on a single-family lot, and Mar Vista’s alley-facing garages already have the access and utilities nearby that make it economical. We handle the design, the engineering, the LADBS submittal and the build.' }
    ],
    gallery: ['/images/kitchen/kitchen-4.jpg', '/images/bathroom/bathroom-3.jpg', '/images/adu/adu-3.jpg'],
    nearby: ['west-la', 'playa-vista', 'marina-del-rey', 'westchester']
  },

  {
    slug: 'playa-vista',
    name: 'Playa Vista',
    title: 'Remodeling Contractor in Playa Vista | New Cali Construction',
    desc: 'Playa Vista condo and townhome remodels done to HOA rules. Kitchens, bathrooms and full interiors in Phase I and Runway buildings. Licensed, insured. Lic #1008892.',
    heroSub: 'Condo and townhome remodels run the way Playa Vista actually requires them - HOA submittal first, elevator and loading dock booked, neighbors kept out of it.',
    heroImg: '/images/home-remodel/home-remodel-2.jpg',
    introImg: '/images/bathroom/bathroom-5.jpg',
    intro: [
      'Playa Vista is the youngest neighborhood we work in. Phase I homes date from about 2002 and the Runway side from the mid-2010s, so nobody here is fighting knob-and-tube wiring or galvanized pipe. Almost every property is a condo, a townhome or a small-lot single-family home inside an association, and that one fact changes a remodel more than the age of the building ever would.',
      'On a Playa Vista job the constraint is not the house, it is the building. Association design review before anything is ordered. Insurance certificates naming the HOA. Approved work hours, a booked freight elevator, protected common corridors, and a water shutoff coordinated with neighbors who did not ask to be involved. We plan the job around those rules first and the finishes second - which is why our Playa Vista projects tend not to get red-tagged by building management halfway through.'
    ],
    hoods: 'The Bluffs, Concert Park, Crescent Park, Camden, the Runway district, and the townhome rows along Millennium and Seabluff.',
    permitBody: 'Playa Vista sits inside the City of Los Angeles, so permits go through LADBS - but the city is only half the approval. Your homeowners association almost always has to sign off first, and its rules are frequently stricter than the building code. We submit to both.',
    permitBullets: [
      '<strong>HOA architectural review comes before the city.</strong> Plans, product specs, contractor license and insurance certificates naming the association usually all have to be on file before a single cabinet is ordered.',
      '<strong>LADBS permits still apply</strong> to plumbing relocation, electrical work and any wall removal - an association approval is not a building permit, and interior condo work is not exempt.',
      '<strong>Shared walls and floors are fire- and sound-rated assemblies.</strong> Cutting into them means restoring the rating, which is one of the most commonly failed inspections in multifamily remodels.',
      '<strong>Logistics get scheduled like a trade.</strong> Freight elevator windows, loading dock times, corridor protection and approved work hours go into the schedule before we set a start date.'
    ],
    notes: [
      { h: 'Plumbing rarely moves far', p: 'In a stacked building, waste lines are shared and the slab is not yours to trench. Kitchen islands with sinks and relocated tubs are sometimes possible and sometimes flatly not - we check the building’s plumbing risers before we design around it.' },
      { h: 'Newer does not mean generous', p: 'Playa Vista floor plans are efficient. Getting a real feeling of space usually comes from removing a non-structural partition, reworking the entry and reconfiguring storage rather than from adding square footage - there is none to add.' },
      { h: 'Your neighbors are ten feet away', p: 'Noise windows, dust containment at the door, and elevator pads matter as much as the tile. A clean site is not a courtesy here, it is what keeps your association approval from being pulled mid-project.' }
    ],
    services: {
      kitchen: 'Condo and townhome kitchens reworked within the building’s existing plumbing risers - new cabinetry, stone, appliances and lighting.',
      bathroom: 'Primary and guest baths in stacked buildings, waterproofed and inspected properly so the unit below never becomes your problem.',
      adu: 'ADUs are rarely possible on association-governed lots. We will tell you straight whether yours qualifies before you spend anything on plans.',
      home: 'Full interior remodels of Playa Vista townhomes - flooring, millwork, bathrooms and kitchen as one coordinated, HOA-approved scope.'
    },
    faqs: [
      { q: 'Do I need HOA approval to remodel my Playa Vista condo?', a: 'Almost certainly. Playa Vista associations typically require an architectural review submittal, a licensed and insured contractor with a certificate naming the HOA as additional insured, and agreement to set work hours and elevator scheduling. We prepare that package as part of the project - and we do not order materials until it is approved.' },
      { q: 'Can I move the sink or add an island in a Playa Vista condo?', a: 'Sometimes. It depends on where the building’s waste and vent risers run and whether your unit sits on a podium slab. We look at the building drawings before designing anything that assumes plumbing can move; when it cannot, we get the layout you want using the lines you have.' },
      { q: 'How long does a Playa Vista condo remodel take?', a: 'A kitchen or two-bathroom scope usually runs four to eight weeks on site, but the calendar starts earlier than the demo does - HOA review commonly adds two to six weeks before anything can begin. We build that approval window into the schedule so the start date we give you is real.' }
    ],
    gallery: ['/images/kitchen/kitchen-8.jpg', '/images/bathroom/bathroom-4.jpg', '/images/bathroom/bathroom-13.jpg'],
    nearby: ['mar-vista', 'westchester', 'marina-del-rey', 'west-la']
  },

  {
    slug: 'west-la',
    name: 'West LA',
    title: 'Remodeling Contractor in West LA | New Cali Construction',
    desc: 'West Los Angeles remodeling contractor - kitchens, bathrooms, condos and whole-home renovations in Sawtelle, Rancho Park and West LA. Free estimate. Lic #1008892.',
    heroSub: 'Sawtelle bungalows, Rancho Park traditionals and mid-rise condos - three very different builds, three very different remodels.',
    heroImg: '/images/kitchen/kitchen-2.jpg',
    introImg: '/images/bathroom/bathroom-6.jpg',
    intro: [
      'West LA is not one housing type, it is three sitting on top of each other. There are pre-war and 1940s bungalows through Sawtelle, 1930s and 1950s traditionals in Rancho Park, and a dense band of condos and 1960s dingbat apartments along the Santa Monica, Olympic and Sepulveda corridors. A remodel plan that works on one of them is wrong for the other two.',
      'What they share is pressure on space and price per square foot. Nobody in West LA is adding a wing; they are making 1,300 square feet work like 1,800. That means removing the right wall rather than every wall, stealing depth from a hallway for a second bath, finishing a garage properly, and getting real storage into a kitchen that cannot get any bigger. We start by telling you which of those actually pays off in your house.'
    ],
    hoods: 'Sawtelle Japantown, Rancho Park, Westwood-adjacent blocks, the West LA Civic Center area, and the condo corridors along Santa Monica and Olympic Boulevards.',
    permitBody: 'West Los Angeles is part of the City of LA, so permits go to LADBS and are usually processed through the West LA district office on Santa Monica Boulevard. If you are in a condo, the association’s approval sits on top of that - both are our job, not yours.',
    permitBullets: [
      '<strong>LADBS permits and inspections</strong> for structural changes, plumbing, electrical and mechanical work - pulled in our name under License #1008892.',
      '<strong>Condo owners need HOA sign-off too,</strong> including insurance naming the association, agreed work hours and elevator or stair protection.',
      '<strong>Pre-1978 homes require lead-safe work practices,</strong> and much of Sawtelle predates that line. We test rather than guess before we start sanding or demolishing.',
      '<strong>Older duplex and fourplex conversions</strong> get looked at closely for legal unit count. We verify what the city has on record before you design around an assumption.'
    ],
    notes: [
      { h: 'Parking is part of the schedule', p: 'Permit-only blocks and narrow streets around Sawtelle mean dumpster placement and crew parking need arranging before day one. It sounds small; it is the thing that most often costs a subcontractor half a day.' },
      { h: 'Two eras of wiring in one house', p: 'A lot of West LA homes have been partly rewired over seventy years, so you find modern romex tied into cloth-wrapped original circuits. We map what is actually in the walls before quoting the electrical, instead of pricing the optimistic version.' },
      { h: 'Space is bought, not found', p: 'The wins here are structural: pushing a bathroom into a closet, taking a bearing wall out with a flush beam so the ceiling line stays clean, converting a garage. We show you the two or three moves worth paying for.' }
    ],
    services: {
      kitchen: 'Small-footprint kitchens made to work - full-height storage, better lighting, and the one wall removal that changes the whole floor plan.',
      bathroom: 'Guest and primary bathrooms in bungalows and condos alike, with the waterproofing detail done to code and documented.',
      adu: 'Detached garages and rear structures converted into permitted ADUs on the single-family blocks of Sawtelle and Rancho Park.',
      home: 'Whole-house remodels of 1930s and 1940s traditionals - systems, structure and finishes handled as one contract.'
    },
    faqs: [
      { q: 'Do you remodel condos in West LA?', a: 'Yes, and they are a large share of our West LA work. A condo remodel needs association approval, a certificate of insurance naming the HOA, agreed work hours and protected common areas - plus LADBS permits for any plumbing, electrical or structural work. We handle both approval tracks and schedule around the building’s rules.' },
      { q: 'How much does a bathroom remodel cost in West LA?', a: 'A standard guest bath generally runs $15,000 to $35,000, and a primary suite with layout changes runs higher. What moves the number in West LA is whether plumbing relocates and what condition the original supply lines are in - both get inspected and priced before you sign, not discovered later.' },
      { q: 'My West LA house is from the 1940s. Will a remodel trigger code upgrades?', a: 'Often, yes. Opening walls can bring the electrical panel, plumbing, egress windows and seismic bracing into scope. That is not a contractor upselling you - it is what plan check requires. We identify those items during the estimate so the price you agree to is the price that gets you to final inspection.' }
    ],
    gallery: ['/images/kitchen/kitchen-1.jpg', '/images/bathroom/bathroom-2.jpg', '/images/home-remodel/home-remodel-5.jpg'],
    nearby: ['mar-vista', 'beverly-hills', 'bel-air', 'mid-city']
  },

  {
    slug: 'marina-del-rey',
    name: 'Marina del Rey',
    title: 'Remodeling Contractor in Marina del Rey | New Cali Construction',
    desc: 'Marina del Rey remodeling contractor for waterfront condos and townhomes. County permits, HOA coordination, salt-air-ready materials. Free estimate. Lic #1008892.',
    heroSub: 'Waterfront condos and townhomes - county permits, association approvals and materials chosen for salt air, not for a showroom.',
    heroImg: '/images/kitchen/kitchen-5.jpg',
    introImg: '/images/bathroom/bathroom-3.jpg',
    intro: [
      'Marina del Rey is the one place on our service map that is not a city at all. It is unincorporated Los Angeles County, most of it built on county-leased land, and the housing is overwhelmingly condos, townhomes and apartment conversions rather than single-family homes. That combination - county jurisdiction, leasehold parcels, association governance - catches out contractors who only ever work inside LA city limits.',
      'Then there is the water. A quarter mile from open ocean, salt air is relentless on hardware, hinges, fixtures and unprotected metal. We specify marine-grade or stainless hardware, sealed finishes and ventilation that actually moves humidity out of a bathroom, because the cheap version of those choices fails here in two years and looks fine everywhere else in the city for ten.'
    ],
    hoods: 'Silver Strand, Villa Marina, Mariners Village, and the waterfront buildings along Admiralty Way, Panay Way, Marquesas and Bora Bora Way.',
    permitBody: 'Marina del Rey is unincorporated county territory, so building permits are issued by Los Angeles County Public Works Building and Safety - not LADBS. Much of the area also sits within the coastal zone, and most buildings add an association review on top. We work all three tracks.',
    permitBullets: [
      '<strong>County, not city.</strong> Plans go to LA County Public Works Building and Safety. Filing at LADBS by mistake is the most common way a Marina del Rey project loses three weeks.',
      '<strong>Coastal zone rules can apply</strong> to exterior alterations. Interior remodels usually are not affected - we confirm your parcel before assuming either way.',
      '<strong>HOA architectural review plus insurance certificates</strong> naming the association are standard, along with fixed work hours and booked freight-elevator windows.',
      '<strong>Leasehold parcels have their own paperwork.</strong> On county-leased land the ground lease may require notice or consent for certain alterations - worth checking before design, not after.'
    ],
    notes: [
      { h: 'Salt air eats the cheap version', p: 'Standard hinges, drawer slides, shower hardware and light fixtures corrode fast this close to the water. We spec marine-grade or solid stainless where it matters and tell you plainly where it does not, so the money goes to the parts that actually fail.' },
      { h: 'Humidity needs a way out', p: 'Waterfront units run humid year round. Undersized bathroom exhaust is the root cause of most mold complaints we are called about here - correctly sized, ducted-to-outside ventilation is a non-negotiable line in our scope.' },
      { h: 'The building sets the schedule', p: 'Elevator reservations, dock access, corridor protection and quiet hours in these towers are strict. We build the schedule around the building’s calendar so a missed elevator slot never becomes a lost week.' }
    ],
    services: {
      kitchen: 'Condo kitchens rebuilt within the building’s existing risers, with hardware and finishes chosen to survive a waterfront unit.',
      bathroom: 'Full waterproofing, correctly sized ventilation and corrosion-resistant fixtures - the three things that decide how a marina bathroom ages.',
      adu: 'ADUs rarely apply on leasehold or association parcels here. We will confirm your situation honestly before you spend on plans.',
      home: 'Whole-unit townhome and condo renovations coordinated with building management from first submittal to final walkthrough.'
    },
    faqs: [
      { q: 'Who issues permits in Marina del Rey?', a: 'Los Angeles County Public Works Building and Safety. Marina del Rey is unincorporated county territory, so it is not handled by the City of LA or LADBS. We file with the county, and where the property is inside the coastal zone or on a county ground lease we check those requirements before design begins.' },
      { q: 'Do materials really need to be different this close to the ocean?', a: 'For anything metal, yes. Salt air corrodes standard hinges, slides, shower valves and exterior-facing fixtures far faster than it does inland. We use marine-grade or solid stainless hardware and sealed finishes where corrosion actually shows up, and we do not upcharge you for it in places it makes no difference.' },
      { q: 'Can you work around my building’s HOA rules?', a: 'That is most of the job here. We submit the architectural package, provide insurance certificates naming the association, book freight elevator and loading dock windows, protect common corridors and hold to the building’s approved work hours. Buildings that are strict about this are the ones that call us back.' }
    ],
    gallery: ['/images/kitchen/kitchen-4.jpg', '/images/bathroom/bathroom-6.jpg', '/images/home-remodel/home-remodel-4.jpg'],
    nearby: ['playa-vista', 'mar-vista', 'westchester', 'malibu']
  },

  {
    slug: 'beverly-hills',
    name: 'Beverly Hills',
    title: 'Remodeling Contractor in Beverly Hills | New Cali Construction',
    desc: 'Beverly Hills remodeling contractor - kitchens, primary suites and whole-home renovations built to the city’s stricter permit and site rules. Lic #1008892.',
    heroSub: 'A city with its own building department, its own site rules and its own expectations of finish - all three planned for before we start.',
    heroImg: '/images/kitchen/kitchen-4.jpg',
    introImg: '/images/home-remodel/home-remodel-2.jpg',
    intro: [
      'Beverly Hills runs its own building department, and it is noticeably more demanding than the City of Los Angeles on plan check, site conduct and inspections. Add housing that ranges from 1920s Spanish Colonial in the Flats to mid-century post-and-beam in Trousdale, and you get projects where the approval process is genuinely part of the build rather than a formality that precedes it.',
      'There is one wrinkle worth knowing before you call anyone: a Beverly Hills mailing address does not always mean the City of Beverly Hills. Homes in the Beverly Hills Post Office area north of Sunset are inside Los Angeles city limits and permit through LADBS instead. We confirm which jurisdiction your parcel is in on the first visit, because getting that wrong costs weeks and a resubmittal fee.'
    ],
    hoods: 'The Flats, Trousdale Estates, the Beverly Hills Business Triangle residential edge, Coldwater and Benedict Canyon approaches, and the BHPO blocks north of Sunset.',
    permitBody: 'The City of Beverly Hills issues its own permits through its Community Development Department - separate submittals, separate inspectors, and site rules that are enforced. Properties in the Beverly Hills Post Office area go to LADBS instead.',
    permitBullets: [
      '<strong>City of Beverly Hills plan check</strong> for anything structural, with its own submittal standards and correction cycles - budget more calendar time than an equivalent LA city job.',
      '<strong>Confirm the jurisdiction first.</strong> BHPO addresses are City of LA. The mailing address is not the permitting authority.',
      '<strong>Construction hours, staging, street use and haul routes are actively enforced,</strong> and violations bring stop-work exposure. We confirm the current rules with the city before we set a schedule.',
      '<strong>Older estates hide older systems.</strong> Original knob-and-tube branches, cast-iron drains and undersized services turn up regularly and belong in the estimate, not in a change order.'
    ],
    notes: [
      { h: 'Plan check is a real phase', p: 'On a Beverly Hills remodel, permitting is not a week of paperwork - it is a phase with correction cycles. We schedule it as one, tell you the realistic date and do not book a crew against a permit we do not have yet.' },
      { h: 'Finish tolerances are tighter', p: 'The level of finish expected here - flush reveals, stone matching, millwork that lands dead flat - needs to be decided at scope, because it changes the trades we bring and the hours we quote, not just the material line.' },
      { h: 'The neighbors will notice', p: 'Deliveries, dumpsters and early starts draw complaints faster in Beverly Hills than anywhere else we work. Staging plans, clean sites and hard stops on work hours are part of how we keep a project moving.' }
    ],
    services: {
      kitchen: 'High-specification kitchens - custom millwork, book-matched stone, integrated appliances - executed to a written, locked scope.',
      bathroom: 'Primary suites and guest baths with the waterproofing, stone detailing and ventilation done to a standard that holds up to close inspection.',
      adu: 'Detached ADUs and garage conversions on Beverly Hills lots, permitted through the correct jurisdiction for your parcel.',
      home: 'Whole-home renovations of Spanish Colonial, Traditional and mid-century properties, systems and structure included.'
    },
    faqs: [
      { q: 'Is my Beverly Hills address actually in the City of Beverly Hills?', a: 'Not necessarily. Homes in the Beverly Hills Post Office area north of Sunset carry a Beverly Hills mailing address but sit inside Los Angeles city limits, which means LADBS handles the permits. We verify the parcel’s jurisdiction before design so the plans are drawn for the right department the first time.' },
      { q: 'Why do Beverly Hills projects take longer to permit?', a: 'The city runs its own plan check with its own standards and correction cycles, and it enforces site rules that other jurisdictions treat loosely. That is generally good for the finished product and hard on optimistic schedules. We quote the permitting phase honestly instead of promising an LA-city timeline.' },
      { q: 'Do you handle whole-home renovations in Beverly Hills?', a: 'Yes - whole-home projects are a large part of what we do, typically in the $120,000 to $500,000+ range depending on size and specification. Every one starts with a written line-item scope and a locked price, and you get weekly photo updates from demolition through final inspection.' }
    ],
    gallery: ['/images/kitchen/kitchen-1.jpg', '/images/bathroom/bathroom-2.jpg', '/images/bathroom/bathroom-5.jpg'],
    nearby: ['bel-air', 'west-la', 'mid-city', 'pacific-palisades']
  },

  {
    slug: 'pacific-palisades',
    name: 'Pacific Palisades',
    title: 'Pacific Palisades Rebuild & Remodeling Contractor | New Cali Construction',
    desc: 'Pacific Palisades contractor after the January 2025 fire - ground-up rebuilds, smoke and heat damage renovation, ADUs and remodeling. Design-build, Lic #1008892.',
    h1: 'Rebuild & Remodeling Contractor in Pacific Palisades',
    introH2: 'What building in Pacific Palisades <em>actually involves now</em>',
    heroSub: 'Ground-up rebuilds, smoke and heat damage renovation, and remodeling on the blocks the fire never reached. One licensed design-build contractor for all three.',
    serviceDesc: 'Design-build general contracting in Pacific Palisades, California: ground-up rebuilds on fire-affected lots, smoke and heat damage renovation of homes that survived, permitted ADU construction, and kitchen, bathroom and whole-home remodeling. Includes insurance scope review, architect and engineer coordination, LADBS permitting, hillside and Very High Fire Hazard Severity Zone construction standards, with a written line-item scope and a locked price.',
    extraFormOptions: ['Ground-Up Rebuild', 'Smoke / Heat Damage Renovation'],
    priceFoot: '<strong>Free estimates always.</strong> The ranges above cover remodel and ADU work. A ground-up rebuild is scoped and quoted individually against your lot and your insurance scope - every quote is line-item and locked in writing before work begins.',
    heroImg: '/images/home-remodel/home-remodel-1.jpg',
    introImg: '/images/kitchen/kitchen-1.jpg',
    intro: [
      'Since the January 2025 fire, Pacific Palisades has been three neighborhoods at the same time. There are lots waiting on a rebuild. There are houses left standing that took smoke, soot and heat damage a repaint does not fix. And there are blocks the fire never reached, where people are getting on with the remodel they were already planning. Those are genuinely different jobs, and a contractor who talks about them as one thing is not paying attention. We take on all three - but we scope them as the different projects they are.',
      'What has not changed is the terrain. Between the Alphabet Streets, Huntington Palisades, Rustic Canyon, Marquez Knolls and the Highlands you have flat lots and steep ones, wide streets and canyon roads a concrete truck cannot turn around on. Hillside grading rules, fire-zone material standards and access limits still drive what a project costs here - and they now sit next to a rebuild permitting process that has been revised repeatedly since the fire. We confirm what currently applies to your address before we put a number on anything.'
    ],
    special: {
      eyebrow: 'After the Fire',
      title: 'Where you are decides <em>what we can do</em>',
      lead: 'Every Palisades property is at a different point, and the work is not the same work. Find yourself below. We handle all three, and we scope each one as its own project rather than pricing them off the same sheet.',
      cards: [
        {
          h: 'If your lot is empty',
          p: 'We rebuild, start to finish. One design-build contract covers reading your insurance scope, coordinating the architect and engineer, soils and utilities, LADBS permitting, and the build through final inspection - instead of you project-managing five trades from wherever you are living now. Written line-item scope, locked price, weekly photo updates.'
        },
        {
          h: 'If your house is still standing',
          p: 'Homes outside the burn footprint took smoke, soot and heat damage that hides in insulation, ductwork, attic voids and wall cavities. Cosmetic work over the top of it fails - the smell and the staining come back within months. We assess what genuinely has to come out, replace it, and put the whole scope in writing so it lines up with what your insurer agreed to cover.'
        },
        {
          h: 'If you want an ADU first',
          p: 'On a lot where the main house is gone or unlivable, a permitted ADU is often the first structure that can realistically go back up - and it stays an asset long after the main house is finished. Rules for ADUs on fire-affected parcels have been handled differently from a standard build and have changed more than once. We check what applies to your parcel before anyone draws anything.'
        }
      ],
      foot: 'One thing we will not do: quote a Palisades project off a photo and a phone call. Before we give you a number, we walk the lot.'
    },
    hoods: 'The Alphabet Streets, Huntington Palisades, Rustic Canyon, Marquez Knolls, Castellammare and the Palisades Highlands.',
    permitBody: 'Pacific Palisades permits through LADBS, and since the fire that has meant two parallel realities: expedited rebuild pathways created by city and state emergency orders for properties inside the burn area, and the normal hillside and fire-zone process for everyone else. Both have been revised more than once. We verify current requirements with LADBS at the time we quote instead of working from what was true last year.',
    permitBullets: [
      '<strong>Rebuild pathways were created by emergency order,</strong> including expedited review and relief from parts of the normal discretionary and coastal process for like-for-like rebuilding within the original footprint. Size allowances, eligibility and deadlines have all moved since 2025 - verify before you design, not after.',
      '<strong>Insurance scope and permit scope are two different documents.</strong> What your carrier agreed to pay for and what plan check requires you to build are frequently not the same list. That gap breaks more rebuild budgets than anything else.',
      '<strong>Very High Fire Hazard Severity Zone standards</strong> govern exterior materials, ember-resistant vents and rated glazing on most Palisades parcels. On a rebuild they are code, not upgrades, and they are a real share of the number.',
      '<strong>Hillside grading, drainage and retaining rules still apply,</strong> and soils or geology reporting is common on sloped lots regardless of which permitting track you are on.'
    ],
    notes: [
      { h: 'The gap between your policy and your permit', p: 'Insurance settles on what you lost. The city permits what current code requires. Fire-zone materials, updated energy and electrical standards and sprinkler requirements can all be required now and were not covered then. We put that difference in writing at estimate stage, so you are negotiating a known number rather than discovering one in month four.' },
      { h: 'Smoke damage is not a paint job', p: 'In houses that survived, soot and odour live in insulation, ductwork, attic spaces and wall cavities. Sealing and painting over it buys a few months. We scope what genuinely has to be removed, and we would rather tell you it is more than you hoped than do the job twice.' },
      { h: 'Access got harder, not easier', p: 'Narrow canyon streets with active construction on multiple lots at once means staging, deliveries and truck access are genuinely constrained. We price the access route after walking it. An estimate written off a map is a guess, and here it is an expensive one.' }
    ],
    services: {
      rebuild: 'Ground-up rebuilds on fire-affected lots and smoke and heat damage renovation on the houses that survived - insurance scope through final inspection.',
      kitchen: 'Kitchens in houses that came through the fire, in rebuilt homes, and on the blocks the fire never reached.',
      bathroom: 'Bathrooms and primary suites, with ventilation and waterproofing specified for canyon and coastal-facing conditions.',
      adu: 'Permitted ADUs - often the first structure that can realistically go back on a lot, and an asset long after.',
      home: 'Ground-up rebuilds and whole-home renovation - structure, systems, fire-zone assemblies and finishes under one contract.'
    },
    faqs: [
      { q: 'Do you take on ground-up rebuilds in Pacific Palisades?', a: 'Yes. We are a licensed design-build general contractor (California License #1008892) and we handle total-loss rebuilds end to end - reviewing the insurance scope, coordinating the architect and engineer, soils and utilities, LADBS permitting, and the build through final inspection. That is one contract and one company accountable for the schedule, instead of you coordinating five separate trades from wherever you are living now.' },
      { q: 'What does a rebuild cost in the Palisades?', a: 'We do not publish a per-square-foot number for rebuilds here, because in this community it moves more than anywhere else we work - slope, street access, fire-zone assemblies and how much of your lot’s utilities survived all change it materially. What we do instead is walk the lot, read your insurance scope, and give you a written line-item price rather than a wide range designed to win the job and get revised later.' },
      { q: 'My house survived the fire but still smells of smoke. Is that fixable?', a: 'Usually, but not with paint. Soot and odour settle into insulation, ductwork, attic spaces and wall cavities, and cosmetic work over the top of it fails within months. We assess what actually has to be removed and replaced, do that work, and scope it in writing so it lines up with what your insurer has agreed to cover. That is the real job - the finishes are the easy part.' },
      { q: 'Can I put an ADU on my lot while the main house is rebuilt?', a: 'Often yes, and it is one of the more practical moves available: a permitted ADU can be the first structure back on the lot and it stays valuable once the house is done. Rules for ADUs on fire-affected parcels have been treated differently from a standard build and have changed more than once, so we check what currently applies to your address before design begins.' },
      { q: 'How long does permitting take in the Palisades now?', a: 'Honestly, it depends which track you are on and when you ask. Emergency orders created faster pathways for rebuilding inside the burn area, while the normal hillside and fire-zone process applies elsewhere - and both have been revised since 2025. We verify current timelines with LADBS when we quote, and we tell you plainly which parts of the schedule we control and which we do not.' },
      { q: 'Does the fire hazard zone change what I can build here?', a: 'It changes how you build it. Most of the Palisades sits in a Very High Fire Hazard Severity Zone, where California’s wildfire construction standards govern exterior materials, eave and vent detailing and window assemblies. Those requirements are part of plan check, so they belong in the estimate from day one instead of turning up at inspection.' }
    ],
    ctaTitle: 'Rebuilding, repairing, or remodeling in the Palisades?',
    ctaSub: 'Free consultation, on your lot. We read the insurance scope, walk the site, and come back with a written line-item price - not a range.',
    gallery: ['/images/kitchen/kitchen-4.jpg', '/images/bathroom/bathroom-4.jpg', '/images/home-remodel/home-remodel-2.jpg'],
    nearby: ['malibu', 'bel-air', 'beverly-hills', 'west-la']
  },

  {
    slug: 'westchester',
    name: 'Westchester',
    title: 'Remodeling Contractor in Westchester, Los Angeles | New Cali Construction',
    desc: 'Westchester remodeling contractor - Kentwood and Osage tract homes, ADUs and additions. LAX soundproofing handled correctly. Free estimate. Lic #1008892.',
    heroSub: 'Post-war Kentwood and Osage tract homes - the best ADU lots on the Westside, and a soundproofing package you should not tear out by accident.',
    heroImg: '/images/adu/adu-2.jpg',
    introImg: '/images/adu/adu-7.jpg',
    intro: [
      'Westchester was built fast and built alike - rows of two- and three-bedroom tract houses put up for aerospace workers in the late 1940s and early 1950s, on generous, regular lots with detached garages. For a remodeler that uniformity is a gift: we have seen your floor plan before, we know where the bearing walls are, and we know what the original electrical looks like behind the drywall.',
      'Those deep lots also make Westchester one of the strongest ADU neighborhoods on the Westside - there is genuinely room for a detached unit behind the house, not just a garage conversion squeezed to the property line. The wrinkle is LAX. Many homes here received acoustic treatment through the airport’s residential soundproofing program - sealed windows, upgraded doors, added mechanical ventilation - and a remodel that cuts into that envelope without restoring it leaves you with a louder house than you started with.'
    ],
    hoods: 'Kentwood, Osage, Westport Heights, Emerson Manor, and the blocks running down toward Playa del Rey.',
    permitBody: 'Westchester is a City of Los Angeles neighborhood, so permits go through LADBS. Proximity to LAX adds a couple of considerations that inland neighborhoods never deal with.',
    permitBullets: [
      '<strong>LADBS permits and inspections</strong> for structural, electrical, plumbing and mechanical scopes, pulled under License #1008892.',
      '<strong>Deep lots make detached ADUs realistic here,</strong> not just garage conversions - setbacks and lot coverage usually work out in your favor.',
      '<strong>Acoustic treatment from the LAX soundproofing program</strong> needs to be identified before demolition. Replacement windows and doors should match or beat what is there, and the added ventilation has to stay functional.',
      '<strong>Original 1950s service panels</strong> are common and generally need upgrading before new kitchen or ADU circuits will pass.'
    ],
    notes: [
      { h: 'Do not undo the soundproofing', p: 'If your windows were replaced under the LAX program, swapping them for standard dual-pane units in a remodel is a downgrade you will hear every day. We identify the existing package first and specify replacements that hold the same acoustic performance.' },
      { h: 'Repeat floor plans, repeatable pricing', p: 'Because so much of Kentwood and Osage came from the same handful of plans, we can be unusually precise about what a wall removal or a bath addition will cost here - we have taken the same wall out before.' },
      { h: 'The backyard is the asset', p: 'These lots run deep. A detached ADU behind the house is often worth more than an addition onto it, and it keeps your main house livable during construction. We model both before you commit.' }
    ],
    services: {
      kitchen: 'Opening up the original tract-home kitchen into the dining and living space - the standard Westchester first project.',
      bathroom: 'Second bathrooms and primary-bath additions in three-bedroom tract homes where one bath was the original spec.',
      adu: 'Detached ADUs and garage conversions on Westchester’s deep lots - some of the best ADU ground on the Westside.',
      home: 'Whole-house remodels that finally bring the 1950s systems, insulation and layout up to how the house is actually used.'
    },
    faqs: [
      { q: 'Is Westchester a good neighborhood for an ADU?', a: 'One of the best on the Westside. The post-war lots are deep and regular, which means a detached unit often fits without variances, and the existing detached garages convert cleanly when a full detached build is not the goal. We model both options with real numbers before you commit to either.' },
      { q: 'Will remodeling affect my LAX soundproofing?', a: 'It can. Homes treated through the airport’s residential soundproofing program have acoustic windows and doors, sealed penetrations and added mechanical ventilation. If a remodel breaks that envelope and replaces it with standard components, the noise comes back. We survey what is installed before demolition and specify matching or better replacements.' },
      { q: 'How much does it cost to add a bathroom in Westchester?', a: 'Adding a full bathroom within the existing footprint typically runs $25,000 to $45,000 depending on how far plumbing has to travel and whether the panel needs upgrading. Building out into an addition costs more. We price the plumbing route and the electrical upgrade specifically - those two items drive the difference.' }
    ],
    gallery: ['/images/adu/adu-3.jpg', '/images/kitchen/kitchen-2.jpg', '/images/home-remodel/home-remodel-5.jpg'],
    nearby: ['playa-vista', 'mar-vista', 'el-segundo', 'inglewood']
  },

  {
    slug: 'el-segundo',
    name: 'El Segundo',
    title: 'Remodeling Contractor in El Segundo | New Cali Construction',
    desc: 'El Segundo remodeling contractor - kitchens, bathrooms, additions and ADUs on El Segundo’s small-lot older homes. City permits handled. Lic #1008892.',
    heroSub: 'Small lots, older homes and a city building department that knows every street - El Segundo projects are won on planning, not muscle.',
    heroImg: '/images/home-remodel/home-remodel-5.jpg',
    introImg: '/images/kitchen/kitchen-6.jpg',
    intro: [
      'El Segundo is its own city with its own building department, and its housing stock is older and tighter than most of the South Bay - 1920s through 1950s homes on compact lots, many of them still close to their original footprint. Lot coverage, setbacks and existing garage placement do more to determine what is possible here than budget does.',
      'That makes the feasibility conversation the important one. Before anyone draws a plan we check what the lot will actually carry: whether the addition fits, whether the garage can convert without losing required parking, whether going up is cheaper than going out. Homeowners here are frequently told yes by a designer and no by the city. We would rather have that conversation on the first visit, for free.'
    ],
    hoods: 'The residential grid west of Sepulveda, the older blocks around Richmond Street and Center Street, and the neighborhoods bordering Smoky Hollow.',
    permitBody: 'El Segundo issues its own building permits through the city’s Building and Safety division - not LA City or LA County. It is a small department that reviews carefully, and plans that ignore lot coverage or parking requirements come back quickly.',
    permitBullets: [
      '<strong>City of El Segundo plan check and inspections</strong> - a separate submittal process from anything in Los Angeles.',
      '<strong>Lot coverage and setbacks are the binding constraint</strong> on most projects. Feasibility gets checked before design, not after.',
      '<strong>Garage conversions have to account for required parking.</strong> Losing the garage without a compliant plan is the most common reason an El Segundo ADU stalls.',
      '<strong>Pre-1978 homes need lead-safe practices,</strong> and a good share of El Segundo predates that. We test rather than assume.'
    ],
    notes: [
      { h: 'The lot decides the project', p: 'On compact El Segundo parcels, coverage and setback math usually rules out one of the two options a homeowner is weighing. Getting that answer in week one saves paying for a design that cannot be permitted.' },
      { h: 'Older bones, honest assessment', p: 'Homes from the 1920s to 1940s here often still have their original panel, plumbing and, occasionally, cloth-wrapped wiring. We open a wall and look before quoting, so the estimate reflects the house you own.' },
      { h: 'Going up is sometimes cheaper', p: 'Where coverage blocks a ground-floor addition, a second-storey or partial upper addition can be the better economics even though it sounds more ambitious. We run both numbers instead of defaulting to the obvious one.' }
    ],
    services: {
      kitchen: 'Kitchens in compact older homes - layout, storage and light gained without square footage that is not there.',
      bathroom: 'Bathroom remodels and second-bath additions in one-bath houses, planned around where the plumbing can realistically go.',
      adu: 'Garage conversions and detached ADUs planned around El Segundo’s coverage and parking requirements before design starts.',
      home: 'Whole-house remodels and additions on small lots, permitted through the City of El Segundo.'
    },
    faqs: [
      { q: 'Who issues building permits in El Segundo?', a: 'The City of El Segundo does, through its own Building and Safety division - El Segundo is an independent city, so LADBS and LA County have no role. We submit to the city, meet its inspectors and carry California Contractor License #1008892.' },
      { q: 'Can I convert my El Segundo garage into an ADU?', a: 'Often, but the parking and lot-coverage rules matter more here than in most cities because the lots are small. Before you pay for plans we check what the parcel allows and whether converting the garage creates a parking problem the city will not approve. If it does not pencil, we say so.' },
      { q: 'Is an addition or a second storey better on a small El Segundo lot?', a: 'It depends on your coverage numbers. When a ground-floor addition would push the lot past allowable coverage, building up is frequently the only permittable option - and occasionally the cheaper one once you account for foundation and hardscape work. We price both before recommending either.' }
    ],
    gallery: ['/images/kitchen/kitchen-8.jpg', '/images/bathroom/bathroom-6.jpg', '/images/adu/adu-6.jpg'],
    nearby: ['westchester', 'hawthorne', 'inglewood', 'playa-vista']
  },

  {
    slug: 'malibu',
    name: 'Malibu',
    title: 'Remodeling Contractor in Malibu | New Cali Construction',
    desc: 'Malibu remodeling contractor - coastal permits, septic-served properties and fire-zone construction handled properly. Free estimate. Lic #1008892.',
    heroSub: 'Coastal permits, septic-served lots and fire-zone materials - Malibu punishes contractors who treat it like the rest of LA.',
    heroImg: '/images/bathroom/bathroom-2.jpg',
    introImg: '/images/kitchen/kitchen-1.jpg',
    intro: [
      'Malibu is the most heavily regulated place on our map, and none of it is negotiable. It is its own city with its own building department, most of the coastline sits under coastal development rules, the great majority of properties are served by private septic systems rather than sewer, and nearly the whole city is in a very high fire hazard zone. Any one of those changes a project; here you usually get all four at once.',
      'Practically, that means the permitting phase on a Malibu remodel is longer than the construction phase on a comparable inland job - sometimes by months. We would rather tell you that on the first call than discover it together in month four. Where a scope can be kept fully interior, the path is far shorter, and we will show you where that line falls on your property before you commit to a design that crosses it.'
    ],
    hoods: 'Point Dume, Malibu Colony, Carbon Beach, Big Rock, Las Flores, Malibu Park and the Zuma-adjacent streets.',
    permitBody: 'Malibu issues its own building permits, and a great deal of work here also requires a coastal development permit. Septic-served properties add an onsite wastewater review, and fire-zone construction standards apply almost everywhere in the city.',
    permitBullets: [
      '<strong>City of Malibu plan check</strong> - independent of LA City and LA County, with its own standards and its own timeline.',
      '<strong>Coastal development permits</strong> commonly apply to exterior alterations and anything that changes the building envelope. Interior-only scopes are usually far simpler.',
      '<strong>Most Malibu properties are on private septic (OWTS),</strong> so added bathrooms or fixtures can trigger a wastewater capacity review - the single most overlooked item in a Malibu bathroom addition.',
      '<strong>Very high fire hazard zone standards</strong> drive ignition-resistant exterior materials, ember-resistant vents and rated glazing.'
    ],
    notes: [
      { h: 'Adding a bathroom is a septic question first', p: 'On a septic-served property, new fixtures can exceed the system’s permitted capacity. That is a wastewater review, potentially a system upgrade, and a real cost - we raise it during the estimate rather than after the tile is ordered.' },
      { h: 'Interior stays simple, exterior does not', p: 'A kitchen or bathroom kept entirely inside the existing envelope avoids most of the coastal process. Move a window or change a roofline and the review changes completely. We show you exactly where that boundary sits on your project.' },
      { h: 'Distance is part of the schedule', p: 'Malibu is a long haul from most trades and suppliers. We schedule crews in full days rather than partial ones and stage materials on site, because half-day trips up the coast are how a Malibu project quietly loses a month.' }
    ],
    services: {
      rebuild: 'Ground-up rebuilds and smoke and heat damage renovation, planned around Malibu’s coastal, septic and fire-zone requirements together.',
      kitchen: 'Kitchens kept inside the existing envelope where possible, to stay clear of the longest parts of the coastal process.',
      bathroom: 'Bathroom remodels and additions planned around the property’s septic capacity before anything is designed.',
      adu: 'ADUs and garage conversions on Malibu parcels, planned against coastal, septic and fire-zone requirements together.',
      home: 'Whole-home renovations where permitting is genuinely a project phase, planned and scheduled as one.'
    },
    faqs: [
      { q: 'Do I need a coastal permit to remodel in Malibu?', a: 'It depends on what you are changing. Interior-only remodels frequently avoid it, while exterior alterations, envelope changes and new structures commonly require a coastal development permit. We check your parcel and scope against the city’s requirements before design, because the answer changes the timeline more than it changes the price.' },
      { q: 'Can I add a bathroom to a Malibu home on septic?', a: 'Sometimes, but it is a wastewater question before it is a construction question. Most Malibu properties use private onsite systems with permitted capacity, and new fixtures can exceed it - which means a review and possibly a system upgrade. We establish that first so nobody designs a bathroom the property cannot legally support.' },
      { q: 'Why do Malibu projects take so long to permit?', a: 'Because several approvals stack: city plan check, coastal review where it applies, onsite wastewater review on septic properties, and fire-zone construction standards. Each is reasonable on its own; together they routinely make permitting longer than construction. We give you a realistic schedule up front rather than an optimistic one.' }
    ],
    gallery: ['/images/home-remodel/home-remodel-2.jpg', '/images/bathroom/bathroom-5.jpg', '/images/kitchen/kitchen-2.jpg'],
    nearby: ['pacific-palisades', 'bel-air', 'marina-del-rey', 'beverly-hills']
  },

  {
    slug: 'inglewood',
    name: 'Inglewood',
    title: 'Remodeling Contractor in Inglewood | New Cali Construction',
    desc: 'Inglewood remodeling contractor - 1920s Spanish homes, post-war bungalows, duplex and rental renovations. City permits handled. Free estimate. Lic #1008892.',
    heroSub: '1920s Spanish, post-war bungalows and income property - remodels priced for what the house is actually for.',
    heroImg: '/images/kitchen/kitchen-8.jpg',
    introImg: '/images/bathroom/bathroom-10.jpg',
    intro: [
      'Inglewood has two housing stories running side by side. There are the 1920s and 1930s Spanish Revival and Craftsman homes with details worth keeping - arched openings, coved plaster, original hardwood - and there are the post-war bungalows and small multifamily buildings that make up much of the rest. What is right for one is wrong for the other, and the difference is not budget, it is intent.',
      'Inglewood is also the neighborhood where we most often work for owners rather than occupants: duplexes, fourplexes and rentals being brought up to standard between tenants. Those projects are judged on cost per unit and days out of service, not on showroom finishes. We scope them that way - durable materials, sequenced trades, a hard end date - and we scope owner-occupied restorations completely differently.'
    ],
    hoods: 'Morningside Park, Fairview Heights, North Inglewood, Centinela, Darby-Dixon and the blocks around the stadium district.',
    permitBody: 'Inglewood is an independent city and issues its own building permits through its Building and Safety division. Multi-unit and rental work brings additional requirements that single-family projects do not face.',
    permitBullets: [
      '<strong>City of Inglewood plan check and inspections</strong> - separate from LA City and LA County processes.',
      '<strong>Verify the legal unit count</strong> before renovating a duplex or fourplex. What is on the ground and what is on record do not always match, and that gets resolved at permit, not at sale.',
      '<strong>Pre-1978 housing means lead-safe work practices,</strong> which applies to a large share of Inglewood’s stock.',
      '<strong>Rental work has tenant-facing requirements</strong> around notice, habitability and scheduling - we plan the sequence around them.'
    ],
    notes: [
      { h: 'Original details are worth keeping', p: 'On a 1920s Spanish, the arches, plaster and original wood are the reason the house is desirable. We restore and work around them where the budget allows rather than gutting to bare studs because it is faster for us.' },
      { h: 'Rentals are priced on downtime', p: 'For income property the real cost is vacancy. We sequence trades tightly, order long-lead items before demolition and commit to a completion date, because two extra weeks on site is two weeks of lost rent.' },
      { h: 'Systems before surfaces', p: 'A lot of Inglewood housing has had cosmetic work layered over aging panels, drains and roofs. We tell you when the money belongs in the systems first - even though the kitchen is what you called about.' }
    ],
    services: {
      kitchen: 'Kitchens for owner-occupied restorations and for turnovers - two different specifications, priced honestly as such.',
      bathroom: 'Bathroom remodels in period homes and durable, fast-turnaround bathrooms for rental units.',
      adu: 'Garage conversions and detached ADUs adding a rentable unit on Inglewood lots, permitted through the city.',
      home: 'Whole-house renovations of Spanish Revival and Craftsman homes, and full repositioning of small multifamily property.'
    },
    faqs: [
      { q: 'Do you renovate rental and multifamily property in Inglewood?', a: 'Yes, and we price it differently than an owner-occupied remodel. Turnover work is judged on cost per unit and days out of service, so we sequence trades tightly, order long-lead items before demolition and commit to a completion date. Durability of finish matters more than showroom specification.' },
      { q: 'Who issues permits in Inglewood?', a: 'The City of Inglewood, through its own Building and Safety division. Inglewood is an independent city, so LADBS is not involved. On multi-unit properties we also verify the legal unit count on record before design - unpermitted conversions surface at permit time and are far cheaper to address before construction.' },
      { q: 'Is it worth restoring an older Inglewood home instead of gutting it?', a: 'Frequently, yes. Arched openings, coved plaster and original hardwood in 1920s and 1930s homes are a large part of the property’s appeal and are expensive to reproduce. We will tell you which details are worth protecting and which are past saving, then price the work to match your actual goal for the house.' }
    ],
    gallery: ['/images/kitchen/kitchen-1.jpg', '/images/bathroom/bathroom-3.jpg', '/images/home-remodel/home-remodel-5.jpg'],
    nearby: ['hawthorne', 'westchester', 'el-segundo', 'mid-city']
  },

  {
    slug: 'bel-air',
    name: 'Bel Air',
    title: 'Remodeling Contractor in Bel Air | New Cali Construction',
    desc: 'Bel Air remodeling contractor - hillside estates, canyon access, LADBS permits and private HOA review handled. Free estimate. Lic #1008892.',
    heroSub: 'Hillside estates on canyon roads - where access, engineering and review add more to a project than the finishes do.',
    heroImg: '/images/home-remodel/home-remodel-4.jpg',
    introImg: '/images/kitchen/kitchen-4.jpg',
    intro: [
      'Bel Air is hillside building, with everything that implies. Lots are steep, streets are narrow and winding, and homes run from 1930s estates through 1960s post-and-beam to recent contemporary builds. The house is often the straightforward part; getting materials, equipment and crews to it safely is what shapes the schedule and a good share of the cost.',
      'Los Angeles applies hillside standards to this terrain, which means grading limits, drainage requirements, retaining design and frequently a soils or geology report on structural work. On top of the city process, many Bel Air properties are subject to private association or CC&R review. We establish which of those apply to your parcel before design, because designing first and discovering the constraints later is the expensive order to do it in.'
    ],
    hoods: 'East Gate and West Gate Bel Air, Bel Air Crest, Stone Canyon, the Roscomare corridor and the Beverly Glen approaches.',
    permitBody: 'Bel Air is within the City of Los Angeles, so permits go through LADBS under the city’s hillside provisions. Many properties additionally fall under private homeowner association or CC&R review, which is a separate approval from the city’s.',
    permitBullets: [
      '<strong>LADBS hillside review</strong> covering grading, drainage, retaining structures and, on most structural work, engineering and soils reporting.',
      '<strong>Private association or CC&R review</strong> applies to many Bel Air properties. We confirm what governs your parcel before plans are drawn.',
      '<strong>Haul routes and staging need approval and planning</strong> on canyon streets - truck size, turnarounds and neighbor access are all constraints.',
      '<strong>Fire-zone construction standards</strong> apply across much of the hillside, affecting exterior materials, vents and glazing.'
    ],
    notes: [
      { h: 'Access is a line item', p: 'When a concrete truck cannot reach the pad and material moves by smaller vehicle or by hand, labor hours climb in a way that has nothing to do with finish level. We walk the access route before quoting and price it openly instead of hiding it in contingency.' },
      { h: 'Drainage is not an afterthought', p: 'On hillside lots water management is a structural concern. Remodels that change hardscape, roofs or grading need the drainage rethought, and the city will look at it. Doing it properly is far cheaper than repairing a slope failure.' },
      { h: 'Two approvals, not one', p: 'City plan check and private association review run on different calendars with different priorities. We sequence both from the start so they overlap rather than stack, which is usually worth weeks.' }
    ],
    services: {
      rebuild: 'Ground-up rebuilds and fire damage renovation on hillside lots, engineered for slope and access and built to fire-zone standards.',
      kitchen: 'Estate kitchens with custom millwork and integrated appliances, structural changes engineered for hillside conditions.',
      bathroom: 'Primary suites and guest baths built to a high finish standard, with ventilation and waterproofing detailed properly.',
      adu: 'Guest houses and ADUs on hillside lots, engineered for slope, access and fire-zone requirements.',
      home: 'Whole-home renovations where structure, systems, drainage and finishes are managed under a single contract and schedule.'
    },
    faqs: [
      { q: 'What makes a Bel Air remodel different from a flat-lot project?', a: 'Access and engineering. Narrow canyon streets limit truck size and staging, hillside standards bring grading, drainage and retaining requirements, and structural work commonly needs soils or geology reporting. None of that shows up in the finished kitchen, but all of it shows up in the schedule and the price - so we quote it explicitly.' },
      { q: 'Does Bel Air have its own approval process besides the city?', a: 'Many Bel Air properties are subject to private homeowner association or CC&R review in addition to LADBS permits. Which applies depends on your parcel. We confirm it before design work begins, and we run the city and private tracks in parallel where possible rather than one after the other.' },
      { q: 'Can I build a guest house or ADU on a Bel Air lot?', a: 'Often yes, but slope, access and fire-zone requirements shape what is buildable and what it costs far more than lot size does. We assess the site, the access route and the applicable overlays first, then give you a realistic range before you commission any design.' }
    ],
    gallery: ['/images/kitchen/kitchen-1.jpg', '/images/bathroom/bathroom-2.jpg', '/images/home-remodel/home-remodel-2.jpg'],
    nearby: ['beverly-hills', 'pacific-palisades', 'west-la', 'malibu']
  },

  {
    slug: 'hawthorne',
    name: 'Hawthorne',
    title: 'Remodeling Contractor in Hawthorne | New Cali Construction',
    desc: 'Hawthorne remodeling contractor - kitchens, bathrooms, garage conversions and ADUs on post-war South Bay homes. City permits handled. Lic #1008892.',
    heroSub: 'Post-war South Bay homes on straightforward lots - the best value-per-dollar ADU and addition work we do.',
    heroImg: '/images/adu/adu-1.jpg',
    introImg: '/images/adu/adu-6.jpg',
    intro: [
      'Hawthorne is mostly 1940s and 1950s single-family homes on regular, workable lots, with pockets of newer townhome development. It is straightforward housing - no hillsides, no coastal overlay, no historic districts to negotiate - which means more of every dollar goes into the actual construction instead of into approvals and engineering.',
      'That is why so much of our Hawthorne work is ADUs and additions rather than pure cosmetics. A detached unit or a converted garage here typically pencils better than in the coastal neighborhoods a few miles west, because the site work is simpler and the permitting path is shorter. Homeowners adding a rental unit or housing family generally get more finished square footage per dollar in Hawthorne than anywhere else we build.'
    ],
    hoods: 'Holly Glen, Bodger Park, Ramona, the Hawthorne Boulevard corridor and the townhome developments near the eastern edge of the city.',
    permitBody: 'Hawthorne is an independent city with its own Building and Safety division issuing permits and running inspections. The process is more direct than LA City’s, which is a real advantage on ADU and addition timelines.',
    permitBullets: [
      '<strong>City of Hawthorne plan check and inspections</strong> - not LADBS, and generally a shorter path than a comparable LA City submittal.',
      '<strong>State ADU law applies here as everywhere in California,</strong> and Hawthorne’s regular lots make garage conversions and detached units unusually workable.',
      '<strong>1950s service panels and original plumbing</strong> are the usual upgrade items - identified during the estimate, not mid-project.',
      '<strong>Pre-1978 homes require lead-safe work practices,</strong> which covers most of the city’s single-family stock.'
    ],
    notes: [
      { h: 'Your money goes further here', p: 'No hillside engineering, no coastal review, no historic overlay. On a like-for-like scope a Hawthorne project usually carries less soft cost than the same job in Malibu or the Palisades - which means more of the budget ends up as finished work.' },
      { h: 'ADUs actually pencil', p: 'Flat, regular lots with existing detached garages are the ideal ADU starting point. We model the conversion against a new detached build with real numbers, including what each does to the rest of your yard.' },
      { h: 'Do the systems while walls are open', p: 'Panel, supply lines and insulation are cheap to address during a remodel and expensive afterwards. On 1950s Hawthorne homes that is usually the highest-return money in the whole project.' }
    ],
    services: {
      kitchen: 'Post-war kitchens opened up and modernized, with the electrical brought up to what a current kitchen actually draws.',
      bathroom: 'Bathroom remodels and second-bath additions in one- and two-bath houses, priced around the plumbing route.',
      adu: 'Garage conversions and detached ADUs - the strongest cost-per-square-foot ADU work in our service area.',
      home: 'Whole-house remodels and additions where structure, systems and finishes are handled in one contract.'
    },
    faqs: [
      { q: 'Is an ADU cheaper to build in Hawthorne?', a: 'Usually, yes. Flat regular lots mean no hillside engineering, there is no coastal review, and the city’s permitting path is more direct than LA City’s. The construction itself costs what it costs, but the soft costs and site work are lower - which is why ADUs pencil better here than a few miles toward the coast.' },
      { q: 'Who issues permits in Hawthorne?', a: 'The City of Hawthorne, through its own Building and Safety division. It is an independent city, so LADBS has no role. We file with the city, meet the inspectors and work under California Contractor License #1008892.' },
      { q: 'What should I fix first in a 1950s Hawthorne house?', a: 'Almost always the systems. Original 100-amp panels, aging supply lines and absent insulation are the items that limit what the house can do and cost the most to address later. If the walls are open for a kitchen or bathroom anyway, that is the cheapest hour these upgrades will ever be.' }
    ],
    gallery: ['/images/adu/adu-3.jpg', '/images/adu/adu-7.jpg', '/images/kitchen/kitchen-8.jpg'],
    nearby: ['inglewood', 'el-segundo', 'westchester', 'mar-vista']
  },

  {
    slug: 'mid-city',
    name: 'Mid City',
    title: 'Remodeling Contractor in Mid City, Los Angeles | New Cali Construction',
    desc: 'Mid City LA remodeling contractor - 1920s Spanish and Craftsman homes, HPOZ-adjacent blocks, full renovations. Free estimate. Lic #1008892.',
    heroSub: '1920s Spanish and Craftsman homes with details worth saving - and older systems that need replacing behind them.',
    heroImg: '/images/bathroom/bathroom-4.jpg',
    introImg: '/images/bathroom/bathroom-9.jpg',
    intro: [
      'Mid City is period housing. Much of the area went up in the 1920s and 1930s - Spanish Colonial Revival, Craftsman and early Traditional homes with arched doorways, coved ceilings, original casement windows and hardwood floors that are genuinely hard to reproduce today. The buying decision for most of our clients here was those details, which makes them a design constraint and not an obstacle.',
      'Behind the plaster it is a different story. Ninety-year-old houses arrive with undersized electrical services, galvanized supply lines, cast-iron drains near the end of their life and, in a few cases, original knob-and-tube branches. The Mid City remodel that works keeps what is worth keeping at the surface and quietly replaces everything behind it - and it is priced that way from the beginning.'
    ],
    hoods: 'Picfair Village, Faircrest Heights, Wilshire Vista, the Little Ethiopia blocks along Fairfax, and the streets bordering the Carthay historic districts.',
    permitBody: 'Mid City is a City of Los Angeles neighborhood, so permits go through LADBS. Several nearby districts - the Carthay neighborhoods among them - are Historic Preservation Overlay Zones, where exterior changes get an additional review. Whether that applies is a block-by-block question.',
    permitBullets: [
      '<strong>LADBS permits and inspections</strong> for structural, electrical, plumbing and mechanical work.',
      '<strong>HPOZ review may apply</strong> if your property sits inside one of the nearby historic districts. It governs exterior changes and windows in particular - we confirm your parcel before design.',
      '<strong>Pre-1978 housing means lead-safe practices,</strong> which covers essentially all of Mid City’s original stock.',
      '<strong>Electrical service upgrades are near-universal</strong> on these homes before a modern kitchen load will pass inspection.'
    ],
    notes: [
      { h: 'Keep the surface, replace the guts', p: 'Coved plaster, arches and original wood are why the house is worth what it is. We protect and restore those while replacing the wiring, plumbing and insulation behind them - more careful work than a gut job, and worth it on this housing stock.' },
      { h: 'Original windows are a decision, not a default', p: 'In an HPOZ, replacing period windows may not be permitted at all; outside one, restoring them is often better value than replacing. We check which situation you are in before anyone quotes new windows.' },
      { h: 'Cast iron has a shelf life', p: 'Original drain lines in 1920s homes are frequently at end of life. If we have the floor or walls open, replacing them is a fraction of what it costs as an emergency later - and we would rather show you the camera footage than argue about it.' }
    ],
    services: {
      kitchen: 'Period-sympathetic kitchens - modern function and appliances without stripping the character out of a 1920s house.',
      bathroom: 'Bathroom renovations that keep the era’s proportions and detailing while bringing waterproofing and ventilation to current standard.',
      adu: 'Garage conversions and detached ADUs on Mid City lots, permitted through LADBS with HPOZ constraints checked first.',
      home: 'Whole-house renovations of Spanish and Craftsman homes - restoration at the surface, full replacement behind it.'
    },
    faqs: [
      { q: 'Is my Mid City home in a historic district?', a: 'It depends on the block. Several districts near Mid City - the Carthay neighborhoods among them - are Historic Preservation Overlay Zones, where exterior alterations and window replacement get additional review. We verify your specific parcel before design, because an HPOZ changes what is possible outside far more than it changes the inside.' },
      { q: 'Can I modernize a 1920s house without ruining its character?', a: 'That is the normal brief here, and it is very doable. Coved plaster, arched openings and original wood stay and get restored; wiring, plumbing, insulation and ventilation get replaced behind them. It is more careful work than a gut renovation, and on this housing stock it is what protects the value you paid for.' },
      { q: 'What hidden costs come up in Mid City renovations?', a: 'Three recur: an undersized electrical service that must be upgraded before modern kitchen circuits pass, galvanized supply lines that should be replaced while walls are open, and cast-iron drains at the end of their life. We inspect for all three during the estimate so they are priced in writing rather than raised as change orders.' }
    ],
    gallery: ['/images/kitchen/kitchen-2.jpg', '/images/bathroom/bathroom-5.jpg', '/images/home-remodel/home-remodel-2.jpg'],
    nearby: ['west-la', 'beverly-hills', 'inglewood', 'mar-vista']
  }
];

/* -------------------------------------------------------------- template - */

const byslug = Object.fromEntries(CITIES.map(c => [c.slug, c]));
const esc = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;');
const ld = o => JSON.stringify(o, null, 2);

const HEAD_COMMON = `<meta charset="UTF-8">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

const HEAD_TAIL = `<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/area.css">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CTDZK0PE64"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-CTDZK0PE64');
</script>
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>emailjs.init('XaRbQXuY4FSpEz0aE');</script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  function send(evt, label) {
    if (typeof gtag === 'function') {
      gtag('event', evt, {'event_category':'engagement','event_label':label});
    }
  }
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
    a.addEventListener('click', function(){ send('phone_click', (a.textContent.trim() || a.href)); });
  });
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function(a){
    a.addEventListener('click', function(){ send('whatsapp_click', 'floating_whatsapp'); });
  });
});
</script>`;

const NAV = `<nav>
  <a href="/" class="nav-logo-link">
    <img width="300" height="300" class="nav-logo-img" src="/images/shared/newcali-logo.jpg" alt="New Cali Construction Logo">
    <div class="nav-logo-text">
      <span class="nav-logo-name">New Cali Construction</span>
      <span class="nav-logo-sub">Culver City, CA<br>Lic #1008892</span>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/index.html#services">Services</a></li>
    <li><a href="/areas/">Service Areas</a></li>
    <li><a href="/portfolio.html">Portfolio</a></li>
    <li><a href="/index.html#testimonials">Reviews</a></li>
    <li><a href="/blog/">Blog</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <div class="nav-right">
    <a href="tel:8002161005" class="nav-phone">(800) 216-1005</a>
    <a href="#contact" class="btn-nav">Free Estimate</a>
  </div>
  <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="/" onclick="closeMenu()">Home</a>
  <a href="/index.html#services" onclick="closeMenu()">Services</a>
  <a href="/areas/" onclick="closeMenu()">Service Areas</a>
  <a href="/portfolio.html" onclick="closeMenu()">Portfolio</a>
  <a href="/index.html#testimonials" onclick="closeMenu()">Reviews</a>
  <a href="/blog/" onclick="closeMenu()">Blog</a>
  <a href="#contact" onclick="closeMenu()">Contact</a>
  <a href="tel:8002161005">(800) 216-1005</a>
</div>
<script>
function toggleMenu(){
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMenu(){
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
}
document.addEventListener('click', function(e){
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('hamburger');
  if(menu && burger && !menu.contains(e.target) && !burger.contains(e.target)){
    closeMenu();
  }
});
</script>`;

const TRUST = `<div class="trust">
  <div class="trust-item">✓ <strong>Licensed, Bonded &amp; Insured</strong> · Lic #1008892</div>
  <div class="trust-item">★ <strong>50+ Five-Star Reviews</strong></div>
  <div class="trust-item">🏠 <strong>500+ Projects</strong> Since 2015</div>
  <div class="trust-item">📄 <strong>Written Scope. Locked Price.</strong></div>
</div>`;

const footer = () => `<footer>
  <div class="foot-top">
    <div class="foot-brand">
      <h3>New Cali Construction</h3>
      <small>Lic # 1008892 · Bonded &amp; Insured · © 2026</small>
      <p>Premium kitchen, bathroom &amp; ADU remodeling across the Westside. No hidden fees. No endless delays. Just beautiful results.</p>
    </div>
    <div class="foot-col">
      <h4>Our Services</h4>
      <a href="/kitchen.html">Kitchen Remodeling</a>
      <a href="/bathroom.html">Bathroom Remodeling</a>
      <a href="/adu.html">ADU / Garage Conversion</a>
      <a href="/home-remodel.html">Home Remodel</a>
      <a href="/fire-rebuild.html">Fire Rebuild &amp; Smoke Damage</a>
    </div>
    <div class="foot-col">
      <h4>Service Areas</h4>
      <a href="/areas/">All Service Areas</a>
${CITIES.slice(0, 5).map(c => `      <a href="/areas/${c.slug}/">${c.name}</a>`).join('\n')}
    </div>
  </div>
  <div class="foot-bot">
    <span>© 2026 New Cali Construction Inc. All Rights Reserved.</span>
    <span>Garage Conversions · Kitchen Remodeling · Room Additions · Bathroom Renovation</span>
    <a href="/privacy-policy.html" style="color:rgba(255,255,255,.42);text-decoration:none">Privacy Policy</a>
  </div>
</footer>`;

const WA_AND_A11Y = `<div class="wa-wrap">
  <div class="wa-note">
    <span class="wa-label">For a quick response</span>
    <span style="font-size:20px;">👉</span>
  </div>
  <a href="https://wa.me/17149289011" target="_blank" rel="noopener" class="wa-float" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
</div>
<button id="a11y-btn" aria-label="Accessibility options" onclick="toggleA11y()">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 9H5l2 2h4v3l-3 7h2l2.5-5.5L15 21h2l-3-7v-3h4z"/></svg>
</button>
<div id="a11y-panel" role="dialog" aria-label="Accessibility options">
  <h4>Accessibility</h4>
  <div class="a11y-size-row">
    <span>Text Size</span>
    <div class="a11y-size-btns">
      <button class="a11y-size-btn" onclick="a11ySize(-1)" aria-label="Decrease text size">A-</button>
      <button class="a11y-size-btn" onclick="a11ySize(1)" aria-label="Increase text size">A+</button>
    </div>
  </div>
  <div class="a11y-row">
    <label for="a11y-contrast">High Contrast</label>
    <label class="a11y-toggle"><input type="checkbox" id="a11y-contrast" onchange="a11yFilter()"><span class="a11y-slider"></span></label>
  </div>
  <div class="a11y-row">
    <label for="a11y-links">Underline Links</label>
    <label class="a11y-toggle"><input type="checkbox" id="a11y-links" onchange="a11yLinks(this)"><span class="a11y-slider"></span></label>
  </div>
  <div class="a11y-row">
    <label for="a11y-gray">Grayscale</label>
    <label class="a11y-toggle"><input type="checkbox" id="a11y-gray" onchange="a11yFilter()"><span class="a11y-slider"></span></label>
  </div>
</div>
<script>
(function(){
  var panelOpen=false,fs=0;
  window.toggleA11y=function(){
    panelOpen=!panelOpen;
    document.getElementById('a11y-panel').classList.toggle('open',panelOpen);
  };
  document.addEventListener('click',function(e){
    if(panelOpen&&!document.getElementById('a11y-panel').contains(e.target)&&e.target.id!=='a11y-btn'){
      panelOpen=false;document.getElementById('a11y-panel').classList.remove('open');
    }
  });
  window.a11ySize=function(d){
    fs=Math.max(-3,Math.min(5,fs+d));
    document.documentElement.style.fontSize=(100+fs*10)+'%';
  };
  window.a11yFilter=function(){
    var f=[];
    if(document.getElementById('a11y-contrast').checked)f.push('contrast(1.6)');
    if(document.getElementById('a11y-gray').checked)f.push('grayscale(100%)');
    document.body.style.filter=f.join(' ');
  };
  window.a11yLinks=function(el){
    var s=document.getElementById('a11y-links-style');
    if(!s){s=document.createElement('style');s.id='a11y-links-style';document.head.appendChild(s);}
    s.textContent=el.checked?'a{text-decoration:underline!important;}':'';
  };
})();
</script>`;

const contactForm = city => `<div id="contact" class="area-sec area-sec-alt">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Get in Touch</p>
      <h2 class="area-h2">Get a Free ${esc(city.name)} <em>Estimate</em></h2>
      <p class="area-lead">Free in-home consultation, a written line-item scope, and a locked price. No pressure, ever.</p>
    </div>
    <div class="area-form-box" id="cform">
      <form id="contactForm" onsubmit="submitForm(event)">
        <input type="hidden" name="access_key" value="3f2d97e0-cedd-4b40-9bfc-72cab8332e94">
        <input type="hidden" name="subject" value="New Lead (${esc(city.name)}) - New Cali Construction Website">
        <input type="hidden" name="service_area" value="${esc(city.name)}">
        <div class="form-row">
          <div class="fg"><label>First Name</label><input type="text" name="first_name" id="fn" placeholder="John" required></div>
          <div class="fg"><label>Last Name</label><input type="text" name="last_name" placeholder="Smith"></div>
        </div>
        <div class="fg"><label>Email</label><input type="email" name="email" id="em" placeholder="john@email.com" required></div>
        <div class="fg"><label>Phone</label><input type="tel" name="phone" placeholder="(310) 555-0000"></div>
        <div class="fg"><label>Project ZIP Code</label><input type="text" name="zip" inputmode="numeric" placeholder="90232"></div>
        <div class="fg">
          <label>What project are you interested in?</label>
          <select name="project" id="proj">
            <option value="">Choose an option</option>
${(city.extraFormOptions || []).map(o => `            <option>${esc(o)}</option>`).join('\n')}${city.extraFormOptions ? '\n' : ''}            <option>Kitchen Remodeling</option>
            <option>Bathroom Remodeling</option>
            <option>ADU / Garage Conversion</option>
            <option>Complete Home Remodel</option>
            <option>Other</option>
          </select>
        </div>
        <div class="fg"><label>Message</label><textarea name="message" placeholder="Tell us about your ${esc(city.name)} project..."></textarea></div>
        <button type="submit" class="form-btn">Send Message</button>
      </form>
    </div>
    <div class="area-form-box" id="formOk" style="display:none;text-align:center;">
      <div style="font-size:44px;margin-bottom:12px">🎉</div>
      <h4 style="font-family:Merriweather,serif;font-size:20px;color:var(--green-dk);margin-bottom:6px;">Thanks for reaching out!</h4>
      <p style="color:var(--muted);font-size:14px;margin-bottom:18px;">We received your message and will get back to you within a few hours - weekdays and weekends.</p>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px;">Want a faster response?</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="tel:8002161005" style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:var(--green);color:white;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">📞 (800) 216-1005</a>
        <a href="https://wa.me/17149289011" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:#25D366;color:white;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">💬 WhatsApp Us</a>
      </div>
    </div>
  </div>
</div>
<script>
/* Customer autoresponder. This is also the only trace the lost-lead watchdog
   can match when the Web3Forms notification gets quarantined upstream, so every
   form on the site must send it. Failures are logged, never swallowed. */
function sendAutoresponder(data) {
  if (typeof emailjs === 'undefined') { console.error('Autoresponder skipped: EmailJS not loaded'); return; }
  emailjs.send('service_eql2h4h', 'template_blfuq5c', {
    first_name: data.get('first_name') || data.get('name') || 'there',
    email: data.get('email'),
    project: data.get('project') || ''
  }).catch(function(err){ console.error('Autoresponder failed:', err); });
}

async function submitForm(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...'; btn.disabled = true;
  try {
    var data = new FormData(e.target);
    var res = await fetch('https://api.web3forms.com/submit', { method:'POST', body: data });
    var json = await res.json();
    if (json.success) {
      document.getElementById('cform').style.display = 'none';
      document.getElementById('formOk').style.display = 'block';
      if (typeof gtag === 'function') {
        gtag('event', 'form_submit_success', {'event_category':'conversion','event_label':'contact_form_${city.slug}'});
      }
      sendAutoresponder(data);
    } else { btn.textContent='Send Message'; btn.disabled=false; alert('Please try again or call (800) 216-1005.'); }
  } catch(err) { btn.textContent='Send Message'; btn.disabled=false; alert('Please try again or call (800) 216-1005.'); }
}
</script>`;

const SERVICES = [
  { key: 'kitchen', label: 'Kitchen Remodeling', href: '/kitchen.html', img: '/images/kitchen/kitchen-2.jpg' },
  { key: 'bathroom', label: 'Bathroom Remodeling', href: '/bathroom.html', img: '/images/bathroom/bathroom-2.jpg' },
  { key: 'adu', label: 'ADU & Garage Conversion', href: '/adu.html', img: '/images/adu/adu-1.jpg' },
  { key: 'home', label: 'Whole-Home Remodel', href: '/home-remodel.html', img: '/images/home-remodel/home-remodel-2.jpg' },
  {
    key: 'rebuild',
    label: 'Fire Rebuild & Smoke Damage',
    href: '/fire-rebuild.html',
    img: '/images/home-remodel/home-remodel-1.jpg',
    feature: true,
    defaultLine: 'Ground-up rebuilds on total-loss lots, and renovation of homes left standing that took smoke, soot and heat damage. We read the insurance scope against what the city will actually require you to build, and put the gap in writing before you commit.'
  }
];

function cityPage(city) {
  const url = `${SITE}/areas/${city.slug}/`;

  const schemaBreadcrumb = ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${SITE}/areas/` },
      { '@type': 'ListItem', position: 3, name: city.name, item: url }
    ]
  });

  const schemaBusiness = ld({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    name: 'New Cali Construction Inc.',
    '@id': `${SITE}/`,
    url: `${SITE}/`,
    telephone: '+18002161005',
    email: 'Info@NewCaliConstruction.com',
    priceRange: '$$-$$$',
    description: `New Cali Construction is a licensed design-build remodeling contractor serving ${city.name} and the Westside of Los Angeles with kitchen remodels, bathroom renovations, ADU and garage conversions, and whole-home remodels.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '10000 Washington Blvd. Unit 600',
      addressLocality: 'Culver City',
      addressRegion: 'CA',
      postalCode: '90232',
      addressCountry: 'US'
    },
    geo: { '@type': 'GeoCoordinates', latitude: 34.0211, longitude: -118.3965 },
    areaServed: { '@type': 'Place', name: `${city.name}, CA` },
    // No aggregateRating. The value that used to sit here (4.9 from 50 reviews)
    // matched no review corpus we can point at, and self-serving ratings with no
    // Review objects behind them are exactly what Google's "review count without
    // object" error rejects. The verifiable CSLB credential goes out instead.
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'California Contractors State License Board License',
      identifier: '1008892',
      name: 'CSLB License 1008892, Class B General Building',
      recognizedBy: {
        '@type': 'GovernmentOrganization',
        name: 'California Contractors State License Board',
        url: 'https://www.cslb.ca.gov/'
      },
      validIn: { '@type': 'State', name: 'California' },
      dateCreated: '2015-11-12'
    },
    sameAs: [
      'https://www.yelp.com/biz/new-cali-construction-culver-city',
      'https://www.facebook.com/profile.php?id=61550646516784',
      'https://www.instagram.com/newcaliconstruction/'
    ]
  });

  const schemaService = ld({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Home Remodeling in ${city.name}`,
    serviceType: 'Home remodeling and general contracting',
    description: city.serviceDesc || `Kitchen remodeling, bathroom renovation, ADU and garage conversion, and whole-home remodeling for homeowners in ${city.name}, California. Written line-item scope, locked price, and weekly photo updates through completion.`,
    provider: {
      '@type': 'GeneralContractor',
      name: 'New Cali Construction Inc.',
      telephone: '+18002161005',
      email: 'Info@NewCaliConstruction.com',
      url: `${SITE}/`
    },
    areaServed: { '@type': 'City', name: city.name },
    url
  });

  const schemaFaq = ld({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: city.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
${HEAD_COMMON}
<title>${esc(city.title)}</title>
<meta name="description" content="${esc(city.desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(city.title)}">
<meta property="og:description" content="${esc(city.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${city.heroImg}">
<meta property="og:site_name" content="New Cali Construction">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(city.title)}">
<meta name="twitter:description" content="${esc(city.desc)}">
${HEAD_TAIL}
<script type="application/ld+json">
${schemaBreadcrumb}
</script>
<script type="application/ld+json">
${schemaBusiness}
</script>
<script type="application/ld+json">
${schemaService}
</script>
<script type="application/ld+json">
${schemaFaq}
</script>
</head>
<body>
${NAV}

<section class="area-hero" style="background-image:url('${city.heroImg}')">
  <div class="area-hero-inner">
    <nav class="area-crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> › <a href="/areas/">Service Areas</a> › <span>${esc(city.name)}</span>
    </nav>
    <h1>${esc(city.h1 || `Remodeling Contractor in ${city.name}`)}</h1>
    <p>${esc(city.heroSub)}</p>
    <div class="area-hero-btns">
      <a href="#contact" class="btn-green">Get a Free Estimate →</a>
      <a href="tel:8002161005" class="btn-wht">(800) 216-1005</a>
    </div>
  </div>
</section>

${TRUST}

<section class="area-sec">
  <div class="area-wrap">
    <div class="area-intro">
      <div>
        <p class="eyebrow">${esc(city.name)}, California</p>
        <h2 class="area-h2">${city.introH2 || `What remodeling in ${esc(city.name)} <em>actually involves</em>`}</h2>
${city.intro.map(p => `        <p class="area-lead">${esc(p)}</p>`).join('\n')}
        <a href="#contact" class="btn-green" style="margin-top:10px">Get a Free Estimate →</a>
      </div>
      <div class="area-intro-img">
        <img src="${city.introImg}" width="1200" height="800" alt="Remodeling work by New Cali Construction" loading="lazy">
        <div class="area-hoods">
          <h4>Where we work in ${esc(city.name)}</h4>
          <p>${esc(city.hoods)}</p>
        </div>
      </div>
    </div>
  </div>
</section>

${city.special ? `<section class="area-sec area-special">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">${esc(city.special.eyebrow)}</p>
      <h2 class="area-h2">${city.special.title}</h2>
      <p class="area-lead">${esc(city.special.lead)}</p>
    </div>
    <div class="area-notes">
${city.special.cards.map(c => `      <div class="area-note area-note-special">
        <h3>${esc(c.h)}</h3>
        <p>${esc(c.p)}</p>
      </div>`).join('\n')}
    </div>
    <p class="area-special-foot">${esc(city.special.foot)}</p>
  </div>
</section>

` : ''}<section class="area-sec area-sec-alt">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Our Services</p>
      <h2 class="area-h2">What we build in <em>${esc(city.name)}</em></h2>
    </div>
    <div class="area-svc-grid">
${SERVICES.map(s => `      <div class="area-svc-card${s.feature ? ' area-svc-card-feature' : ''}">
        <img src="${s.img}" width="1200" height="800" alt="${s.label} by New Cali Construction" loading="lazy">
        <div class="area-svc-body">
          <h3>${s.label} in ${esc(city.name)}</h3>
          <p>${esc(city.services[s.key] || s.defaultLine)}</p>
          <a class="area-svc-lnk" href="${s.href}">See ${s.label.toLowerCase()} →</a>
        </div>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="area-sec area-sec-pale">
  <div class="area-wrap">
    <div class="area-permit">
      <div>
        <p class="eyebrow">Permits &amp; Local Rules</p>
        <h2 class="area-h2">Who approves your project <em>in ${esc(city.name)}</em></h2>
        <p class="area-lead">${esc(city.permitBody)}</p>
      </div>
      <ul class="area-permit-list">
${city.permitBullets.map(b => `        <li>${b}</li>`).join('\n')}
      </ul>
    </div>
  </div>
</section>

<section class="area-sec">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Local Experience</p>
      <h2 class="area-h2">Three things we plan for on <em>every ${esc(city.name)} job</em></h2>
    </div>
    <div class="area-notes">
${city.notes.map((n, i) => `      <div class="area-note">
        <span class="area-note-n">0${i + 1}</span>
        <h3>${esc(n.h)}</h3>
        <p>${esc(n.p)}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="area-sec area-sec-alt">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Transparent Pricing</p>
      <h2 class="area-h2">Typical investment <em>ranges</em></h2>
      <p class="area-lead">Every ${esc(city.name)} project gets its own written, line-item quote. These ranges are for planning.</p>
    </div>
    <div class="area-price">
      <div class="area-price-card">
        <p class="area-price-tier">Refresh</p>
        <p class="area-price-range">$15K - $40K</p>
        <p class="area-price-note">Single-room refresh - bathroom, kitchen facelift, or flooring throughout. Typically 2-4 weeks.</p>
      </div>
      <div class="area-price-card">
        <p class="area-price-tier">Renovate</p>
        <p class="area-price-range">$40K - $120K</p>
        <p class="area-price-note">Full kitchen, primary suite, or multi-room remodel with layout changes. Typically 4-10 weeks.</p>
      </div>
      <div class="area-price-card">
        <p class="area-price-tier">Transform</p>
        <p class="area-price-range">$120K - $500K+</p>
        <p class="area-price-note">Whole-home remodel or ADU build, design through final inspection. Typically 3-6 months.</p>
      </div>
    </div>
    <p class="area-price-foot">${city.priceFoot || '<strong>Free estimates always.</strong> Every quote is line-item and locked in writing before work begins.'}</p>
  </div>
</section>

<section class="area-sec">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Recent Work</p>
      <h2 class="area-h2">Craftsmanship you can <em>look at</em></h2>
      <p class="area-lead">A sample of completed New Cali Construction projects across the Westside. <a href="/portfolio.html" style="color:var(--green);font-weight:600">See the full portfolio →</a></p>
    </div>
    <div class="area-gal">
${city.gallery.map(g => `      <img src="${g}" width="1200" height="800" alt="Completed remodel by New Cali Construction" loading="lazy">`).join('\n')}
    </div>
  </div>
</section>

<section class="area-sec area-sec-alt">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Common Questions</p>
      <h2 class="area-h2">${esc(city.name)} <em>FAQs</em></h2>
    </div>
    <div class="area-faq-list">
${city.faqs.map(f => `      <div class="area-faq-item">
        <h3 class="area-faq-q">${esc(f.q)}</h3>
        <p class="area-faq-a">${esc(f.a)}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="area-sec">
  <div class="area-wrap">
    <div class="area-cta">
      <h2>${esc(city.ctaTitle || `Building in ${city.name}? Let's talk.`)}</h2>
      <p>${esc(city.ctaSub || 'Free in-home consultation. Written line-item scope. Locked price before we start.')}</p>
      <div class="area-cta-btns">
        <a href="#contact" class="btn-wht">Get a Free Estimate</a>
        <a href="tel:8002161005" class="area-cta-phone">(800) 216-1005</a>
      </div>
    </div>
    <div style="text-align:center;margin-top:44px">
      <p class="eyebrow" style="margin-bottom:16px">We also work nearby</p>
      <div class="area-nearby">
${city.nearby.filter(s => byslug[s]).map(s => `        <a href="/areas/${s}/">${byslug[s].name}</a>`).join('\n')}
        <a href="/areas/">All service areas</a>
      </div>
    </div>
  </div>
</section>

${contactForm(city)}

${footer()}
${WA_AND_A11Y}
</body>
</html>
`;
}

/* ------------------------------------------------------------- hub page - */

function hubPage() {
  const url = `${SITE}/areas/`;
  const title = 'Service Areas | New Cali Construction - Westside Los Angeles';
  const desc = 'New Cali Construction remodels homes across Culver City and the Westside of Los Angeles. Find the local page for your city: permits, housing stock, and what a remodel there involves.';

  const schema = ld({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Service Areas',
    url,
    description: desc,
    hasPart: CITIES.map(c => ({
      '@type': 'WebPage',
      name: `Remodeling Contractor in ${c.name}`,
      url: `${SITE}/areas/${c.slug}/`
    }))
  });

  const crumbs = ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: url }
    ]
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
${HEAD_COMMON}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/home-remodel/home-remodel-1.jpg">
<meta property="og:site_name" content="New Cali Construction">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${HEAD_TAIL}
<script type="application/ld+json">
${crumbs}
</script>
<script type="application/ld+json">
${schema}
</script>
</head>
<body>
${NAV}

<section class="area-hero" style="background-image:url('/images/home-remodel/home-remodel-1.jpg')">
  <div class="area-hero-inner">
    <nav class="area-crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> › <span>Service Areas</span>
    </nav>
    <h1>Where We Build</h1>
    <p>We are based in Culver City and work across the Westside and South Bay. Every neighborhood below has its own permitting authority, its own housing stock and its own surprises - so each one has its own page.</p>
    <div class="area-hero-btns">
      <a href="#areas" class="btn-green">Find your area →</a>
      <a href="tel:8002161005" class="btn-wht">(800) 216-1005</a>
    </div>
  </div>
</section>

${TRUST}

<section class="area-sec" id="areas">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Service Areas</p>
      <h2 class="area-h2">Local pages, <em>not a list of city names</em></h2>
      <p class="area-lead">A remodel in Malibu and a remodel in Hawthorne have almost nothing in common once you get past the tile. These pages cover what changes: who issues the permit, what the houses are built like, and what we plan for before day one.</p>
    </div>
    <div class="hub-grid">
${CITIES.map(c => `      <a class="hub-card" href="/areas/${c.slug}/">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.heroSub)}</p>
        <span>View ${esc(c.name)} →</span>
      </a>`).join('\n')}
    </div>
    <p class="area-price-foot" style="margin-top:36px">Based in <strong>Culver City</strong> - see the <a href="/" style="color:var(--green);font-weight:600">main site</a> for our Culver City and greater Los Angeles work.</p>
  </div>
</section>

<section class="area-sec area-sec-alt">
  <div class="area-wrap">
    <div class="area-hdr-c">
      <p class="eyebrow">Our Services</p>
      <h2 class="area-h2">What we do <em>everywhere we work</em></h2>
    </div>
    <div class="area-svc-grid">
${SERVICES.map(s => `      <div class="area-svc-card${s.feature ? ' area-svc-card-feature' : ''}">
        <img src="${s.img}" width="1200" height="800" alt="${s.label} by New Cali Construction" loading="lazy">
        <div class="area-svc-body">
          <h3>${s.label}</h3>
          <p>${s.defaultLine || 'Licensed, permitted work with a written line-item scope, a locked price and weekly photo updates from demolition to final inspection.'}</p>
          <a class="area-svc-lnk" href="${s.href}">See ${s.label.toLowerCase()} →</a>
        </div>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="area-sec">
  <div class="area-wrap">
    <div class="area-cta">
      <h2>Not sure if we cover your street?</h2>
      <p>Call us. If we are not the right contractor for your area, we will say so.</p>
      <div class="area-cta-btns">
        <a href="#contact" class="btn-wht">Get a Free Estimate</a>
        <a href="tel:8002161005" class="area-cta-phone">(800) 216-1005</a>
      </div>
    </div>
  </div>
</section>

${contactForm({ name: 'Westside', slug: 'areas-hub' })}

${footer()}
${WA_AND_A11Y}
</body>
</html>
`;
}

/* ------------------------------------------------------------------ write - */

function write(relPath, contents) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
  console.log('wrote', relPath);
}

write('areas/index.html', hubPage());
for (const city of CITIES) {
  write(`areas/${city.slug}/index.html`, cityPage(city));
}
console.log(`\n${CITIES.length} city pages + hub built.`);
