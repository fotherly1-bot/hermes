/**
 * Carp Fishing Tycoon - Angler System
 * Pool of anglers, bookings, satisfaction, and fishing match events.
 */

'use strict';

const Anglers = (function () {

    /**
     * Fishing match / competition event types.
     * anglerRange: [min, max] participants. Fee is per angler per day.
     * These book a large chunk of the lake for 1-2 days.
     */
    const MATCH_TYPES = [
        { id: 'club_match',      name: 'Local Carp Club Match',     anglerRange: [8,  12], durationDays: 1, feePerAngler: 14, repBonus: 15 },
        { id: 'charity_day',     name: 'Charity Fishing Day',       anglerRange: [10, 16], durationDays: 1, feePerAngler: 12, repBonus: 25 },
        { id: 'corporate',       name: 'Corporate Fishing Event',   anglerRange: [6,  10], durationDays: 1, feePerAngler: 30, repBonus: 10 },
        { id: 'regional_open',   name: 'Regional Open Match',       anglerRange: [14, 22], durationDays: 2, feePerAngler: 18, repBonus: 30 },
        { id: 'county_champ',    name: 'County Championship',       anglerRange: [18, 30], durationDays: 2, feePerAngler: 22, repBonus: 40 },
        { id: 'specimen_hunt',   name: 'Specimen Hunters Weekend',  anglerRange: [8,  14], durationDays: 2, feePerAngler: 25, repBonus: 20 }
    ];

    /** Base chance per day of a match request being generated. */
    var MATCH_CHANCE = 0.10;

    /**
     * UK-style angler names.
     */
    const ANGLER_POOL = [
        { id: 1,  name: 'Rod Hutchinson',   preferred: ['still', 'estate_lake'],     disliked: ['running'],     budget: 35, skill: 7,  socialMedia: 5,  photo: 'img/anglers/rod-hutchison.png', category: 'Professional',
          bio: 'One of the true legends of modern carp fishing. Rod pioneered particle fishing, bolt rigs, and synthetic bait flavours in the 1970s, reshaping how carp were targeted across Europe. A prolific writer and storyteller, his books and magazine columns inspired generations of anglers.',
          signatureCatch: 'A legendary 55lb mirror from Redmire Pool, fished using his own particle approach.',
          competitionsWon: ['National Angling Champion 1982', 'Redmire Syndicate Memorial 1978', 'European Carp Cup 1991'],
          notableWaters: ['Redmire Pool', 'Savay Lake', 'Pinetrees', 'North Harrow Colne Valley'],
          techniques: ['Particle Fishing', 'Bolt Rigs', 'Hair Rigs', 'Boilie Innovation'],
          legacy: 'Coined the phrase "where dreams are still alive." Revolutionised carp bait with Scopex, Monster Crab, and Robin Red. Credited with the first 12ft carp rod and the first written insight into fresh-wind carp movement.' },
        { id: 2,  name: 'Steve Briggs',     preferred: ['gravel_pit','estate_lake'],  disliked: ['still'],       budget: 50, skill: 9,  socialMedia: 8,  photo: 'img/anglers/steve-briggs.png', category: 'Professional',
          bio: 'A powerhouse on modern gravel pits, Steve Briggs is known for relentless work ethic and his uncanny ability to pattern fish under pressure. His fish-farming mindset transformed UK carp venues into high-output fisheries.',
          signatureCatch: 'A personal best 52lb common from Hallcroft Lake, landed on a tuned zig rig.',
          competitionsWon: ['UK Carp Open 2015', 'Gravel Pit Grand Prix 2017', 'Angling Times Masters 2019'],
          notableWaters: ['Hallcroft Lake', 'Lambourne', 'Chicory Lake'],
          techniques: ['Zig Rigs', 'D method Feeders', 'Boilie PVA Sticks'],
          legacy: 'Popularised the zig rig revolution on gravel pits. Mentored a generation of young specimen hunters through his carp school.' },
        { id: 3,  name: 'Terry Hearn',      preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 60, skill: 10, socialMedia: 10, targetHunter: true,  photo: 'img/anglers/terry-hearn.png', category: 'Professional',
          bio: 'The media face of carp fishing, Terry Hearn blends elite skill with television presence to bring carp strategies into living rooms across Britain. Known for meticulous swim selection and mental preparation.',
          signatureCatch: 'A stunning 58lb linear common from the Avenue, fished on a snowman rig.',
          competitionsWon: ['BBC Carp Challenge 2012', 'European Specimen Championship 2016', 'UK Angling Awards 2020'],
          notableWaters: ['The Avenue', 'Car Park Lake', 'Grahams Lake'],
          techniques: ['Snowman Rigs', 'Sticky Boilies', 'Marker Fishing'],
          legacy: 'Redefined carp fishing media through televised events and online masterclasses. Inspired thousands to take up specimen carp angling.' },
        { id: 4,  name: 'Ian Russell',      preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 30, skill: 6,  socialMedia: 4,  photo: 'img/anglers/ian-russell.png', category: 'Professional',
          bio: 'A method feeder virtuoso, Ian Russell has dominated UK commercial and carp leagues with a data-driven approach to feeding and presentation. His quiet intensity makes him a feared competitor.',
          signatureCatch: 'A 41lb mirror from Cranley Lake, caught on a heavy method feeder.',
          competitionsWon: ['Method Masters 2014', 'British Angling Championships 2018'],
          notableWaters: ['Cranley Lake', 'Oxford Canal', 'Bletchingley Lakes'],
          techniques: ['Method Feeders', 'Heavy Feeders', 'Balance Fishing'],
          legacy: 'Elevated method feeder fishing from match discipline to big-carp staple. His systematic feeding charts are still used by top match anglers today.' },
        { id: 5,  name: 'Danny Fairbrass',  preferred: ['gravel_pit','still'],        disliked: ['running'],     budget: 45, skill: 8,  socialMedia: 9,  targetHunter: true,  photo: 'img/anglers/danny-fairbrass.png', category: 'Professional',
          bio: 'As the founder of a renowned carp bait company, Danny Fairbrass understands fish psychology better than almost anyone. He bridges the gap between tackle design and on-the-water application.',
          signatureCatch: 'A 49lb catfish from the Cut, caught on a custom boilie.',
          competitionsWon: ['Bait Innovation Angler of the Year 2013', 'Specimen Cup 2017', 'European Night Fishing Derby 2019'],
          notableWaters: ['The Cut', 'B您 Lake', 'Dagenham Cut'],
          techniques: ['Boilie Design', 'Night Fishing', 'PVA Bags'],
          legacy: 'Created some of the most influential carp bait recipes of the last three decades. His testing protocols set the industry standard for quality control.' },
        { id: 6,  name: 'Ali Hamidi',       preferred: ['estate_lake','gravel_pit'],  disliked: ['still'],       budget: 55, skill: 9,  socialMedia: 8,  photo: 'img/anglers/ali-hamidi.png', category: 'Professional',
          bio: 'A cerebral angler with deep roots in Iraqi and UK fishing traditions, Ali Hamidi fuses old-world patience with modern technology. His GPS mapping and deep-water scouting are legendary.',
          signatureCatch: 'A rare 46lb leather carp from Lake of Sorrow, fished at 60 metres.',
          competitionsWon: ['Lake of Sorrow Open 2016', 'European Carp Cup 2018', 'British Specimen Classic 2021'],
          notableWaters: ['Lake of Sorrow', 'Lilymead', 'Whitmoor'],
          techniques: ['Deep Water Drifting', 'GPS Mapping', 'Boilie Snowmen'],
          legacy: 'Pioneered deep-water carp fishing on UK reservoirs. His GPS mapping techniques transformed how modern anglers locate and hold fish.' },
        { id: 7,  name: 'Alan Blair',       preferred: ['running','still'],           disliked: ['estate_lake'], budget: 40, skill: 7,  socialMedia: 6,  photo: 'img/anglers/alanb2.png', category: 'Professional',
          bio: 'A fly-fishing convert turned carp specialist, Alan Blair brings an unorthodox edge to specimen hunting. He is famous for barbless-only campaigns and catch-and-release advocacy.',
          signatureCatch: 'A 43lb common caught on the fly from a remote Scottish hill loch.',
          competitionsWon: ['Scottish Carp Championship 2015', 'Barbless Only Open 2018', 'Catch & Release Cup 2020'],
          notableWaters: ['Loch Lubnaig', 'Kennet & Avon Canal', 'Glenfore Loch'],
          techniques: ['Fly Fishing', 'Barbless Rigs', 'Stalking'],
          legacy: 'Led the barbless-only movement in British carp fishing. His catch-and-release ethic helped codify modern sustainable angling practices.' },
        { id: 8,  name: 'Mark Pitchers',    preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 25, skill: 5,  socialMedia: 3,  photo: 'img/anglers/mark-pitchers.png', category: 'Professional',
          bio: 'A grassroots carp hunter from the Home Counties, Mark Pitchers specialises in sneaky urban pits and easily overlooked venues. His no-fuss attitude and stealth approach consistently deliver big fish.',
          signatureCatch: 'A 38lb common from an unnamed Milton Keynes pit, fished under cover of darkness.',
          competitionsWon: ['Urban Angler Challenge 2017'],
          notableWaters: ['Milton Keynes Pits', 'Grand Union Canal', 'Raven Ghyl'],
          techniques: ['Stalking', 'Light Line', 'Pop-ups'],
          legacy: 'Proved that urban gravel pits still hold specimen fish worth chasing. His stealth tactics are now standard for venue-hopping anglers.' },
        { id: 9,  name: 'Kev Hewitt',       preferred: ['running','gravel_pit'],      disliked: ['estate_lake'], budget: 35, skill: 6,  socialMedia: 5,  photo: 'img/anglers/kev-hewitt.png', category: 'Professional',
          bio: 'Loud, proud, and fiercely competitive, Kev Hewitt is a match fishing icon who transitioned into carp and predator events. His energy on the bank is matched only by his results.',
          signatureCatch: 'A 35lb mirror hit on a dog biscuit waggler in a match.',
          competitionsWon: ['Worcester Cadbury Cup 2012', 'Match League Champion 2016', 'National Team Event 2019'],
          notableWaters: ['Severn Valley', 'Barnt Green', 'Droitwich Canals'],
          techniques: ['Waggler Fishing', 'Dog Biscuits', 'Floating Baits'],
          legacy: 'Brought showmanship back to competitive angling. His match broadcasts inspired a new generation of fan-facing tournament carp anglers.' },
        { id: 10, name: 'Rob Hughes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7,  photo: 'img/anglers/robhughes221.png', category: 'Professional',
          bio: 'A methodical specimen hunter, Rob Hughes spends more time on fish ethnicity and scale patterns than many biologists do. His notebooks are legendary, and his big-fish credentials are unmatched.',
          signatureCatch: 'A 55lb linear common from the Avenue, fished on a three-rod boilie presentation.',
          competitionsWon: ['Big Fish Challenge 2014', 'UK Linear Championship 2018', 'National Carp Championship 2020'],
          notableWaters: ['The Avenue', 'Lessers', 'Broadmoor Lake'],
          techniques: ['Boilie Rigging', 'Marker Spots', 'Pre-baiting'],
          legacy: 'His scale records and fish biography work advanced British carp biology. Many top carp anglers still study his legendary lake notebooks.' },
        { id: 11, name: 'Simon Crow',       preferred: ['gravel_pit','still'],        disliked: ['running'],     budget: 40, skill: 7,  socialMedia: 6,  photo: 'img/anglers/simoncrow22.png', category: 'Professional',
          bio: 'A laid-back West Country legend, Simon Crow combines old-school brolly fishing with sharp modern insights. He is equally at home on a tiny syndicate as he is on a vast estate lake.',
          signatureCatch: 'A 44lb mirror from the Carp Lake at Liphook, fished under a brolly.',
          competitionsWon: ['West Country Carp Classic 2015', 'Syndicate Masters 2018'],
          notableWaters: ['Liphook', 'Todber Manor', 'Mill Lake'],
          techniques: ['Brolly Fishing', 'Boilie Snowmen', 'Stalking'],
          legacy: 'Popularised brolly fishing on UK carp venues. His relaxed approach to high-pressure matches redefined mental preparation for big-carp anglers.' },
        { id: 12, name: 'Nigel Sharp',      preferred: ['estate_lake','gravel_pit'],  disliked: ['still'],       budget: 55, skill: 9,  socialMedia: 7,  photo: 'img/anglers/nigelsharp11.png', category: 'Professional',
          bio: 'A hardware innovator and avid tinkerer, Nigel Sharp designs his own lures and terminal tackle for specimen hunting. He believes every knot and hookbait should be optimised before cast one.',
          signatureCatch: 'A 47lb ghost common from the Big Lake, caught on a custom-rigged boilie.',
          competitionsWon: ['Tackle Innovation Award 2016', 'British Ghost Carp Championship 2019'],
          notableWaters: ['Big Lake', 'Rashs', 'Sumners'],
          techniques: ['Custom Rigs', 'Hooklink Aligners', 'Inline Leads'],
          legacy: 'Advanced hook and rig technology for specimen carp fishing. Many modern carp rigs trace their origin to his workshop modifications.' },
        { id: 13, name: 'Darrell Peck',     preferred: ['gravel_pit','running'],      disliked: ['still'],       budget: 45, skill: 8,  socialMedia: 8,  targetHunter: true, photo: 'img/anglers/darrellp112.png', category: 'Professional',
          bio: 'A nocturnal predator of the bank, Darrell Peck is at his best when the rest of the fishery is asleep. He specialises in extreme-distance casting and single-species targeting.',
          signatureCatch: 'A record 60lb common from the Main Stage, fished at 200 metres on a multi-rig.',
          competitionsWon: ['Distance Casting Champion 2017', 'Night Specimen Series 2019', 'UK Carp Team Championships 2021'],
          notableWaters: ['Main Stage', 'Lilymead Common', 'Holly Grove'],
          techniques: ['Extreme Distance', 'Multi-rigs', 'Boilie Glugging'],
          legacy: 'Redefined long-range carp fishing in the UK. His casting techniques turned terminal tackle manufacturers into distance specialists overnight.' },
        { id: 14, name: 'Tom Maker',        preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 30, skill: 5,  socialMedia: 3,  photo: 'img/anglers/tommaker112.png', category: 'Professional',
          bio: 'Young, hungry, and technically gifted, Tom Maker represents the new wave of digital carp angling. He documents every session, turning data into big-fish patterns.',
          signatureCatch: 'A 39lb mirror from a Margate canal, caught on a triple hookbait rig.',
          competitionsWon: ['Digital Angler of the Year 2020', 'UK Canal Championship 2022'],
          notableWaters: ['Margate Canal', 'Sturry', 'Westbrook'],
          techniques: ['Triple Hookbaits', 'Digital Mapping', 'Surface Fishing'],
          legacy: 'Merged social media documentation with specimen success. His data-led approach has become standard for millennial carp hunters.' },
        { id: 15, name: 'Harry Charrington',preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 60, skill: 9,  socialMedia: 6,  targetHunter: true, photo: 'img/anglers/harrychap112.png', category: 'Professional',
          bio: 'An aristocratic-looking angler with a brute-force approach, Harry Charrington is famous for hunting the UKs most intimidating pressurised venues and walking out with their biggest fish.',
          signatureCatch: 'A 51lb linear from the Avenue, landed on a 48hr session using large boilies.',
          competitionsWon: ['Avenue Record Holder 2018', 'Syndicate Showdown 2020', 'National Carp Cup 2022'],
          notableWaters: ['The Avenue', 'Car Park Lake', 'Horne Lakes'],
          techniques: ['Heavy Boilies', '48hr Sledges', 'Marker Spots'],
          legacy: 'Proved that mental toughness beats venue reputation. His big-fish sessions on pressurised waters are studied in angling academies.' },
        { id: 16, name: 'Oz Holness',       preferred: ['gravel_pit','running'],      disliked: ['estate_lake'], budget: 40, skill: 7,  socialMedia: 9,  photo: 'img/anglers/ozholness112.png', category: 'Professional',
          bio: 'A maverick thinker and former skateboarder, Oz Holness approaches carp fishing with a punk-rock attitude and unmatched creativity. He fishes venues everyone else writes off.',
          signatureCatch: 'A 42lb common from a secret Reading town centre canal, caught on a pop-up.',
          competitionsWon: ['Urban Punk Challenge 2019', 'Canal Carp Cup 2021'],
          notableWaters: ['Reading Canal', 'Abbey Meads Lake', 'Popley Ponds'],
          techniques: ['Pop-ups', 'Stalking', 'Surface Fishing'],
          legacy: 'Turned urban carp fishing into an art form. His creative rigs and DIY bait recipes have a cult following among street carp anglers.' },
        { id: 17, name: 'Martin Bowler',    preferred: ['running','still'],           disliked: ['gravel_pit'],  budget: 35, skill: 6,  socialMedia: 7,  photo: 'img/anglers/martinbowler112.png', category: 'Professional',
          bio: 'A family man and community leader, Martin Bowler runs one of the UKs most successful national carp campaigns. He believes carp fishing should be inclusive and accessible for all backgrounds.',
          signatureCatch: 'A 46lb mirror from the National Championships water, caught on a balanced snowman rig.',
          competitionsWon: ['National Carp Championships 2017', 'Family Fishing League 2019', 'Community Cup 2021'],
          notableWaters: ['National Championships Lake', 'Hickstead', 'Bewl Water'],
          techniques: ['Snowman Rigs', 'Community Fishing', 'Pre-baiting'],
          legacy: 'Made carp fishing more inclusive through community programmes. His youth outreach continues to widen the demographics of British carp angling.' },
        { id: 18, name: 'Jim Shelley',      preferred: ['gravel_pit','estate_lake'],  disliked: ['still'],       budget: 50, skill: 8,  socialMedia: 8, category: 'Professional',
          bio: 'A rugged north-country angler, Jim Shelley thrives in cold, windy conditions where others pack up. He specialises in winter carp and deep-water locating.',
          signatureCatch: 'A 50lb common caught through 5 inches of ice on a deadbait drop-off.',
          competitionsWon: ['Winter Carp Championship 2018', 'Ice Fishing Derby 2020', 'North-South Challenge 2022'],
          notableWaters: ['Yorkshire Dales Reservoir', 'Lake Windermere', 'Kielder Water'],
          techniques: ['Deadbaiting', 'Ice Fishing', 'Deep Drop-offs'],
          legacy: 'Revolutionised winter carp fishing in northern England. His ice-fishing techniques are now taught across British winter angling courses.' },
        { id: 19, name: 'Lee Jackson',      preferred: ['still','gravel_pit'],        disliked: ['running'],     budget: 30, skill: 5,  socialMedia: 4, category: 'Professional',
          bio: 'A bait scientist at heart, Lee Jackson spends more time boiling up test batches than actually fishing. His scientific method to attractants turned casual sessions into high-volume catching.',
          signatureCatch: 'A 37lb common caught on an experimental krill boilie from a commercial lake.',
          competitionsWon: ['Bait Science Cup 2016'],
          notableWaters: ['Commercial Match Lake', 'Topcliffe', 'Avenue'],
          techniques: ['Boilie Experimentation', 'Method Feeders', 'Glugging'],
          legacy: 'Turned bait science into a credible competitive edge. His published boilie recipes remain reference works for serious specimen anglers.' },
        { id: 20, name: 'Adam Penning',     preferred: ['running','gravel_pit'],      disliked: ['estate_lake'], budget: 35, skill: 6,  socialMedia: 5, category: 'Professional',
          bio: 'Quiet and intensely private, Adam Penning lets his catches speak louder than any interview. He is one of the UKs most elusive big-fish specialists, with a decades-long track record of rarely sharing swims.',
          signatureCatch: 'A 57lb mirror from the fabled Syndicate X, caught on a light pop-up rig.',
          competitionsWon: ['Syndicate Grand Slam 2019', 'UK Specimen Prize 2021'],
          notableWaters: ['Syndicate X', 'Grovers', 'St Ives Estate'],
          techniques: ['Light Pop-ups', 'Stalking', 'Single Hookbaits'],
          legacy: 'His secretive big-fish methodology inspired a generation of low-profile specimen hunters. Many of today\'s top secrets originated from his shadow.' },
        { id: 21, name: 'Gary Bayes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 45, skill: 7,  socialMedia: 4, category: 'Professional',
          bio: 'A former national coach turned TV analyst, Gary Bayes dissects carp behaviour with a clinical eye. His broadcast commentary has educated millions while he still finds time to fish internationally.',
          signatureCatch: 'A 45lb Wels catfish from the Danube, caught on a livebait setup.',
          competitionsWon: ['International Coach of the Year 2014', 'European Analysts Cup 2017', 'Danube Derby 2020'],
          notableWaters: ['Danube River', 'Walthamstow', 'Raven Ait'],
          techniques: ['Livebaiting', 'Euro-style Rigs', 'Fish Radar'],
          legacy: 'Brought scientific analysis to mainstream carp fishing broadcasting. His coaching frameworks are used by national teams across Europe.' },
        { id: 22, name: 'Ian Chillcott',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7, category: 'Professional',
          bio: 'A pressure-cooker performer, Ian Chillcott thrives in high-stakes televised finals where every cast is watched by thousands. He is as famous for his mental game as his technical skill.',
          signatureCatch: 'A sensational 53lb common from the Black Swan, landed on a last-chance rig in a televised final.',
          competitionsWon: ['Carp Challenge TV Winner 2015', 'Pressure Cup 2018', 'Angling Masters 2020'],
          notableWaters: ['Black Swan', 'Rashs', 'Lessers'],
          techniques: ['Televised Tactics', 'Boilie Rigs', 'Mental Preparation'],
          legacy: 'Set the benchmark for performing under camera pressure. His mental preparation routines are now standard for elite television match anglers.' },
        { id: 23, name: 'Keith Jenkins',    preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 25, skill: 4,  socialMedia: 3, category: 'Professional',
          bio: 'A retired steelworker with a lifelong love of low-cost, low-tech fishing, Keith Jenkins proves you do not need expensive tackle to catch specimen carp. His sessions are powered by patience and local knowledge.',
          signatureCatch: 'A personal best 40lb common from a council-run lake, caught on a simple ledger rig.',
          competitionsWon: ['Grassroots Angler of the Year 2017'],
          notableWaters: ['Council Lake', 'Darnall Park', 'Tinsley Marina'],
          techniques: ['Ledgering', 'Bread Crust', 'Worm Fishing'],
          legacy: 'Championed accessible, low-cost carp fishing for working-class anglers. His community tackle-sharing scheme continues to help new anglers get started.' },
        { id: 24, name: 'Paul Forward',     preferred: ['running','still'],           disliked: ['estate_lake'], budget: 30, skill: 5,  socialMedia: 4, category: 'Professional',
          bio: 'A logistics manager by trade and a tactical planner by obsession, Paul Forward treats every session like a military operation. His pre-session planning and baiting strategies are considered next level.',
          signatureCatch: 'A 48lb mirror from a venue he mapped himself, caught on a D method feeder.',
          competitionsWon: ['Logistics League 2018', 'Tactical Plan Cup 2020', 'National Pre-bait Championship 2022'],
          notableWaters: ['Planned Lake', 'Orchard', 'Silsoe'],
          techniques: ['D Method Feeders', 'Mapping', 'Pre-baiting Plans'],
          legacy: 'Turned session planning into a competitive science. His logistical maps and baiting schedules are now templates for serious UK carp anglers.' },
        {id: 28, name: 'Amature Angler 1', preferred: ['still','running'], disliked: ['estate_lake'], budget: 17, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 29, name: 'Amature Angler 2', preferred: ['running','estate_lake'], disliked: ['still'], budget: 12, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 30, name: 'Amature Angler 3', preferred: ['estate_lake','still'], disliked: ['running'], budget: 16, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 31, name: 'Amature Angler 4', preferred: ['running','estate_lake'], disliked: ['still'], budget: 16, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 32, name: 'Amature Angler 5', preferred: ['estate_lake','still'], disliked: ['gravel_pit'], budget: 18, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 33, name: 'Amature Angler 6', preferred: ['still','running'], disliked: ['estate_lake'], budget: 18, skill: 3, socialMedia: 0, category: 'Amature' },
        {id: 34, name: 'Amature Angler 7', preferred: ['running','still'], disliked: ['estate_lake'], budget: 12, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 35, name: 'Amature Angler 8', preferred: ['estate_lake','still'], disliked: ['gravel_pit'], budget: 29, skill: 3, socialMedia: 0, category: 'Amature' },
        {id: 36, name: 'Amature Angler 9', preferred: ['gravel_pit','still'], disliked: ['estate_lake'], budget: 13, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 37, name: 'Amature Angler 10', preferred: ['estate_lake','still'], disliked: ['gravel_pit'], budget: 21, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 38, name: 'Amature Angler 11', preferred: ['running','estate_lake'], disliked: ['still'], budget: 17, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 39, name: 'Amature Angler 12', preferred: ['gravel_pit','still'], disliked: ['running'], budget: 22, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 40, name: 'Amature Angler 13', preferred: ['gravel_pit','running'], disliked: ['estate_lake'], budget: 21, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 41, name: 'Amature Angler 14', preferred: ['gravel_pit','still'], disliked: ['estate_lake'], budget: 29, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 42, name: 'Amature Angler 15', preferred: ['running','estate_lake'], disliked: ['still'], budget: 24, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 43, name: 'Amature Angler 16', preferred: ['estate_lake','running'], disliked: ['still'], budget: 11, skill: 3, socialMedia: 0, category: 'Amature' },
        {id: 44, name: 'Amature Angler 17', preferred: ['running','still'], disliked: ['estate_lake'], budget: 18, skill: 4, socialMedia: 0, category: 'Amature' },
        {id: 45, name: 'Amature Angler 18', preferred: ['still','running'], disliked: ['estate_lake'], budget: 30, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 46, name: 'Amature Angler 19', preferred: ['estate_lake','running'], disliked: ['gravel_pit'], budget: 18, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 47, name: 'Amature Angler 20', preferred: ['running','still'], disliked: ['estate_lake'], budget: 23, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 48, name: 'Amature Angler 21', preferred: ['estate_lake','running'], disliked: ['still'], budget: 26, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 49, name: 'Amature Angler 22', preferred: ['estate_lake','still'], disliked: ['running'], budget: 14, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 50, name: 'Amature Angler 23', preferred: ['running','estate_lake'], disliked: ['gravel_pit'], budget: 12, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 51, name: 'Amature Angler 24', preferred: ['estate_lake','running'], disliked: ['gravel_pit'], budget: 18, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 52, name: 'Amature Angler 25', preferred: ['still','estate_lake'], disliked: ['running'], budget: 18, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 53, name: 'Amature Angler 26', preferred: ['gravel_pit','still'], disliked: ['estate_lake'], budget: 15, skill: 4, socialMedia: 0, category: 'Amature' },
        {id: 54, name: 'Amature Angler 27', preferred: ['estate_lake','still'], disliked: ['gravel_pit'], budget: 15, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 55, name: 'Amature Angler 28', preferred: ['still','estate_lake'], disliked: ['gravel_pit'], budget: 29, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 56, name: 'Amature Angler 29', preferred: ['running','still'], disliked: ['estate_lake'], budget: 27, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 57, name: 'Amature Angler 30', preferred: ['still','estate_lake'], disliked: ['gravel_pit'], budget: 10, skill: 4, socialMedia: 0, category: 'Amature' },
        {id: 58, name: 'Amature Angler 31', preferred: ['still','gravel_pit'], disliked: ['estate_lake'], budget: 11, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 59, name: 'Amature Angler 32', preferred: ['running','estate_lake'], disliked: ['still'], budget: 25, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 60, name: 'Amature Angler 33', preferred: ['still','estate_lake'], disliked: ['running'], budget: 25, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 61, name: 'Amature Angler 34', preferred: ['running','gravel_pit'], disliked: ['estate_lake'], budget: 27, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 62, name: 'Amature Angler 35', preferred: ['running','estate_lake'], disliked: ['gravel_pit'], budget: 30, skill: 4, socialMedia: 0, category: 'Amature' },
        {id: 63, name: 'Amature Angler 36', preferred: ['gravel_pit','running'], disliked: ['estate_lake'], budget: 17, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 64, name: 'Amature Angler 37', preferred: ['running','still'], disliked: ['estate_lake'], budget: 28, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 65, name: 'Amature Angler 38', preferred: ['running','estate_lake'], disliked: ['still'], budget: 12, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 66, name: 'Amature Angler 39', preferred: ['still','running'], disliked: ['gravel_pit'], budget: 20, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 67, name: 'Amature Angler 40', preferred: ['still','estate_lake'], disliked: ['running'], budget: 25, skill: 3, socialMedia: 0, category: 'Amature' },
        {id: 68, name: 'Amature Angler 41', preferred: ['running','estate_lake'], disliked: ['still'], budget: 28, skill: 5, socialMedia: 0, category: 'Amature' },
        {id: 69, name: 'Amature Angler 42', preferred: ['estate_lake','still'], disliked: ['gravel_pit'], budget: 16, skill: 4, socialMedia: 0, category: 'Amature' },
        {id: 70, name: 'Amature Angler 43', preferred: ['still','running'], disliked: ['estate_lake'], budget: 23, skill: 3, socialMedia: 0, category: 'Amature' },
        {id: 71, name: 'Amature Angler 44', preferred: ['estate_lake','running'], disliked: ['still'], budget: 11, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 72, name: 'Amature Angler 45', preferred: ['estate_lake','gravel_pit'], disliked: ['running'], budget: 17, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 73, name: 'Amature Angler 46', preferred: ['running','still'], disliked: ['estate_lake'], budget: 23, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 74, name: 'Amature Angler 47', preferred: ['running','gravel_pit'], disliked: ['estate_lake'], budget: 12, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 75, name: 'Amature Angler 48', preferred: ['estate_lake','gravel_pit'], disliked: ['still'], budget: 30, skill: 1, socialMedia: 0, category: 'Amature' },
        {id: 76, name: 'Amature Angler 49', preferred: ['still','running'], disliked: ['gravel_pit'], budget: 23, skill: 2, socialMedia: 0, category: 'Amature' },
        {id: 77, name: 'Amature Angler 50', preferred: ['estate_lake','running'], disliked: ['still'], budget: 11, skill: 4, socialMedia: 0, category: 'Amature' },
    ];

    /**
     * Initialise angler state fields if missing.
     */
    function initState() {
        var state = Game.getState();
        if (!state.anglerBookings) state.anglerBookings = [];
        if (!state.anglerSatisfaction) state.anglerSatisfaction = {};
        if (!state.pendingBookings) state.pendingBookings = [];
        if (!state.incomeHistory) state.incomeHistory = [];
    }

    /** Sub-tab state */
    var _anglerView = 'bookings'; // 'bookings' | 'roster' | 'sponsorships' | 'leaderboard'

    function showAnglerView(view) {
        _anglerView = view;
        renderAnglers();
    }
    function getAnglerById(id) {
        return ANGLER_POOL.find(function (a) { return a.id === id; }) || null;
    }

    /**
     * Get all anglers.
     */
    function getAllAnglers() {
        return ANGLER_POOL;
    }

    /**
     * Generate new booking requests for the current day.
     * Anglers request bookings for lakes that match their preferred water types.
     */
    function generateBookingRequests() {
        initState();
        var state = Game.getState();
        if (state.ownedLakes.length === 0) return;

        // Determine which anglers are currently booked
        var bookedAnglerIds = [];
        state.anglerBookings.forEach(function (booking) {
            if (booking.endDay >= state.day) {
                bookedAnglerIds.push(booking.anglerId);
            }
        });
        // Also check pending
        state.pendingBookings.forEach(function (booking) {
            bookedAnglerIds.push(booking.anglerId);
        });

        // Each available angler has a chance to request a booking
        var availableAnglers = ANGLER_POOL.filter(function (a) {
            return bookedAnglerIds.indexOf(a.id) === -1;
        });

        // Booking volume scales with reputation up to pool size cap
        var baseMax     = Math.min(ANGLER_POOL.length, Math.floor(state.reputation / 100) + 2);
        var assistBonus = typeof Staff !== 'undefined' ? Staff.getAssistantBookingBonus() : 0;

        // Lakeside marketing maintenance adds booking volume
        var mktBonus = 0;
        if (typeof Lakes !== 'undefined') {
            state.ownedLakes.forEach(function (lkId) {
                mktBonus = Math.max(mktBonus, Lakes.getLakeMaintenanceEffect(lkId, 'bookingBonus'));
            });
        }
        var maxRequests = baseMax + assistBonus + Math.round(mktBonus * 3);

        var requestCount = Math.floor(Math.random() * (maxRequests + 1));

        // Scale requests by combined season + weather modifier.
        if (typeof Weather !== 'undefined') {
            var weatherMod = Weather.getAnglerModifier();
            requestCount = Math.max(0, Math.round(requestCount * (1 + weatherMod)));
        }

        // Further scale by any active marketing campaigns.
        if (typeof Finance !== 'undefined') {
            var marketingMod = Finance.getMarketingBookingModifier();
            if (marketingMod > 0) {
                requestCount = Math.max(requestCount, Math.round(requestCount * (1 + marketingMod)));
                // Marketing guarantees at least 1 request if campaigns are running and rep > 0
                if (requestCount === 0 && state.reputation > 0) requestCount = 1;
            }
        }

        var shuffled = availableAnglers.slice().sort(function () { return Math.random() - 0.5; });
        var professionals = shuffled.filter(function (a) { return a.category !== 'Amature'; });
        var amatures = shuffled.filter(function (a) { return a.category === 'Amature'; });
        var selected = professionals.slice(0, requestCount);
        var remaining = requestCount - selected.length;
        if (remaining > 0 && amatures.length > 0) {
            selected = selected.concat(amatures.slice(0, remaining));
        }

        selected.forEach(function (angler) {
            // Target Hunter anglers prefer lakes with 40lb+ (640oz) fish
            var targetLake;
            if (angler.targetHunter) {
                var lakesWithTargets = state.ownedLakes.filter(function(lakeId){
                    var lake = Lakes.getLakeById(lakeId);
                    if (!lake) return false;
                    if (angler.disliked.indexOf(lake.waterType) !== -1) return false;
                    return state.fish.some(function(f){ return f.alive && f.lake_id === lakeId && f.weight_oz >= 640; });
                });
                if (lakesWithTargets.length > 0) {
                    targetLake = lakesWithTargets[Math.floor(Math.random() * lakesWithTargets.length)];
                }
            }

            if (!targetLake) {
            // Find a matching lake (normal logic)
            var matchingLakes = state.ownedLakes.filter(function (lakeId) {
                var lake = Lakes.getLakeById(lakeId);
                if (!lake) return false;
                return angler.preferred.indexOf(lake.waterType) !== -1;
            });

            // If no preferred lake, try non-disliked
            if (matchingLakes.length === 0) {
                matchingLakes = state.ownedLakes.filter(function (lakeId) {
                    var lake = Lakes.getLakeById(lakeId);
                    if (!lake) return false;
                    return angler.disliked.indexOf(lake.waterType) === -1;
                });
            }

            if (matchingLakes.length === 0) return;
            targetLake = matchingLakes[Math.floor(Math.random() * matchingLakes.length)];
            }

            var advanceDays = Math.floor(Math.random() * 14) + 1; // book 1–14 days ahead
            var duration    = Math.floor(Math.random() * 14) + 1; // stay 1–14 days
            var startDay    = state.day + advanceDays;
            var endDay      = startDay + duration - 1;

            var lake       = Lakes.getLakeById(targetLake);

            // Auto-book immediately — no player input required
            state.anglerBookings.push({
                anglerId:     angler.id,
                anglerName:   angler.name,
                lakeId:       targetLake,
                startDay:     startDay,
                endDay:       endDay,
                duration:     duration,
                dailyRate:    angler.budget,
                satisfaction: 50
            });

            Game.addNotification(
                '\uD83D\uDCCB ' + angler.name + ' auto-booked at ' +
                (lake ? lake.name : targetLake) + ' for ' +
                duration + ' day' + (duration > 1 ? 's' : '') + '.'
            );
        });

        // Separately roll for a fishing match / competition event
        generateMatchRequest();
    }

    /**
     * Occasionally generate a fishing match / competition booking request.
     * Matches book a large portion of a lake for 1-2 days.
     */
    function generateMatchRequest() {
        var state = Game.getState();
        if (state.ownedLakes.length === 0) return;
        if (state.reputation < 5) return;  // need a little credibility first

        // Only allow 1 pending match at a time
        var hasPending = state.pendingBookings.some(function (b) { return b.isMatch; });
        if (hasPending) return;

        // Scale chance slightly with reputation
        var chance = Math.min(0.25, MATCH_CHANCE + (state.reputation / 2000));
        if (Math.random() > chance) return;

        // Pick a random match type
        var matchType = MATCH_TYPES[Math.floor(Math.random() * MATCH_TYPES.length)];

        // Pick a lake — prefer the most prestigious one available
        var lakeId = state.ownedLakes[state.ownedLakes.length - 1];
        var lake   = Lakes.getLakeById(lakeId);
        if (!lake) return;

        // Number of anglers (respect lake capacity roughly)
        var capPenalty = (state.capacityPenalties && state.capacityPenalties[lakeId])
            ? (state.capacityPenalties[lakeId].amount || 0) : 0;
        var available = lake.capacity - capPenalty;
        var min = matchType.anglerRange[0];
        var max = Math.min(matchType.anglerRange[1], available);
        if (max < min) max = min;
        var anglerCount = min + Math.floor(Math.random() * (max - min + 1));

        var totalFee = anglerCount * matchType.feePerAngler * matchType.durationDays;

        // Auto-book the match immediately
        state.anglerBookings.push({
            isMatch:      true,
            matchTypeId:  matchType.id,
            anglerName:   matchType.name,
            matchName:    matchType.name,
            lakeId:       lakeId,
            anglerCount:  anglerCount,
            duration:     matchType.durationDays,
            dailyRate:    Math.round(totalFee / matchType.durationDays),
            totalFee:     totalFee,
            repBonus:     matchType.repBonus,
            startDay:     state.day + 2,
            endDay:       state.day + 1 + matchType.durationDays,
            satisfaction: 70,
            anglerId:     -1
        });

        Game.addNotification(
            '\uD83C\uDFC6 ' + matchType.name + ' auto-booked at ' + lake.name +
            ' \u2014 ' + anglerCount + ' anglers, ' + matchType.durationDays +
            ' day' + (matchType.durationDays > 1 ? 's' : '') +
            ', ' + UI.formatMoney(totalFee) + ' total.'
        );
        UI.showToast('\uD83C\uDFC6 ' + matchType.name + ' booked!', 'success');
    }

    /**
     * Accept a pending booking (individual or match).
     */
    function acceptBooking(index) {
        initState();
        var state = Game.getState();
        if (index < 0 || index >= state.pendingBookings.length) return;

        var booking = state.pendingBookings.splice(index, 1)[0];
        state.anglerBookings.push({
            anglerId: booking.anglerId,
            anglerName: booking.anglerName,
            lakeId: booking.lakeId,
            startDay: booking.startDay,
            endDay: booking.startDay + booking.duration - 1,
            duration: booking.duration,
            dailyRate: booking.dailyRate,
            satisfaction: 50 // Start at neutral
        });

        UI.showToast(booking.anglerName + ' booked for ' + booking.duration + ' day' + (booking.duration > 1 ? 's' : '') + '!', 'success');
        Game.saveToStorage();
        renderAnglers();
    }

    /**
     * Decline a pending booking.
     */
    function declineBooking(index) {
        initState();
        var state = Game.getState();
        if (index < 0 || index >= state.pendingBookings.length) return;

        var booking = state.pendingBookings.splice(index, 1)[0];
        UI.showToast(booking.anglerName + '\'s booking declined.', 'warning');
        Game.saveToStorage();
        renderAnglers();
    }

    /**
     * Process daily angler bookings - run on nextDay().
     * Anglers fish, pay daily rate, update satisfaction.
     */
    function processDailyBookings() {
        initState();
        var state = Game.getState();
        var dailyAnglerIncome = 0;
        var activeAnglerCount = 0;

        state.anglerBookings.forEach(function (booking) {
            if (state.day >= booking.startDay && state.day <= booking.endDay) {
                // Angler is active today
                activeAnglerCount++;
                dailyAnglerIncome += booking.dailyRate;

                // Calculate satisfaction based on lake quality
                var lake = Lakes.getLakeById(booking.lakeId);
                var angler = getAnglerById(booking.anglerId);
                if (lake && angler) {
                    var satisfactionChange = 0;

                    // Preferred water type bonus
                    if (angler.preferred.indexOf(lake.waterType) !== -1) {
                        satisfactionChange += 5;
                    }
                    // Disliked water type penalty
                    if (angler.disliked.indexOf(lake.waterType) !== -1) {
                        satisfactionChange -= 10;
                    }

                    // Biodiversity bonus
                    satisfactionChange += Math.floor(lake.biodiversityScore / 3);

                    // Fish availability bonus
                    var fishInLake = state.fish.filter(function (f) {
                        return f.alive && f.lake_id === booking.lakeId;
                    }).length;
                    if (fishInLake > 5) satisfactionChange += 2;
                    if (fishInLake > 15) satisfactionChange += 3;

                    // Upgrades bonus
                    if (typeof Shop !== 'undefined' && Shop.lakeHasUpgrade(booking.lakeId, 'swim_platforms')) {
                        satisfactionChange += 3;
                    }

                    booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + satisfactionChange));

                    // Weather affects on-site angler comfort
                    if (typeof Weather !== 'undefined') {
                        var weatherSatMod = Weather.getAnglerSatisfactionMod();
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + weatherSatMod));
                    }

                    // Lake Manager staff bonus
                    if (typeof Staff !== 'undefined') {
                        var managerBonus = Staff.getLakeManagerSatisfactionBonus(booking.lakeId);
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + managerBonus));
                        var assistantBonus = Staff.getAssistantSatisfactionBonus
                            ? Staff.getAssistantSatisfactionBonus() : 0;
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + assistantBonus));
                    }

                    // Grounds maintenance satisfaction bonus
                    if (typeof Lakes !== 'undefined') {
                        var groundsSat = Lakes.getLakeMaintenanceEffect(booking.lakeId, 'anglerSatisfactionBonus');
                        if (groundsSat > 0) {
                            booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + groundsSat));
                        }
                    }
                }
            }
        });

        // Add angler income
        if (dailyAnglerIncome > 0) {
            state.money += dailyAnglerIncome;
            state.totalEarnings += dailyAnglerIncome;
            Game.addNotification('Earned ' + UI.formatMoney(dailyAnglerIncome) + ' from ' + activeAnglerCount + ' angler' + (activeAnglerCount > 1 ? 's' : '') + ' today.');
            if (typeof Finance !== 'undefined') {
                Finance.addFinanceLog('angler_income', dailyAnglerIncome,
                    'Angler income (' + activeAnglerCount + ' active)');
            }
        }

        // Process completed bookings - update reputation
        var completedBookings = [];
        state.anglerBookings = state.anglerBookings.filter(function (booking) {
            if (state.day > booking.endDay) {
                completedBookings.push(booking);
                return false;
            }
            return true;
        });

        completedBookings.forEach(function (booking) {
            if (booking.isMatch) {
                // Match completion: record result + fishery cut
                recordMatchResult(booking);
                var repGain = (booking.repBonus || 15) + (booking.satisfaction >= 70 ? 10 : 0);
                Game.addReputation(repGain);
                Game.addNotification(
                    '\uD83C\uDFC6 ' + booking.matchName + ' completed at ' +
                    ((typeof Lakes !== 'undefined' && Lakes.getLakeById(booking.lakeId))
                        ? Lakes.getLakeById(booking.lakeId).name : 'your lake') +
                    '! +' + repGain + ' reputation.'
                );
                UI.showToast(booking.matchName + ' completed! +' + repGain + ' rep', 'success');
            } else if (booking.satisfaction >= 70) {
                Game.addReputation(5);
                Game.addNotification(booking.anglerName + ' left very satisfied! (+5 reputation)');
                // Record visit stats for leaderboard
                if (booking.lakeId) recordAnglerVisit(booking.anglerName, booking.lakeId, 1);
            } else if (booking.satisfaction >= 40) {
                Game.addReputation(2);
                Game.addNotification(booking.anglerName + ' had a decent visit. (+100 reputation)');
            } else {
                Game.addNotification(booking.anglerName + ' left unhappy. (-100 reputation)');
                var state2 = Game.getState();
                state2.reputation = Math.max(0, state2.reputation - 2);
            }        });

        // Remove expired pending bookings (older than 2 days)
        state.pendingBookings = state.pendingBookings.filter(function (b) {
            return state.day - b.requestedOn <= 2;
        });

        // Track active anglers count for dashboard
        state.anglers = state.anglerBookings.filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        });

        // Track income history for charts
        if (!state.incomeHistory) state.incomeHistory = [];
        state.incomeHistory.push({ day: state.day, income: dailyAnglerIncome });
        // Keep only last 14 days
        if (state.incomeHistory.length > 14) {
            state.incomeHistory = state.incomeHistory.slice(-14);
        }

        // Process sponsorship payments
        processDailySponsorship();

        return dailyAnglerIncome;
    }

    /**
     * Get lake colour for calendar display.
     */
    function getLakeColour(lakeId) {
        var colours = {
            'oakmere_lake': '#3498db',
            'kingfisher_waters': '#2ecc71',
            'linch_hill': '#e67e22',
            'wraysbury': '#9b59b6',
            'yateley': '#e74c3c',
            'redmire_pool': '#d4a843',
            'savay_lake': '#1abc9c'
        };
        return colours[lakeId] || '#4a9c6d';
    }

    /**
     * Format water type for display.
     */
    function formatWaterType(type) {
        switch (type) {
            case 'still': return 'Still Water';
            case 'running': return 'Running Water';
            case 'gravel_pit': return 'Gravel Pit';
            case 'estate_lake': return 'Estate Lake';
            default: return type;
        }
    }

    /**
     * Render the Anglers panel — fully automated booking system.
     */
    function renderAnglers() {
        initState();
        var state = Game.getState();
        var container = document.getElementById('panel-anglers');

        var html = '<h2>Anglers</h2>';

        // Sub-tab bar
        html += '<div class="dash-subtabs">';
        html += '<button class="dash-subtab' + (_anglerView === 'bookings' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'bookings\')">\uD83C\uDFA3 Bookings</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'roster' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'roster\')">\uD83D\uDCCB Roster</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'sponsorships' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'sponsorships\')">\uD83E\uDD1D Sponsorships</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'leaderboard' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'leaderboard\')">\uD83C\uDFC6 Leaderboard</button>';
        html += '</div>';

        if (_anglerView === 'roster') {
            html += renderRosterTab(state);
            container.innerHTML = html;
            return;
        }
        if (_anglerView === 'sponsorships') {
            html += renderSponsorshipsTab(state);
            container.innerHTML = html;
            return;
        }
        if (_anglerView === 'leaderboard') {
            html += renderLeaderboardTab(state);
            container.innerHTML = html;
            return;
        }

        // Auto-booking info banner
        html += '<div class="auto-booking-banner">';
        html += '<span class="auto-booking-icon">\uD83E\uDD16</span>';
        html += '<div>';
        html += '<strong>Bookings are fully automated.</strong>';
        html += ' Anglers and competitions are booked in automatically each day based on your reputation, season, and weather.';
        html += '</div>';
        html += '</div>';

        // Today's summary
        var todayActive = state.anglerBookings.filter(function (b) {
            return state.day >= b.startDay && state.day <= b.endDay;
        });
        var todayIncome = todayActive.reduce(function (s, b) { return s + b.dailyRate; }, 0);
        var todayMatches = todayActive.filter(function (b) { return b.isMatch; });

        html += '<div class="angler-today-strip">';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + todayActive.length + '</span><span class="angler-today-label">On-Site Today</span></div>';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + UI.formatMoney(todayIncome) + '</span><span class="angler-today-label">Today\'s Income</span></div>';
        html += '<div class="angler-today-stat"><span class="angler-today-val">' + todayMatches.length + '</span><span class="angler-today-label">Active Matches</span></div>';
        html += '</div>';

        // Calendar — one per lake
        html += '<h3 class="section-heading">Booking Calendar</h3>';
        html += renderCalendar();

        // Active Bookings
        html += '<h3 class="section-heading">Active Bookings</h3>';
        var activeBookings = state.anglerBookings.filter(function (b) {
            return state.day <= b.endDay;
        });
        if (activeBookings.length === 0) {
            html += '<p class="empty-state">No active bookings. Advance a day to generate new ones.</p>';
        } else {
            html += '<div class="active-bookings-list">';
            activeBookings.forEach(function (booking) {
                var lake     = Lakes.getLakeById(booking.lakeId);
                var angler   = getAnglerById(booking.anglerId);
                var sm       = angler ? (angler.socialMedia || 5) : 5;
                var daysLeft = booking.endDay - state.day + 1;
                var sat      = booking.satisfaction || 50;
                var borderCol = booking.isMatch ? 'var(--colour-gold)' : getLakeColour(booking.lakeId);

                // Marketing impact: social score × satisfaction modifier
                // High social + high satisfaction = big positive reach
                // Low social or low satisfaction = minimal/negative
                var satMod     = (sat - 50) / 50;           // -1 to +1
                var mktImpact  = Math.round(sm * (1 + satMod));  // 0–20 range
                var mktCol     = mktImpact >= 8 ? 'var(--colour-accent)' : mktImpact >= 5 ? '#d4a843' : 'var(--colour-danger)';
                var mktLabel   = mktImpact >= 8 ? '\u2B06 Boosting' : mktImpact >= 5 ? '\u2192 Neutral' : '\u2B07 Weak';
                var smCol      = sm >= 8 ? '#f1c40f' : sm >= 6 ? '#2ecc71' : '#aaa';

                html += '<div class="active-booking-card" style="border-left-color:' + borderCol + ';">';
                html += '<strong>' + (booking.isMatch ? '\uD83C\uDFC6 ' : '') + booking.anglerName + '</strong>';
                html += '<span class="booking-lake-tag" style="background:' + getLakeColour(booking.lakeId) + ';">' + (lake ? lake.name : 'Unknown') + '</span>';
                html += '<span>' + daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + ' left</span>';
                html += '<span class="booking-satisfaction">Sat: ' + sat + '%</span>';
                html += '<span class="booking-social" style="color:' + smCol + ';">\uD83D\uDCF1 ' + sm + '/10</span>';
                html += '<span class="booking-mkt-impact" style="color:' + mktCol + ';" title="Marketing impact from this visit">' + mktLabel + '\u00A0(' + mktImpact + ')</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Angler Pool
        html += '<h3 class="section-heading">Angler Pool</h3>';
        html += '<div class="angler-pool-grid">';
        ANGLER_POOL.forEach(function (angler) {
            var isBooked = state.anglerBookings.some(function (b) {
                return b.anglerId === angler.id && state.day <= b.endDay;
            });
            html += '<div class="angler-card' + (isBooked ? ' angler-booked' : '') + '">';
            html += '<div class="angler-card-name">' + angler.name + '</div>' +
                ('<span class="angler-category-badge ' + (angler.category === 'Amature' ? 'cat-amature' : 'cat-professional') + '">' + (angler.category || 'Professional') + '</span>');
            html += '<div class="angler-photo-slot">' + (angler.category !== 'Amature' && angler.photo ? '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-photo-img" loading="lazy"/>' : angler.category !== 'Amature' ? '<div class="angler-photo-placeholder">' + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>' : '') + '</div>';
            html += '<div class="angler-card-info">';
            html += '<span class="angler-skill-badge">Skill ' + angler.skill + '/10</span>';
            html += '<span class="angler-social-badge" style="color:' + (angler.socialMedia >= 8 ? '#f1c40f' : angler.socialMedia >= 6 ? '#2ecc71' : '#aaa') + ';">\uD83D\uDCF1 ' + angler.socialMedia + '/10</span>';
            html += '<span class="angler-budget-badge">' + UI.formatMoney(angler.budget) + '/day</span>';
            html += '</div>';
            html += '<div class="angler-card-prefs">';
            html += '<span class="pref-label">Likes:</span> ' + angler.preferred.map(formatWaterType).join(', ');
            html += '</div>';
            html += '<div class="angler-card-prefs angler-dislikes">';
            html += '<span class="pref-label">Dislikes:</span> ' + angler.disliked.map(formatWaterType).join(', ');
            html += '</div>';
            if (isBooked) {
                html += '<div class="angler-status-tag">Currently Booked</div>';
            }
            if (angler.category !== 'Amature') {
                html += '<button class="angler-more-btn" onclick="Anglers.showAnglerDetails(' + angler.id + ')">More Info</button>';
            }
            html += '</div>';
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Render one compact 14-day calendar per owned lake.
     * Each day cell stacks all anglers booked that day as small chips.
     */
    function renderCalendar() {
        var state = Game.getState();
        if (state.ownedLakes.length === 0) {
            return '<p class="empty-state">Own a lake to see bookings.</p>';
        }

        var DAYS = 14;
        var html = '<div class="cal-lake-grid">';

        state.ownedLakes.forEach(function (lakeId) {
            var lake      = typeof Lakes !== 'undefined' ? Lakes.getLakeById(lakeId) : null;
            var lakeCol   = getLakeColour(lakeId);
            var lakeName  = lake ? lake.name : lakeId;

            // Bookings that touch this lake and this window
            var lakeBookings = state.anglerBookings.filter(function (b) {
                return b.lakeId === lakeId &&
                       b.endDay >= state.day &&
                       b.startDay <= state.day + DAYS - 1;
            });

            html += '<div class="cal-lake-block">';
            html += '<div class="cal-lake-title" style="border-color:' + lakeCol + ';">' + lakeName;
            html += '<span class="cal-lake-count">' + lakeBookings.length + ' booking' + (lakeBookings.length === 1 ? '' : 's') + '</span>';
            html += '</div>';

            html += '<div class="cal-grid">';

            // Header row — dates
            html += '<div class="cal-header-row">';
            for (var d = 0; d < DAYS; d++) {
                var dayNum    = state.day + d;
                var isClosed  = state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= dayNum;
                var dateLabel = typeof UI !== 'undefined' && UI.formatGameDate ? UI.formatGameDate(dayNum).replace(/ Y\d+/, '') : 'D' + dayNum;
                html += '<div class="cal-header-cell' + (d === 0 ? ' cal-today' : '') + (isClosed ? ' cal-closed' : '') + '">' +
                        dateLabel + '</div>';
            }
            html += '</div>';

            // Body row — anglers per day
            html += '<div class="cal-body-row">';
            for (var d2 = 0; d2 < DAYS; d2++) {
                var dayNum2   = state.day + d2;
                var isClosed2 = state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= dayNum2;
                html += '<div class="cal-day-cell' + (isClosed2 ? ' cal-day-closed' : '') + '">';
                if (isClosed2) {
                    html += '<span class="cal-chip cal-chip-closed">\uD83D\uDEAB</span>';
                } else {
                    lakeBookings.forEach(function (b) {
                        if (dayNum2 < b.startDay || dayNum2 > b.endDay) return;
                        var isMatch   = b.isMatch;
                        var firstName = b.anglerName.split(' ')[0];
                        html += '<span class="cal-chip' + (isMatch ? ' cal-chip-match' : '') + '">' +
                                (isMatch ? '\uD83C\uDFC6 ' : '') + firstName + '</span>';
                    });
                }
                html += '</div>';
            }
            html += '</div>';
            html += '</div>'; // cal-grid
            html += '</div>'; // cal-lake-block
        });

        html += '</div>'; // cal-lake-grid
        return html;
    }

    // ── Sponsorship system ────────────────────────────────────────────────────

    var SPONSORSHIP_SALARY_MIN  = 100;
    var SPONSORSHIP_SALARY_MAX  = 2000;
    var SPONSORSHIP_BAIT_MIN    = 50;
    var SPONSORSHIP_BAIT_MAX    = 500;

    function offerSponsorship(anglerId, salary, baitBudget, months) {
        var state  = Game.getState();
        var angler = getAnglerById(anglerId);
        if (!angler) { UI.showToast('Angler not found.', 'error'); return; }

        if ((state.sponsorships || []).filter(function (s) { return !s.ended; }).length >= 3) {
            UI.showToast('Already at maximum 3 sponsorships.', 'warning'); return;
        }
        if ((state.sponsorships || []).some(function (s) { return s.anglerId === anglerId && !s.ended; })) {
            UI.showToast(angler.name + ' is already sponsored.', 'warning'); return;
        }

        salary     = Math.max(SPONSORSHIP_SALARY_MIN, Math.min(SPONSORSHIP_SALARY_MAX, parseInt(salary) || 500));
        baitBudget = Math.max(SPONSORSHIP_BAIT_MIN,   Math.min(SPONSORSHIP_BAIT_MAX,   parseInt(baitBudget) || 150));
        months     = (months === 12) ? 12 : 6;

        var totalCost = (salary + baitBudget) * months;
        var signing   = Math.round(salary * 0.5);

        if (state.money < signing) {
            UI.showToast('Need ' + UI.formatMoney(signing) + ' signing bonus upfront.', 'error'); return;
        }
        state.money      -= signing;
        state.totalSpent += signing;
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('hiring_cost', -signing, 'Sponsorship signing: ' + angler.name);
        }

        if (!state.sponsorships) state.sponsorships = [];
        state.sponsorships.push({
            id:          state.nextSponsorshipId++,
            anglerId:    anglerId,
            anglerName:  angler.name,
            salary:      salary,
            baitBudget:  baitBudget,
            months:      months,
            startDay:    state.day,
            endDay:      state.day + months * 30,
            nextPayDay:  state.day + 30,
            totalPaid:   signing,
            ended:       false,
            signingFee:  signing
        });

        Game.saveToStorage();
        UI.showToast('\uD83E\uDD1D ' + angler.name + ' signed for ' + months + ' months!', 'success');
        Game.addNotification('\uD83E\uDD1D Sponsorship signed: ' + angler.name + ' — ' +
            UI.formatMoney(salary) + '/month salary + ' + UI.formatMoney(baitBudget) + '/month bait.');
        renderAnglers();
    }

    function cancelSponsorship(sponsorshipId) {
        var state = Game.getState();
        var sp    = (state.sponsorships || []).find(function (s) { return s.id === sponsorshipId; });
        if (!sp) return;
        sp.ended = true;
        UI.showToast(sp.anglerName + '\'s sponsorship cancelled.', 'warning');
        Game.saveToStorage();
        renderAnglers();
    }

    function processDailySponsorship() {
        var state = Game.getState();
        if (!state.sponsorships || state.sponsorships.length === 0) return;

        state.sponsorships.forEach(function (sp) {
            if (sp.ended) return;

            // Contract expired
            if (state.day >= sp.endDay) {
                sp.ended = true;
                Game.addNotification('\uD83E\uDD1D ' + sp.anglerName + '\'s ' + sp.months + '-month sponsorship has ended.');
                return;
            }

            // ── Daily social media return ────────────────────────────────────
            // Income return: salary/30 * (socialMedia/5)  — profitable at socialMedia >= 6
            // Reputation:    socialMedia * 0.25 / day (accumulates via reputationAccumulator)
            var angler      = getAnglerById(sp.anglerId);
            var sm          = angler ? (angler.socialMedia || 5) : 5;
            var dailyIncome = Math.round((sp.salary / 30) * (sm / 5));
            var dailyRep    = sm * 0.25;

            if (dailyIncome > 0) {
                state.money         += dailyIncome;
                state.totalEarnings += dailyIncome;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('angler_income', dailyIncome, sp.anglerName + ' social reach income');
                }
            }
            if (dailyRep > 0) {
                if (!state.reputationAccumulator) state.reputationAccumulator = 0;
                state.reputationAccumulator += dailyRep;
                if (state.reputationAccumulator >= 1) {
                    var whole = Math.floor(state.reputationAccumulator);
                    Game.addReputation(whole);
                    state.reputationAccumulator -= whole;
                }
            }

            // Monthly salary + bait payment
            if (state.day >= sp.nextPayDay) {
                var payment = sp.salary + sp.baitBudget;
                state.money      = Math.max(0, state.money - payment);
                state.totalSpent += payment;
                sp.totalPaid     += payment;
                sp.nextPayDay    += 30;
                if (typeof Finance !== 'undefined') {
                    Finance.addFinanceLog('hiring_cost', -payment, sp.anglerName + ' monthly sponsorship');
                }
                // Monthly summary notification
                var monthlyReturn = dailyIncome * 30;
                var profit = monthlyReturn - payment;
                Game.addNotification('\uD83E\uDD1D Paid ' + UI.formatMoney(payment) + ' to ' + sp.anglerName +
                    ' \u2014 social reach earned ' + UI.formatMoney(monthlyReturn) +
                    ' (' + (profit >= 0 ? '+' : '') + UI.formatMoney(profit) + ').');
            }
        });
    }

    function getSponsoredAnglerIds() {
        var state = Game.getState();
        return (state.sponsorships || []).filter(function (s) { return !s.ended; }).map(function (s) { return s.anglerId; });
    }

    // ── Angler stats / leaderboard ────────────────────────────────────────────

    function recordAnglerVisit(anglerName, lakeId, daysActive) {
        var state = Game.getState();
        if (!state.anglerStats) state.anglerStats = {};
        if (!state.anglerStats[anglerName]) {
            state.anglerStats[anglerName] = { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        }
        var stats = state.anglerStats[anglerName];
        stats.visits++;

        // Simulate fish caught based on lake stock
        var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === lakeId; });
        var catchCount = Math.floor(Math.random() * 3) + (lakeFish.length > 10 ? 1 : 0);
        stats.fishCaught += catchCount;

        // Simulate biggest fish caught
        if (lakeFish.length > 0 && Math.random() < 0.5) {
            var caught = lakeFish[Math.floor(Math.random() * lakeFish.length)];
            if (caught.weight_oz > stats.biggestFishOz) {
                stats.biggestFishOz = caught.weight_oz;
            }
        }

        if (typeof updateAnglerQuestProgress === 'function') {
            updateAnglerQuestProgress();
        }
    }

    function recordMatchResult(matchBooking) {
        var state   = Game.getState();
        var cut     = state.tournamentCut || 0.20;
        var pool    = Math.round(matchBooking.totalFee * 2); // prize pool = 2× entry fees
        var fishery = Math.round(pool * cut);
        var winner  = Math.round(pool * (1 - cut));

        // Pick winner from known anglers weighted by skill
        var candidates = ANGLER_POOL.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 5);
        var winnerAngler = candidates.reduce(function (best, a) { return a.skill > best.skill ? a : best; });

        if (!state.anglerStats) state.anglerStats = {};
        if (!state.anglerStats[winnerAngler.name]) {
            state.anglerStats[winnerAngler.name] = { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        }
        state.anglerStats[winnerAngler.name].wins++;
        state.anglerStats[winnerAngler.name].winnings += winner;

        if (typeof updateAnglerQuestProgress === 'function') {
            updateAnglerQuestProgress();
        }

        // Fishery receives cut
        state.money         += fishery;
        state.totalEarnings += fishery;
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('fish_sale', fishery, matchBooking.matchName + ' prize cut');
        }

        if (!state.matchResults) state.matchResults = [];
        state.matchResults.push({
            day:         state.day,
            matchName:   matchBooking.matchName,
            winner:      winnerAngler.name,
            prizePool:   pool,
            fisheryGot:  fishery,
            winnerGot:   winner
        });
        if (state.matchResults.length > 10) state.matchResults = state.matchResults.slice(-10);

        Game.addNotification('\uD83C\uDFC6 ' + matchBooking.matchName + ' — Winner: ' + winnerAngler.name +
            '! Fishery received ' + UI.formatMoney(fishery) + ' (' + Math.round(cut * 100) + '% cut).');
        Game.saveToStorage();
    }

    /** Per-card sponsorship offer state — one slot per offer card (up to 3) */
    var _sponDur    = [6,   6,   6  ];
    var _sponSalary = [600, 600, 600];
    var _sponBait   = [150, 150, 150];

    /* Salary: 10 segments × £200 → £200–£2 000
       Bait:   10 segments × £50  →  £50–£500   */
    var SALARY_SEG_SIZE = 200;
    var BAIT_SEG_SIZE   = 50;

    var SAL_VALS  = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
    var BAIT_VALS = [50,  100, 150, 200,  250,  300,  350,  400,  450,  500];

    function _segColour(i) {
        return i < 3 ? 'spon-seg-green' : i < 7 ? 'spon-seg-amber' : 'spon-seg-red';
    }

    function selectContractDuration(idx, d) {
        _sponDur[idx] = d;
        var btn6  = document.getElementById('spon-dur-6-'  + idx);
        var btn12 = document.getElementById('spon-dur-12-' + idx);
        if (btn6)  btn6.classList.toggle('spon-dur-active',  d === 6);
        if (btn12) btn12.classList.toggle('spon-dur-active', d === 12);
        updateContractDisplay(idx);
    }

    function setSponValue(idx, field, value) {
        if (field === 'salary') _sponSalary[idx] = value;
        else                    _sponBait[idx]   = value;

        var stepSize = field === 'salary' ? SALARY_SEG_SIZE : BAIT_SEG_SIZE;
        var segs     = Math.round(value / stepSize);
        var barId    = (field === 'salary' ? 'spon-sal-bar-' : 'spon-bait-bar-') + idx;
        var valId    = (field === 'salary' ? 'spon-sal-val-' : 'spon-bait-val-') + idx;

        var bar = document.getElementById(barId);
        if (bar) {
            bar.querySelectorAll('.spon-bar-seg').forEach(function (seg, i) {
                seg.classList.toggle('spon-seg-active', i < segs);
            });
        }
        var valEl = document.getElementById(valId);
        if (valEl) valEl.textContent = '\u00a3' + value + '/mo';
        updateContractDisplay(idx);
    }

    function updateContractDisplay(idx) {
        var s   = _sponSalary[idx];
        var b   = _sponBait[idx];
        var dur = _sponDur[idx];
        var sig = Math.round(s * 0.5);
        var monthlyCostVal = s + b;
        var totalCost = monthlyCostVal * dur + sig;

        var anglerEl = document.getElementById('spon-angler-' + idx);
        var sm       = 5;
        if (anglerEl) {
            var ang = ANGLER_POOL.find(function (a) { return a.id === parseInt(anglerEl.value); });
            if (ang) sm = ang.socialMedia || 5;
        }

        // Social media return: salary/30 * (sm/5) per day * 30 = salary * (sm/5) per month
        var monthlyReturn = Math.round(s * (sm / 5));
        var netPerMonth   = monthlyReturn - monthlyCostVal;
        var netTotal      = monthlyReturn * dur - totalCost;
        var roiCol        = netPerMonth >= 0 ? '#5d9b48' : '#b83020';

        var sumEl = document.getElementById('spon-summary-' + idx);
        if (sumEl) {
            sumEl.innerHTML =
                '\uD83D\uDCF1 Social reach: <strong style="color:var(--colour-accent);">' + UI.formatMoney(monthlyReturn) + '/mo</strong>' +
                ' \u00b7 Cost: ' + UI.formatMoney(monthlyCostVal) + '/mo' +
                ' \u00b7 Signing: ' + UI.formatMoney(sig) +
                ' \u00b7 <span style="color:' + roiCol + ';font-weight:700;">Net: ' +
                (netPerMonth >= 0 ? '+' : '') + UI.formatMoney(netPerMonth) + '/mo</span>' +
                ' \u00b7 Total contract: <span style="color:' + (netTotal >= 0 ? '#5d9b48' : '#b83020') + ';">' +
                (netTotal >= 0 ? '+' : '') + UI.formatMoney(netTotal) + '</span>';
        }
    }

    function confirmContract(idx) {
        var anglerEl = document.getElementById('spon-angler-' + idx);
        if (!anglerEl) { UI.showToast('Could not read contract form.', 'error'); return; }
        offerSponsorship(parseInt(anglerEl.value), _sponSalary[idx], _sponBait[idx], _sponDur[idx]);
    }

    function _buildContractSummary(idx, anglerBudget) {
        var s   = _sponSalary[idx];
        var b   = _sponBait[idx];
        var dur = _sponDur[idx];
        var sig = Math.round(s * 0.5);
        var tot = (s + b) * dur;
        var estimatedVisits = Math.round(dur * 30 * 0.12);
        var estimatedIncome = estimatedVisits * anglerBudget;
        var netGain         = estimatedIncome - tot - sig;
        return '<strong>Total: ' + UI.formatMoney(tot) + '</strong>' +
            ' \u00b7 Signing: ' + UI.formatMoney(sig) +
            ' \u00b7 ~' + estimatedVisits + ' visits' +
            ' \u00b7 Est. income: ' + UI.formatMoney(estimatedIncome) +
            ' \u00b7 <span style="color:' + (netGain >= 0 ? '#5d9b48' : '#b83020') + ';">Net: ' +
            (netGain >= 0 ? '+' : '') + UI.formatMoney(netGain) + '</span>';
    }

    function renderSponsorshipsTab(state) {
        var active      = (state.sponsorships || []).filter(function (s) { return !s.ended; });
        var sponsored   = active.map(function (s) { return s.anglerId; });
        var monthlyCost = active.reduce(function (sum, s) { return sum + s.salary + s.baitBudget; }, 0);
        var html = '';

        // ── Active contracts ──────────────────────────────────────────────────
        if (active.length > 0) {
            html += '<h3 class="section-heading">Active Sponsorships (' + active.length + '/3)</h3>';
            html += '<div class="spon-contract-list">';
            active.forEach(function (sp) {
                var daysLeft = Math.max(0, sp.endDay - state.day);
                var progress = Math.round(((sp.endDay - sp.startDay - daysLeft) / (sp.endDay - sp.startDay)) * 100);
                html += '<div class="spon-contract-card">';
                html += '<div class="spon-contract-header">';
                html += '<span class="spon-name">\uD83E\uDD1D ' + sp.anglerName + '</span>';
                html += '<span class="spon-tag">' + sp.months + '-month contract</span>';
                html += '</div>';
                var spAngler     = getAnglerById(sp.anglerId);
                var sm           = spAngler ? (spAngler.socialMedia || 5) : 5;
                var dailyIncome  = Math.round((sp.salary / 30) * (sm / 5));
                var monthlyRet   = dailyIncome * 30;
                var monthlyCostSp= sp.salary + sp.baitBudget;
                var profit       = monthlyRet - monthlyCostSp;
                var profitCol    = profit >= 0 ? 'var(--colour-accent)' : 'var(--colour-danger)';
                html += '<div class="spon-meta">';
                html += '<span>\uD83D\uDCF1 Social ' + sm + '/10</span>';
                html += '<span>Salary ' + UI.formatMoney(sp.salary) + '/mo</span>';
                html += '<span>Bait ' + UI.formatMoney(sp.baitBudget) + '/mo</span>';
                html += '<span>' + daysLeft + 'd left</span>';
                html += '</div>';
                html += '<div class="spon-roi-row">';
                html += '<span style="color:var(--colour-text-muted);font-size:0.72rem;">Monthly return: <strong style="color:var(--colour-accent);">' + UI.formatMoney(monthlyRet) + '</strong></span>';
                html += '<span style="color:var(--colour-text-muted);font-size:0.72rem;">Net: <strong style="color:' + profitCol + ';">' + (profit >= 0 ? '+' : '') + UI.formatMoney(profit) + '/mo</strong></span>';
                html += '</div>';
                html += '<div class="finance-loan-bar-track" style="margin:0.4rem 0;"><div class="finance-loan-bar-fill" style="width:' + progress + '%;"></div></div>';
                html += '<button class="btn btn-danger btn-sm" onclick="Anglers.cancelSponsorship(' + sp.id + ')">End Early</button>';
                html += '</div>';
            });
            html += '</div>';
            html += '<p class="spon-total">Combined monthly: <strong>' + UI.formatMoney(monthlyCost) + '</strong></p>';
        } else {
            html += '<p class="empty-state">No active sponsorships. Offer a contract below to attract regular visits and earn match cut revenue.</p>';
        }

        if (active.length >= 3) {
            html += '<p class="empty-state" style="margin-top:0.5rem;">Maximum 3 sponsorships active at once.</p>';
            return html;
        }

        // ── Offer new contracts: 1–3 cards depending on slots available ───────
        var slotsAvailable = 3 - active.length;
        var defaultAngler  = ANGLER_POOL.find(function (a) { return sponsored.indexOf(a.id) === -1; }) || ANGLER_POOL[0];
        var defaultBudget  = defaultAngler ? defaultAngler.budget : 35;

        html += '<h3 class="section-heading">Offer a Contract</h3>';
        html += '<div class="spon-offer-cards">';

        for (var idx = 0; idx < slotsAvailable; idx++) {
            var salSegs  = Math.round(_sponSalary[idx] / SALARY_SEG_SIZE);
            var baitSegs = Math.round(_sponBait[idx]   / BAIT_SEG_SIZE);

            html += '<div class="spon-offer-card" id="spon-card-' + idx + '">';
            html += '<div class="spon-card-title">Contract Slot ' + (idx + 1) + '</div>';

            // Select Angler
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Angler</label>';
            html += '<select class="shop-lake-select" id="spon-angler-' + idx + '" onchange="Anglers.updateContractDisplay(' + idx + ')">';
            ANGLER_POOL.forEach(function (a) {
                var already = sponsored.indexOf(a.id) !== -1;
                html += '<option value="' + a.id + '"' + (already ? ' disabled' : '') + '>' +
                    a.name + ' [' + (a.category || 'Professional') + ']' + (already ? ' (sponsored)' : ' — Skill ' + a.skill + '/10 · 📱 ' + a.socialMedia + '/10 · ' + UI.formatMoney(a.budget) + '/day') +
                    '</option>';
            });
            html += '</select>';
            html += '</div>';

            // Salary bar
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Salary</label>';
            html += '<div class="spon-bar-wrap">';
            html += '<div class="spon-bar-track" id="spon-sal-bar-' + idx + '">';
            for (var si = 0; si < SAL_VALS.length; si++) {
                html += '<div class="spon-bar-seg ' + _segColour(si) + (si < salSegs ? ' spon-seg-active' : '') + '"' +
                    ' onclick="Anglers.setSponValue(' + idx + ',\'salary\',' + SAL_VALS[si] + ')"' +
                    ' title="\u00a3' + SAL_VALS[si] + '/mo"></div>';
            }
            html += '</div>';
            html += '<span class="spon-val" id="spon-sal-val-' + idx + '">\u00a3' + _sponSalary[idx] + '/mo</span>';
            html += '</div>';
            html += '</div>';

            // Bait bar
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Bait Budget</label>';
            html += '<div class="spon-bar-wrap">';
            html += '<div class="spon-bar-track" id="spon-bait-bar-' + idx + '">';
            for (var bi = 0; bi < BAIT_VALS.length; bi++) {
                html += '<div class="spon-bar-seg ' + _segColour(bi) + (bi < baitSegs ? ' spon-seg-active' : '') + '"' +
                    ' onclick="Anglers.setSponValue(' + idx + ',\'bait\',' + BAIT_VALS[bi] + ')"' +
                    ' title="\u00a3' + BAIT_VALS[bi] + '/mo"></div>';
            }
            html += '</div>';
            html += '<span class="spon-val" id="spon-bait-val-' + idx + '">\u00a3' + _sponBait[idx] + '/mo</span>';
            html += '</div>';
            html += '</div>';

            // Duration
            html += '<div class="spon-offer-row">';
            html += '<label class="spon-offer-label">Duration</label>';
            html += '<div class="spon-duration-btns">';
            html += '<button class="btn btn-secondary btn-sm spon-dur-btn' + (_sponDur[idx] === 6  ? ' spon-dur-active' : '') + '"' +
                    ' id="spon-dur-6-'  + idx + '" onclick="Anglers.selectContractDuration(' + idx + ',6)">6 Months</button>';
            html += '<button class="btn btn-secondary btn-sm spon-dur-btn' + (_sponDur[idx] === 12 ? ' spon-dur-active' : '') + '"' +
                    ' id="spon-dur-12-' + idx + '" onclick="Anglers.selectContractDuration(' + idx + ',12)">12 Months</button>';
            html += '</div>';
            html += '</div>';

            // Live summary (pre-populated with default angler)
            html += '<div class="spon-offer-summary" id="spon-summary-' + idx + '">' +
                    _buildContractSummary(idx, defaultBudget) + '</div>';

            // Offer button
            html += '<button class="btn btn-primary spon-offer-btn" onclick="Anglers.confirmContract(' + idx + ')">\uD83E\uDD1D Offer Contract</button>';
            html += '</div>'; // .spon-offer-card
        }

        html += '</div>'; // .spon-offer-cards
        return html;
    }

    function renderLeaderboardTab(state) {
        var stats    = state.anglerStats || {};
        var results  = (state.matchResults || []).slice().reverse();
        var cut      = Math.round((state.tournamentCut || 0.20) * 100);
        var RARITY_MEDAL = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

        function topN(sortFn, n) {
            return Object.entries(stats).filter(function (e) { return e[1].fishCaught > 0 || e[1].wins > 0; })
                   .sort(sortFn).slice(0, n);
        }

        var html = '';

        // Tournament cut setting
        html += '<div class="spon-cut-row">';
        html += '<span class="spon-cut-label">\uD83C\uDFC6 Fishery tournament cut:</span>';
        html += '<select class="shop-lake-select" style="width:120px;" onchange="Anglers.setTournamentCut(this.value)">';
        [10, 15, 20, 25, 30].forEach(function (pct) {
            html += '<option value="' + pct + '"' + (pct === cut ? ' selected' : '') + '>' + pct + '%</option>';
        });
        html += '</select>';
        html += '<span class="spon-cut-earned">Earned from matches: <strong>' +
                UI.formatMoney(results.reduce(function(s,r){ return s+r.fisheryGot; }, 0)) + '</strong></span>';
        html += '</div>';

        // Most Fish Caught + Biggest Fish side by side
        html += '<div class="lb-two-col">';

        html += '<div>';
        html += '<h3 class="section-heading">\uD83D\uDC1F Most Fish Caught</h3>';
        var topFish = topN(function (a, b) { return b[1].fishCaught - a[1].fishCaught; }, 3);
        if (topFish.length === 0) {
            html += '<p class="empty-state">No stats yet.</p>';
        } else {
            html += '<div class="lb-list">';
            topFish.forEach(function (e, i) {
                html += '<div class="lb-row">';
                html += '<span class="lb-medal">' + (RARITY_MEDAL[i] || '#' + (i+1)) + '</span>';
                html += '<span class="lb-name">' + e[0] + '</span>';
                html += '<span class="lb-val">' + e[1].fishCaught + ' fish</span>';
                html += '<span class="lb-sub">' + e[1].visits + ' visits</span>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';

        html += '<div>';
        html += '<h3 class="section-heading">\uD83D\uDC1F Biggest Fish</h3>';
        var topBig = topN(function (a, b) { return b[1].biggestFishOz - a[1].biggestFishOz; }, 3)
                     .filter(function (e) { return e[1].biggestFishOz > 0; });
        if (topBig.length === 0) {
            html += '<p class="empty-state">No catches recorded yet.</p>';
        } else {
            html += '<div class="lb-list">';
            topBig.forEach(function (e, i) {
                var wt = typeof UI !== 'undefined' ? UI.formatWeight(e[1].biggestFishOz) : e[1].biggestFishOz + 'oz';
                html += '<div class="lb-row">';
                html += '<span class="lb-medal">' + (RARITY_MEDAL[i] || '#' + (i+1)) + '</span>';
                html += '<span class="lb-name">' + e[0] + '</span>';
                html += '<span class="lb-val">' + wt + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';

        html += '</div>'; // lb-two-col

        // Match/tournament results
        html += '<h3 class="section-heading">\uD83C\uDFC6 Recent Match Results</h3>';
        if (results.length === 0) {
            html += '<p class="empty-state">No matches completed yet.</p>';
        } else {
            html += '<div class="lb-match-list">';
            results.forEach(function (r) {
                html += '<div class="lb-match-row">';
                html += '<span class="lb-match-day">D' + r.day + '</span>';
                html += '<span class="lb-match-name">' + r.matchName + '</span>';
                html += '<span class="lb-match-winner">\uD83C\uDFC6 ' + r.winner + '</span>';
                html += '<span class="lb-match-cut" style="color:var(--colour-accent);">+' + UI.formatMoney(r.fisheryGot) + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        return html;
    }

    function renderRosterTab(state) {
        var html = "<h3 class='section-heading'>Roster</h3>";
        var professionals = ANGLER_POOL.filter(function (a) { return a.category !== 'Amature'; });
        var amatures = ANGLER_POOL.filter(function (a) { return a.category === 'Amature'; });

        function renderAnglerCard(angler, isBooked, suffix) {
            var c = "<div class='angler-card" + (isBooked ? " angler-booked" : "") + "'>" +
                "<div class='angler-card-name'>" + angler.name + (suffix || "") + "</div>" +
                (angler.category !== 'Amature' ? ("<div class='angler-photo-slot'>" + (angler.photo ? "<img src='" + angler.photo + "' alt='" + angler.name + "' class='angler-photo-img' loading='lazy'/>" : "<div class='angler-photo-placeholder'>" + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + "</div>") + "</div>" + "\n                ") : "") +
                "<div class='angler-card-info'>" +
                    "<span class='angler-skill-badge'>Skill " + angler.skill + "/10</span>" +
                    "<span class='angler-social-badge' style='color:" + (angler.socialMedia >= 8 ? '#f1c40f' : angler.socialMedia >= 6 ? '#2ecc71' : '#aaa') + ";'>" + angler.socialMedia + "/10</span>" +
                    "<span class='angler-budget-badge'>" + UI.formatMoney(angler.budget) + "/day</span>" +
                "</div>" +
                "<div class='angler-card-prefs'>" +
                    "<span class='pref-label'>Likes:</span> " + angler.preferred.map(formatWaterType).join(', ') +
                "</div>" +
                "<div class='angler-card-prefs angler-dislikes'>" +
                    "<span class='pref-label'>Dislikes:</span> " + angler.disliked.map(formatWaterType).join(', ') +
                "</div>" +
                (isBooked ? "<div class='angler-status-tag'>Currently Booked</div>" : "") +
            "</div>";
            return c;
        }

        html += "<h4 class='section-heading'>Professional Anglers</h4>";
        html += "<div class='angler-pool-grid'>";
        professionals.forEach(function (angler) {
            var isBooked = (state.anglerBookings || []).some(function (b) {
                return b.anglerId === angler.id && state.day <= b.endDay;
            });
            html += renderAnglerCard(angler, isBooked, '');
        });
        html += "</div>";

        html += "<h4 class='section-heading'>Amature Anglers</h4>";
        html += "<div class='angler-pool-grid'>";
        amatures.forEach(function (angler) {
            var isBooked = (state.anglerBookings || []).some(function (b) {
                return b.anglerId === angler.id && state.day <= b.endDay;
            });
            html += renderAnglerCard(angler, isBooked, isBooked ? ' - BOOKED' : '');
        });
        html += "</div>";

        return html;
    }

    function showAnglerDetails(anglerId) {
        var angler = getAnglerById(anglerId);
        if (!angler) return;

        var catClass = angler.category === 'Amature' ? 'cat-amature' : 'cat-professional';
        var photoHtml = '';
        if (angler.category !== 'Amature' && angler.photo) {
            photoHtml = '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-detail-photo"/>';
        } else if (angler.category !== 'Amature') {
            photoHtml = '<div class="angler-photo-placeholder angler-detail-photo">' + angler.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2).toUpperCase() + '</div>';
        }

        var html = '<div class="angler-detail-modal">';
        html += '<div class="angler-detail-header">';
        html += '<div class="angler-detail-title"><h2>' + angler.name + '</h2><span class="angler-category-badge ' + catClass + '">' + (angler.category || 'Professional') + '</span></div>';
        html += '<div class="angler-detail-photo-wrap">' + photoHtml + '</div>';
        html += '</div>';

        html += '<div class="angler-detail-body">';

        if (angler.bio) {
            html += '<p class="angler-bio">' + angler.bio + '</p>';
        }

        html += '<div class="angler-stats-grid">';
        html += '<div class="angler-stat-box"><span class="angler-stat-label">Skill</span><span class="angler-stat-val">' + angler.skill + '/10</span></div>';
        html += '<div class="angler-stat-box"><span class="angler-stat-label">Social</span><span class="angler-stat-val" style="color:' + (angler.socialMedia >= 8 ? '#f1c40f' : angler.socialMedia >= 6 ? '#2ecc71' : '#aaa') + ';\">' + angler.socialMedia + '/10</span></div>';
        html += '<div class="angler-stat-box"><span class="angler-stat-label">Budget</span><span class="angler-stat-val">' + UI.formatMoney(angler.budget) + '/day</span></div>';
        html += '</div>';

        if (angler.signatureCatch) {
            html += '<div class="angler-detail-section"><h4>Signature Catch</h4><p>' + angler.signatureCatch + '</p></div>';
        }
        if (angler.competitionsWon && angler.competitionsWon.length) {
            html += '<div class="angler-detail-section"><h4>Competitions Won</h4><ul>' + angler.competitionsWon.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul></div>';
        }
        if (angler.notableWaters && angler.notableWaters.length) {
            html += '<div class="angler-detail-section"><h4>Notable Waters</h4><p>' + angler.notableWaters.join(', ') + '</p></div>';
        }
        if (angler.techniques && angler.techniques.length) {
            html += '<div class="angler-detail-section"><h4>Techniques</h4><p>' + angler.techniques.join(', ') + '</p></div>';
        }
        if (angler.legacy) {
            html += '<div class="angler-detail-section angler-legacy"><h4>Legacy</h4><p>' + angler.legacy + '</p></div>';
        }

        html += '<div class="angler-detail-section">';
        html += '<h4>Likes</h4><p>' + angler.preferred.map(formatWaterType).join(', ') + '</p>';
        html += '<h4>Dislikes</h4><p>' + angler.disliked.map(formatWaterType).join(', ') + '</p>';
        html += '</div>';

        // Show player quests if viewing your own angler
        var state = Game.getState();
        if (state.playerAnglerId === angler.id && state.anglerQuests && state.anglerQuests.length) {
            html += '<div style="margin-top:1rem;border-top:1px solid var(--colour-border);padding-top:0.75rem;">';
            html += '<h4 style="margin:0 0 0.6rem;font-size:0.95rem;color:var(--colour-gold);">🎯 Your Quests</h4>';
            html += '<div style="display:flex;flex-direction:column;gap:0.6rem;">';
            state.anglerQuests.forEach(function(q) {
                var pct = Math.min(100, Math.round((q.progress / q.required) * 100));
                var statusClass = q.claimed ? 'quest-claimed' : (q.completed ? 'quest-complete' : 'quest-active');
                var statusText = q.claimed ? 'Claimed' : (q.completed ? 'Complete!' : 'In Progress');
                html += '<div class="angler-quest-card ' + statusClass + '">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">';
                html += '<div style="font-weight:700;">' + q.title + '</div>';
                html += '<div style="font-size:0.75rem;color:var(--colour-text-muted);">' + statusText + '</div>';
                html += '</div>';
                html += '<div style="font-size:0.8rem;color:var(--colour-text-muted);margin:0.35rem 0 0.4rem;">' + q.description + '</div>';
                html += '<div class="quest-bar-track"><div class="quest-bar-fill" style="width:' + pct + '%;background:' + (q.completed ? 'var(--colour-accent)' : 'linear-gradient(90deg,#f1c40f,#e67e22)') + ';"></div></div>';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-top:0.35rem;">';
                html += '<span style="font-size:0.75rem;">' + q.progress + ' / ' + q.required + '</span>';
                if (q.completed && !q.claimed) {
                    html += '<button class="btn btn-primary btn-sm" onclick="Anglers.claimAnglerQuest(' + q.id + ');UI.hideModal();">Claim</button>';
                }
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';
        }

        html += '<button class="btn btn-secondary" onclick="UI.hideModal()">Close</button>';
        html += '</div>';
        html += '</div>';

        UI.showModal(html);
    }

    function generateAnglerQuests() {
        var state = Game.getState();
        if (!state.playerAnglerId) return;
        if (!state.anglerQuests) state.anglerQuests = [];
        if (state.anglerQuests.length > 0) return;

        var angler = getAnglerById(state.playerAnglerId);
        if (!angler) return;

        var qid = 1;
        var skill = typeof angler.skill === 'number' ? angler.skill : 5;
        var baseCatchTarget = 20 + skill * 5;
        var baseWinTarget = 5 + skill;
        var prizeTarget = 3000 + skill * 1000;

        state.anglerQuests.push({
            id: qid++, title: 'Catch ' + baseCatchTarget + ' Fish',
            description: 'Accumulate ' + baseCatchTarget + ' total catches across your fishery.',
            target: 'fishCaught', required: baseCatchTarget, progress: 0,
            rewardMoney: 500, rewardRep: 25, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Win ' + baseWinTarget + ' Matches',
            description: 'Win ' + baseWinTarget + ' angling matches to build reputation.',
            target: 'wins', required: baseWinTarget, progress: 0,
            rewardMoney: 1000, rewardRep: 50, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Prize Winner (£' + prizeTarget.toLocaleString() + ')',
            description: 'Earn £' + prizeTarget.toLocaleString() + ' in tournament winnings.',
            target: 'winnings', required: prizeTarget, progress: 0,
            rewardMoney: prizeTarget * 0.1, rewardRep: 35, completed: false, claimed: false
        });
        if (angler.skill >= 7) {
            state.anglerQuests.push({
                id: qid++, title: '10lb Trophy',
                description: 'Land a fish over 160 oz as your biggest catch.',
                target: 'biggestFishOz', required: 160, progress: 0,
                rewardMoney: 2000, rewardRep: 75, completed: false, claimed: false
            });
        }

        // Try to grant immediate progress based on current anglerStats if present
        updateAnglerQuestProgress();
    }

    function updateAnglerQuestProgress() {
        var state = Game.getState();
        if (!state.anglerQuests || state.anglerQuests.length === 0 || !state.playerAnglerId) return;
        var angler = getAnglerById(state.playerAnglerId);
        if (!angler) return;
        var stats = (state.anglerStats || {})[angler.name] || { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        state.anglerQuests.forEach(function(q) {
            if (q.completed) return;
            q.progress = stats[q.target] || 0;
            if (q.progress >= q.required) {
                q.completed = true;
            }
        });
    }

    function claimAnglerQuest(questId) {
        var state = Game.getState();
        if (!state.anglerQuests) return;
        var quest = state.anglerQuests.find(function(q){ return q.id === questId; });
        if (!quest || !quest.completed || quest.claimed) return;
        quest.claimed = true;
        state.money += quest.rewardMoney;
        state.reputation += quest.rewardRep;
        if (typeof Finance !== 'undefined') {
            var logEntry = {
                day: state.day,
                type: 'angler_quest',
                description: 'Quest reward: ' + quest.title,
                amount: quest.rewardMoney,
                balance: state.money
            };
            if (!state.financeLog) state.financeLog = [];
            state.financeLog.push(logEntry);
        }
    }

    return {
        initState: initState,
        getAnglerById: getAnglerById,
        getAllAnglers: getAllAnglers,
        generateBookingRequests: generateBookingRequests,
        processDailyBookings: processDailyBookings,
        renderAnglers: renderAnglers,
        render: renderAnglers,
        renderRosterTab: renderRosterTab,
        getLakeColour: getLakeColour,
        showAnglerView: showAnglerView,
        renderRosterTab: renderRosterTab,
        offerSponsorship: offerSponsorship,
        cancelSponsorship: cancelSponsorship,
        getSponsoredAnglerIds: getSponsoredAnglerIds,
        selectContractDuration: selectContractDuration,
        setSponValue:           setSponValue,
        updateContractDisplay:  updateContractDisplay,
        confirmContract:        confirmContract,
        setTournamentCut: function (pct) {
            var state = Game.getState();
            state.tournamentCut = Math.max(0.05, Math.min(0.50, parseInt(pct) / 100));
            Game.saveToStorage();
            renderAnglers();
        },
        showAnglerDetails: showAnglerDetails,
        generateAnglerQuests: generateAnglerQuests,
        updateAnglerQuestProgress: updateAnglerQuestProgress,
        claimAnglerQuest: claimAnglerQuest
    };
})();
window.Anglers = Anglers;
