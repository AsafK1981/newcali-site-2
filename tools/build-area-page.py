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


def render(slug):
    d = dict(CITIES[slug])
    faq = d.pop('FAQ')
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

    # A star rating we cannot source is both a Search Console error ("review
    # count without object") and a claim about the business we cannot stand
    # behind. Google flagged exactly this on 2026-08-29. Ship the CSLB
    # credential instead; put a rating back only when real Review objects,
    # with authors and dates, sit next to it on the same page.
    if 'aggregateRating' in html:
        raise SystemExit('%s: aggregateRating in output, banned without real Review objects' % slug)

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
