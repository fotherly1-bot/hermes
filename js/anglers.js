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
        { id: 10, name: 'Rob Hughes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7,  photo: 'img/anglers/rob-hughes.png', category: 'Professional',
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
        { id: 18, name: 'Jim Shelley',      preferred: ['gravel_pit','estate_lake'],  disliked: ['still'],       budget: 50, skill: 8,  socialMedia: 8,  photo: 'img/anglers/jimshelley112.png', category: 'Professional',
          bio: 'A rugged north-country angler, Jim Shelley thrives in cold, windy conditions where others pack up. He specialises in winter carp and deep-water locating.',
          signatureCatch: 'A 50lb common caught through 5 inches of ice on a deadbait drop-off.',
          competitionsWon: ['Winter Carp Championship 2018', 'Ice Fishing Derby 2020', 'North-South Challenge 2022'],
          notableWaters: ['Yorkshire Dales Reservoir', 'Lake Windermere', 'Kielder Water'],
          techniques: ['Deadbaiting', 'Ice Fishing', 'Deep Drop-offs'],
          legacy: 'Revolutionised winter carp fishing in northern England. His ice-fishing techniques are now taught across British winter angling courses.' },
        { id: 19, name: 'Lee Jackson',      preferred: ['still','gravel_pit'],        disliked: ['running'],     budget: 30, skill: 5,  socialMedia: 4,  photo: 'img/anglers/leejackson112.png', category: 'Professional',
          bio: 'A bait scientist at heart, Lee Jackson spends more time boiling up test batches than actually fishing. His scientific method to attractants turned casual sessions into high-volume catching.',
          signatureCatch: 'A 37lb common caught on an experimental krill boilie from a commercial lake.',
          competitionsWon: ['Bait Science Cup 2016'],
          notableWaters: ['Commercial Match Lake', 'Topcliffe', 'Avenue'],
          techniques: ['Boilie Experimentation', 'Method Feeders', 'Glugging'],
          legacy: 'Turned bait science into a credible competitive edge. His published boilie recipes remain reference works for serious specimen anglers.' },
        { id: 20, name: 'Adam Penning',     preferred: ['running','gravel_pit'],      disliked: ['estate_lake'], budget: 35, skill: 6,  socialMedia: 5,  photo: 'img/anglers/adampenning12.png', category: 'Professional',
          bio: 'Quiet and intensely private, Adam Penning lets his catches speak louder than any interview. He is one of the UKs most elusive big-fish specialists, with a decades-long track record of rarely sharing swims.',
          signatureCatch: 'A 57lb mirror from the fabled Syndicate X, caught on a light pop-up rig.',
          competitionsWon: ['Syndicate Grand Slam 2019', 'UK Specimen Prize 2021'],
          notableWaters: ['Syndicate X', 'Grovers', 'St Ives Estate'],
          techniques: ['Light Pop-ups', 'Stalking', 'Single Hookbaits'],
          legacy: 'His secretive big-fish methodology inspired a generation of low-profile specimen hunters. Many of today\'s top secrets originated from his shadow.' },
        { id: 21, name: 'Gary Bayes',       preferred: ['estate_lake','still'],       disliked: ['running'],     budget: 45, skill: 7,  socialMedia: 4,  photo: 'img/anglers/garrybayes112.png', category: 'Professional',
          bio: 'A former national coach turned TV analyst, Gary Bayes dissects carp behaviour with a clinical eye. His broadcast commentary has educated millions while he still finds time to fish internationally.',
          signatureCatch: 'A 45lb Wels catfish from the Danube, caught on a livebait setup.',
          competitionsWon: ['International Coach of the Year 2014', 'European Analysts Cup 2017', 'Danube Derby 2020'],
          notableWaters: ['Danube River', 'Walthamstow', 'Raven Ait'],
          techniques: ['Livebaiting', 'Euro-style Rigs', 'Fish Radar'],
          legacy: 'Brought scientific analysis to mainstream carp fishing broadcasting. His coaching frameworks are used by national teams across Europe.' },
        { id: 22, name: 'Ian Chillcott',    preferred: ['gravel_pit','estate_lake'],  disliked: ['running'],     budget: 50, skill: 8,  socialMedia: 7,  photo: 'img/anglers/ianchillcott112.png', category: 'Professional',
          bio: 'A pressure-cooker performer, Ian Chillcott thrives in high-stakes televised finals where every cast is watched by thousands. He is as famous for his mental game as his technical skill.',
          signatureCatch: 'A sensational 53lb common from the Black Swan, landed on a last-chance rig in a televised final.',
          competitionsWon: ['Carp Challenge TV Winner 2015', 'Pressure Cup 2018', 'Angling Masters 2020'],
          notableWaters: ['Black Swan', 'Rashs', 'Lessers'],
          techniques: ['Televised Tactics', 'Boilie Rigs', 'Mental Preparation'],
          legacy: 'Set the benchmark for performing under camera pressure. His mental preparation routines are now standard for elite television match anglers.' },
        { id: 23, name: 'Keith Jenkins',    preferred: ['still','running'],           disliked: ['gravel_pit'],  budget: 25, skill: 4,  socialMedia: 3,  photo: 'img/anglers/keithjenkins1122.png', category: 'Professional',
          bio: 'A retired steelworker with a lifelong love of low-cost, low-tech fishing, Keith Jenkins proves you do not need expensive tackle to catch specimen carp. His sessions are powered by patience and local knowledge.',
          signatureCatch: 'A personal best 40lb common from a council-run lake, caught on a simple ledger rig.',
          competitionsWon: ['Grassroots Angler of the Year 2017'],
          notableWaters: ['Council Lake', 'Darnall Park', 'Tinsley Marina'],
          techniques: ['Ledgering', 'Bread Crust', 'Worm Fishing'],
          legacy: 'Championed accessible, low-cost carp fishing for working-class anglers. His community tackle-sharing scheme continues to help new anglers get started.' },
        { id: 24, name: 'Paul Forward',     preferred: ['running','still'],           disliked: ['estate_lake'], budget: 30, skill: 5,  socialMedia: 4,  photo: 'img/anglers/paulforward112.png', category: 'Professional',
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
        if (!state.anglerTackle) state.anglerTackle = [];
        if (!state.anglerBait) state.anglerBait = [];
        if (!state.anglerStats) state.anglerStats = {};
        if (!state.lastProcessedSeason) state.lastProcessedSeason = getCurrentSeasonNum(state.day);
        if (state.playerAnglerId) {
            var angler = (typeof Anglers !== 'undefined' && typeof Anglers.getAnglerById === 'function')
                ? Anglers.getAnglerById(state.playerAnglerId)
                : null;
            var nameKey = angler ? angler.name : state.playerAnglerId;
            var p = (state.anglerStats[nameKey] || {});
            if (typeof p.skill !== 'number') p.skill = 5;
            if (typeof p.socialMedia !== 'number') p.socialMedia = 5;
            if (!p.fishCaught) p.fishCaught = 0;
            if (!p.biggestFishOz) p.biggestFishOz = 0;
            if (!p.wins) p.wins = 0;
            if (!p.winnings) p.winnings = 0;
            if (!p.visits) p.visits = 0;
            if (!p.tripFishCaught) p.tripFishCaught = 0;
            state.anglerStats[nameKey] = p;
        }
        if (!state.playerAnglerId) {
            var anglers = (typeof Anglers !== 'undefined' && typeof Anglers.getAllAnglers === 'function')
                ? Anglers.getAllAnglers()
                : [];
            if (anglers.length) state.playerAnglerId = anglers[0].id;
        }
    }

    /**
     * Carp fishing tackle catalog.
     * Each item has an id, name, description, cost, category, icon,
     * and an effects object that is applied daily to the player's angler.
     */
    var TACKLE_CATALOG = [
        // Rods
        { id:'rod_12ft_carp', name:'12ft Carp Rod', cost:1800, icon:'🎣', category:'Rod', description:'Versatile 12ft rod for general carp fishing.', effects:{catchRateBonus:0.02}, prerequisite:null, unlocks:['rod_carbon_carp']},
        { id:'rod_carbon_carp', name:'Carbon Carp Rod', cost:2600, icon:'🎣', category:'Rod', description:'Lightweight carbon blank with responsive action.', effects:{catchRateBonus:0.03, castRangeBonus:0.02}, prerequisite:'rod_12ft_carp', unlocks:['rod_13ft_carp']},
        { id:'rod_13ft_carp', name:'13ft Carp Rod', cost:3400, icon:'🎣', category:'Rod', description:'Extra length for longer casts and better leverage.', effects:{castRangeBonus:0.05, catchRateBonus:0.02}, prerequisite:'rod_carbon_carp', unlocks:['rod_custom_carp']},
        { id:'rod_custom_carp', name:'Custom Carp Rod', cost:4800, icon:'🎣', category:'Rod', description:'Bespoke build tuned for specimen carp.', effects:{castRangeBonus:0.08, catchRateBonus:0.04, breakStrengthBonus:0.02}, prerequisite:'rod_13ft_carp', unlocks:[]},
        // Reels
        { id:'standard_reel', name:'Standard Reel', cost:1200, icon:'🔄', category:'Reel', description:'Reliable entry-level fixed spool reel.', effects:{catchRateBonus:0.02}, prerequisite:null, unlocks:['big_pit_reel']},
        { id:'big_pit_reel', name:'Big Pit Reel', cost:3000, icon:'🔄', category:'Reel', description:'Large spool for long casts and strong runs.', effects:{castRangeBonus:0.06}, prerequisite:'standard_reel', unlocks:['big_pit_12k_reel']},
        { id:'big_pit_12k_reel', name:'Big Pit 12k Reel', cost:4200, icon:'🔄', category:'Reel', description:'12k bearing system with extra smooth retrieve.', effects:{castRangeBonus:0.08, catchRateBonus:0.02}, prerequisite:'big_pit_reel', unlocks:['big_pit_14k_reel']},
        { id:'big_pit_14k_reel', name:'Big Pit 14k Reel', cost:5500, icon:'🔄', category:'Reel', description:'14k high-speed retrieve for instant line pickup.', effects:{castRangeBonus:0.09, catchRateBonus:0.03}, prerequisite:'big_pit_12k_reel', unlocks:[]},
        // Main Line
        { id:'mono_10lb', name:'10lb Mono Mainline', cost:800, icon:'🧵', category:'Main Line', description:'Stretchy mono that absorbs shock.', effects:{breakStrengthBonus:0.05}, prerequisite:null, unlocks:['fluoro_12lb']},
        { id:'fluoro_12lb', name:'12lb Fluorocarbon', cost:1200, icon:'🧵', category:'Main Line', description:'Low-visibility fluorocarbon mainline.', effects:{breakStrengthBonus:0.07, catchRateBonus:0.01}, prerequisite:'mono_10lb', unlocks:['copolymer_12lb']},
        { id:'copolymer_12lb', name:'12lb Copolymer Line', cost:1400, icon:'🧵', category:'Main Line', description:'Sinking copolymer for bottom fishing.', effects:{catchRateBonus:0.02}, prerequisite:'fluoro_12lb', unlocks:['titanium_15lb']},
        { id:'titanium_15lb', name:'15lb Titanium Leader Line', cost:1700, icon:'🧵', category:'Main Line', description:'Abrasion-resistant leader material.', effects:{breakStrengthBonus:0.08}, prerequisite:'copolymer_12lb', unlocks:[]},
        // Leads
        { id:'backlead_1oz', name:'1oz Backlead', cost:400, icon:'🪨', category:'Leads', description:'Light backlead for slip presentations.', effects:{castRangeBonus:0.02}, prerequisite:null, unlocks:['inline_lead_2oz']},
        { id:'inline_lead_2oz', name:'2oz Inline Lead', cost:500, icon:'🪨', category:'Leads', description:'Classic inline lead for distance.', effects:{castRangeBonus:0.03, hookSetBonus:0.02}, prerequisite:'backlead_1oz', unlocks:['window_lead_2oz']},
        { id:'window_lead_2oz', name:'2oz Window Lead', cost:650, icon:'🪨', category:'Leads', description:'Window lead for hard lake beds.', effects:{hookSetBonus:0.03}, prerequisite:'inline_lead_2oz', unlocks:['method_lead_3oz']},
        { id:'method_lead_3oz', name:'3oz Method Lead', cost:700, icon:'🪨', category:'Leads', description:'Method lead with open insert.', effects:{catchRateBonus:0.03, hookSetBonus:0.01}, prerequisite:'window_lead_2oz', unlocks:[]},
        // Bivvys
        { id:'bivvy_groundsheet', name:'Insulated Groundsheet', cost:700, icon:'⛺', category:'Bivvys', description:'Keeps moisture out and warmth in.', effects:{fishHealthBonus:0.02}, prerequisite:null, unlocks:['bivvy_brolly']},
        { id:'bivvy_brolly', name:'Brolly System', cost:900, icon:'⛺', category:'Bivvys', description:'Quick-deploy umbrella shelter.', effects:{fishHealthBonus:0.01, satisfactionBonus:1}, prerequisite:'bivvy_groundsheet', unlocks:['bivvy_1man']},
        { id:'bivvy_1man', name:'1-Man Bivvy', cost:1200, icon:'⛺', category:'Bivvys', description:'Compact shelter for solo sessions.', effects:{fishHealthBonus:0.02, satisfactionBonus:2}, prerequisite:'bivvy_brolly', unlocks:['bivvy_overwrap']},
        { id:'bivvy_overwrap', name:'Bivvy Overwrap', cost:1600, icon:'⛺', category:'Bivvys', description:'Weatherproof overwrap for cold nights.', effects:{fishHealthBonus:0.02, satisfactionBonus:2}, prerequisite:'bivvy_1man', unlocks:[]},
        // Alarms
        { id:'wireless_receiver', name:'Wireless Receiver', cost:900, icon:'🔔', category:'Alarms', description:'Receiver for wireless bite alarms.', effects:{catchRateBonus:0.03}, prerequisite:null, unlocks:['swinger_kit']},
        { id:'swinger_kit', name:'Swinger Kit', cost:1600, icon:'🔔', category:'Alarms', description:'Rod-mounted swingers for quick bites.', effects:{catchRateBonus:0.05}, prerequisite:'wireless_receiver', unlocks:['siren_deluxe']},
        { id:'siren_deluxe', name:'Deluxe Siren Alarm', cost:2000, icon:'🔔', category:'Alarms', description:'Loud siren alarm for noisy lakes.', effects:{catchRateBonus:0.05}, prerequisite:'swinger_kit', unlocks:['bite_alarm_set']},
        { id:'bite_alarm_set', name:'3-Rod Alarm Set', cost:2600, icon:'🔔', category:'Alarms', description:'Set of three with LED indicators.', effects:{catchRateBonus:0.06}, prerequisite:'siren_deluxe', unlocks:[]},
        // Landing Nets
        { id:'landing_net_retainer', name:'Retainer Sling', cost:600, icon:'🥅', category:'Landing Nets', description:'Retainer sling for unhooking safely.', effects:{fishHealthBonus:0.03}, prerequisite:null, unlocks:['landing_net_standard']},
        { id:'landing_net_standard', name:'Standard Landing Net', cost:800, icon:'🥅', category:'Landing Nets', description:'Durable net with soft mesh.', effects:{fishHealthBonus:0.03}, prerequisite:'landing_net_retainer', unlocks:['landing_net_carp']},
        {id:'landing_net_carp', name:'Carp Landing Net', cost:1200, icon:'🥅', category:'Landing Nets', description:'Large carp net with rubber mesh.', effects:{fishHealthBonus:0.04, breakStrengthBonus:0.02}, prerequisite:'landing_net_standard', unlocks:['landing_net_speci']},
        {id:'landing_net_speci', name:'Specimen Net', cost:1400, icon:'🥅', category:'Landing Nets', description:'Wide-mesh net for big specimens.', effects:{fishHealthBonus:0.06}, prerequisite:'landing_net_carp', unlocks:[]},
        // Fish Care
        { id:'first_aid_kit', name:'Angler First Aid Kit', cost:400, icon:'🛟', category:'Fish Care', description:'Small kit for hook and nick care.', effects:{fishHealthBonus:0.02}, prerequisite:null, unlocks:['unhooking_mat']},
        { id:'unhooking_mat', name:'Unhooking Mat', cost:700, icon:'🛟', category:'Fish Care', description:'Padded mat for safe unhooking.', effects:{fishHealthBonus:0.04}, prerequisite:'first_aid_kit', unlocks:['weigh_sling']},
        { id:'weigh_sling', name:'Weigh Sling', cost:900, icon:'🛟', category:'Fish Care', description:'Support sling for accurate weighing.', effects:{fishHealthBonus:0.03}, prerequisite:'unhooking_mat', unlocks:['carp_cradle']},
        { id:'carp_cradle', name:'Carp Cradle', cost:1400, icon:'🛟', category:'Fish Care', description:'Cradle for unhooking on the mat.', effects:{fishHealthBonus:0.05}, prerequisite:'weigh_sling', unlocks:[]},
        // Extras
        { id:'rod_rest', name:'Rod Rest Kit', cost:450, icon:'🛠️', category:'Extras', description:'Adjustable rod rest for steady holds.', effects:{catchRateBonus:0.02}, unlocks:[]},
        { id:'stool', name:'Fishing Stool', cost:500, icon:'🪑', category:'Extras', description:'Comfortable padded seat.', effects:{satisfactionBonus:2}, unlocks:[]},
        { id:'landing_forceps', name:'Forceps & Pliers', cost:350, icon:'🛠️', category:'Extras', description:'Forceps for safe hook removal.', effects:{fishHealthBonus:0.02}, unlocks:[]},
        { id:'scale', name:'Digital Scales', cost:800, icon:'⚖️', category:'Extras', description:'Digital scales to 120lb capacity.', effects:{fishHealthBonus:0.02}, unlocks:[]}
    ];

    /** Sub-tab state */
    var _anglerView = 'your_angler'; // 'your_angler' | 'bookings' | 'roster' | 'sponsorships' | 'leaderboard'

    /**
     * Get the combined effects from all owned tackle.
     */
    function getTackleEffects() {
        var state = Game.getState();
        var owned = state.anglerTackle || [];
        var combined = { weightBonus: 0, catchRateBonus: 0, satisfactionBonus: 0, reputationBonus: 0, fishHealthBonus: 0, castRangeBonus: 0, hookSetBonus: 0, breakStrengthBonus: 0 };
        owned.forEach(function (tackleId) {
            var item = TACKLE_CATALOG.find(function (t) { return t.id === tackleId; });
            if (!item || !item.effects) return;
            Object.keys(item.effects).forEach(function (key) {
                if (combined.hasOwnProperty(key)) {
                    combined[key] += item.effects[key];
                }
            });
        });
        return combined;
    }

    /** Get the combined effects from all owned bait. */
    function getBaitEffects() {
        initState();
        var state = Game.getState();
        var owned = state.anglerBait || [];
        var combined = { weightBonus: 0, catchRateBonus: 0, lakeBonus: 0 };
        var catalog = [];
        catalog = [];
        if (!catalog.length) {
            catalog = [
                {id:'popup_white', name:'White Popups', cost:350, effects:{catchRateBonus:0.01}},
                {id:'popup_yellow', name:'Yellow Popups', cost:400, effects:{catchRateBonus:0.01, lakeBonus:0.02}},
                {id:'popup_pink', name:'Pink Popups', cost:400, effects:{catchRateBonus:0.01}},
                {id:'popup_orange', name:'Orange Popups', cost:400, effects:{catchRateBonus:0.01}},
                {id:'popup_purple', name:'Purple Popups', cost:420, effects:{catchRateBonus:0.01}},
                {id:'boilie_fishmeal', name:'Fishmeal Boilies', cost:500, effects:{catchRateBonus:0.02}},
                {id:'boilie_birdfood', name:'Birdfood Blend Boilies', cost:550, effects:{catchRateBonus:0.02}},
                {id:'boilie_tigernut', name:'Tiger Nut Boilies', cost:600, effects:{catchRateBonus:0.02, weightBonus:0.01}},
                {id:'spod_mix', name:'Spod Mix', cost:550, effects:{catchRateBonus:0.01, lakeBonus:0.02}}
            ];
        }
        var lookup = {};
        catalog.forEach(function(it){ lookup[it.id] = it; });
        owned.forEach(function (baitId) {
            var item = lookup[baitId];
            if (!item || !item.effects) return;
            Object.keys(item.effects).forEach(function (key) {
                if (combined.hasOwnProperty(key)) combined[key] += item.effects[key];
            });
        });
        return combined;
    }

    function getCastDistanceM() {
        var effects = getTackleEffects();
        var bonus = effects.castRangeBonus || 0;
        return Math.round(35 * (1 + bonus));
    }

    /**
     * Purchase a tackle item if the player can afford it.
     */
    function buyTackle(tackleId) {
        initState();
        var state = Game.getState();
        var item = TACKLE_CATALOG.find(function (t) { return t.id === tackleId; });
        if (!item) { UI.showToast('Tackle not found.', 'error'); return false; }
        if ((state.anglerTackle || []).indexOf(tackleId) !== -1) {
            UI.showToast('You already own ' + item.name + '.', 'warning');
            return false;
        }
        if (tackleId !== 'rod_12ft_carp' && item.prerequisite && (state.anglerTackle || []).indexOf(item.prerequisite) === -1) {
            var prereqName = (function(){
                try { var it = TACKLE_CATALOG.find(function(t){return t.id===item.prerequisite;}); return it ? it.name : item.prerequisite; }
                catch(e) { return item.prerequisite; }
            })();
            UI.showToast('Unlock required: ' + prereqName, 'warning');
            return false;
        }
        if ((state.pendingTacklePurchases || []).indexOf(tackleId) !== -1) {
            UI.showToast(item.name + ' is already pending delivery.', 'warning');
            return false;
        }
        if (!Game.spendMoney(item.cost)) {
            UI.showToast('Not enough money! You need ' + UI.formatMoney(item.cost) + '.', 'error');
            return false;
        }
        (state.pendingTacklePurchases || []).push(tackleId);
        UI.showToast(item.icon + ' ' + item.name + ' ordered — it arrives tomorrow.', 'success');
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('tackle_purchase', -item.cost, item.name + ' (pending)');
        }
        Game.saveToStorage && Game.saveToStorage();
        renderAnglers && renderAnglers();
        return true;
    }

    /** Purchase a bait item if the player can afford it. */
    function buyBait(baitId) {
        initState();
        var state = Game.getState();
        var catalog = [];
        catalog = [];
        if (!catalog.length) {
            catalog = [
                {id:'popup_white', name:'White Popups', cost:350},
                {id:'popup_yellow', name:'Yellow Popups', cost:400},
                {id:'popup_pink', name:'Pink Popups', cost:400},
                {id:'popup_orange', name:'Orange Popups', cost:400},
                {id:'popup_purple', name:'Purple Popups', cost:420},
                {id:'boilie_fishmeal', name:'Fishmeal Boilies', cost:500},
                {id:'boilie_birdfood', name:'Birdfood Blend Boilies', cost:550},
                {id:'boilie_tigernut', name:'Tiger Nut Boilies', cost:600},
                {id:'spod_mix', name:'Spod Mix', cost:550}
            ];
        }
        var item = catalog.find(function(b){ return b.id === baitId; });
        if (!item) {
            UI.showToast('Bait not found.', 'error');
            return false;
        }
        if (baitId === 'boilie_standard') item.cost = 0;
        if ((state.anglerBait || []).indexOf(baitId) !== -1) {
            UI.showToast('You already own ' + item.name + '.', 'warning');
            return false;
        }
        if ((state.pendingBaitPurchases || []).indexOf(baitId) !== -1) {
            UI.showToast(item.name + ' is already pending delivery.', 'warning');
            return false;
        }
        if ((state.money || 0) < (item.cost || 0)) {
            UI.showToast('Not enough money for ' + item.name + '.', 'error');
            return false;
        }
        state.money -= (item.cost || 0);
        (state.pendingBaitPurchases || (state.pendingBaitPurchases = [])).push(baitId);
        UI.showToast('🪱 ' + item.name + ' ordered — it arrives tomorrow.', 'success');
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('bait_purchase', -(item.cost || 0), item.name + ' (pending)');
        }
        if (typeof UI !== 'undefined' && typeof UI.updateTransitBanner === 'function') UI.updateTransitBanner();
        Game.saveToStorage && Game.saveToStorage();
        renderAnglers && renderAnglers();
        if (typeof Shop !== 'undefined' && typeof Shop.renderShop === 'function') Shop.renderShop();
        return true;
    }

    function buyRig(rigId) {
        initState();
        var state = Game.getState();
        var def = (typeof Rigs !== 'undefined' ? Rigs.getRigById(rigId) : null);
        if (!def) { UI.showToast('Rig not found.', 'error'); return false; }
        if ((state.rigInventory || []).indexOf(rigId) !== -1) {
            UI.showToast('You already own ' + def.name + '.', 'warning');
            return false;
        }
        var cost = def.cost || 2500;
        if (!Game.spendMoney(cost)) {
            UI.showToast('Not enough money! You need ' + UI.formatMoney(cost) + '.', 'error');
            return false;
        }
        state.rigInventory.push(rigId);
        UI.showToast(def.icon + ' ' + def.name + ' added to your tackle box!', 'success');
        if (typeof Finance !== 'undefined') {
            Finance.addFinanceLog('rig_purchase', -cost, def.name);
        }
        Game.saveToStorage();
        renderAnglers();
        return true;
    }

    /**
     * Apply daily tackle effects.
     * Call this from game.js nextDay() or Anglers.processDailyBookings().
     */
    function processTackleEffects() {
        initState();
        var state = Game.getState();
        var effects = getTackleEffects();
        if (effects.reputationBonus > 0) {
            addReputation(effects.reputationBonus);
        }
        if (effects.fishHealthBonus > 0 && state.fish) {
            state.fish.forEach(function (fish) {
                if (fish.alive) {
                    fish.stats.health = Math.min(100, (fish.stats.health || 0) + effects.fishHealthBonus);
                }
            });
        }
    }

    /**
     * At the end of each season, anglers with socialMedia=10 who are not in
     * the top 5 on the leaderboard lose 1 social media point.
     */
    function processSeasonalSocialDecay() {
        initState();
        var state = Game.getState();
        var season = getCurrentSeasonNum(state.day);
        if (state.lastProcessedSeason === season) return;
        state.lastProcessedSeason = season;

        var stats = state.anglerStats || {};
        var ranked = Object.entries(stats)
            .filter(function (e) { return e[1].fishCaught > 0 || e[1].wins > 0; })
            .sort(function (a, b) { return (b[1].fishCaught || 0) - (a[1].fishCaught || 0); });

        var top5 = ranked.slice(0, 5).map(function (e) { return e[0]; });
        var affected = [];
        ranked.forEach(function (entry) {
            var name = entry[0];
            var s = entry[1];
            if (typeof s.socialMedia === 'number' && s.socialMedia >= 10 && top5.indexOf(name) === -1) {
                s.socialMedia = Math.max(0, s.socialMedia - 1);
                affected.push(name);
            }
        });
        if (affected.length > 0) {
            Game.addNotification('📉 Season change: ' + affected.join(', ') + ' lost 1 social media point for not being in the top 5.');
        }
    }

    function showAnglerView(view) {
        _anglerView = view;
        renderAnglers();
    }
    function getAnglerById(id) {
        var angler = ANGLER_POOL.find(function (a) { return a.id === id; }) || null;
        if (!angler) return null;
        var state = Game.getState();
        var stored = (state.anglerStats || {})[angler.name] || {};
        if (typeof stored.skill === 'number') angler.skill = stored.skill;
        if (typeof stored.socialMedia === 'number') angler.socialMedia = stored.socialMedia;
        return angler;
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
        var starterBoost = state.ownedLakes.length <= 1 ? 1 : 0;
        var maxRequests = baseMax + assistBonus + Math.round(mktBonus * 3) + starterBoost;

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
            // Find a matching lake (normal logic), skip closed lakes
            var openLakes = state.ownedLakes.filter(function (lakeId) {
                return !(state.lakeClosures && state.lakeClosures[lakeId] && state.lakeClosures[lakeId] >= state.day);
            });

            var matchingLakes = openLakes.filter(function (lakeId) {
                var lake = Lakes.getLakeById(lakeId);
                if (!lake) return false;
                return angler.preferred.indexOf(lake.waterType) !== -1;
            });

            // If no preferred lake, try non-disliked
            if (matchingLakes.length === 0) {
                matchingLakes = openLakes.filter(function (lakeId) {
                    var lake = Lakes.getLakeById(lakeId);
                    if (!lake) return false;
                    return angler.disliked.indexOf(lake.waterType) === -1;
                });
            }

            // If still nothing, book any open lake
            if (matchingLakes.length === 0 && openLakes.length > 0) {
                matchingLakes = openLakes;
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

        // VIP booking priority: if player angler is not booked for today, auto-book every 2 days
        if (state.playerAnglerId && typeof Anglers !== 'undefined') {
            var playerAlreadyBooked = state.anglerBookings.some(function (booking) {
                return booking.anglerId === state.playerAnglerId && state.day >= booking.startDay && state.day <= booking.endDay;
            });
            if (!playerAlreadyBooked && state.ownedLakes && state.ownedLakes.length > 0) {
                var lastVipDay = typeof state.lastVipBookingDay === 'number' ? state.lastVipBookingDay : -999;
                if (state.day - lastVipDay >= 2) {
                    var playerAngler = Anglers.getAnglerById(state.playerAnglerId);
                    if (playerAngler) {
                        var preferredLakes = state.ownedLakes.slice().sort(function (a, b) {
                            var la = typeof Lakes !== 'undefined' ? Lakes.getLakeById(a) : null;
                            var lb = typeof Lakes !== 'undefined' ? Lakes.getLakeById(b) : null;
                            if (!la || !lb) return 0;
                            var scoreA = (playerAngler.preferred.indexOf(la.waterType) !== -1 ? 3 : 0) + (la.dailyIncomePerAngler || 0) * 0.1;
                            var scoreB = (playerAngler.preferred.indexOf(lb.waterType) !== -1 ? 3 : 0) + (lb.dailyIncomePerAngler || 0) * 0.1;
                            return scoreB - scoreA;
                        });
                        var vipLakeId = preferredLakes[0];
                        var vipLake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(vipLakeId) : null;
                        var vipDuration = 2;
                        var vipDailyRate = Math.max(100, Math.round((playerAngler.skill || 5) * 18 + (vipLake ? vipLake.dailyIncomePerAngler * 1.4 : 80)));
                        state.anglerBookings.push({
                            anglerId: state.playerAnglerId,
                            anglerName: playerAngler.name,
                            lakeId: vipLakeId,
                            startDay: state.day,
                            endDay: state.day + vipDuration - 1,
                            duration: vipDuration,
                            dailyRate: vipDailyRate,
                            satisfaction: 70,
                            isVip: true
                        });
                        state.lastVipBookingDay = state.day;
                        UI.showToast('⭐ VIP Booking: ' + playerAngler.name + ' booked at ' + (vipLake ? vipLake.name : vipLakeId) + '!', 'success');
                    }
                }
            }
        }

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

                    // Tackle satisfaction bonus
                    var tackleEffects = typeof Anglers !== 'undefined' && Anglers.getTackleEffects ? Anglers.getTackleEffects() : { satisfactionBonus: 0 };
                    if (tackleEffects.satisfactionBonus > 0) {
                        booking.satisfaction = Math.max(0, Math.min(100, booking.satisfaction + tackleEffects.satisfactionBonus));
                    }

                    // Daily catch simulation for all active bookings
                    if (booking.lakeId) simulateDailyCatch(booking);
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
                var repGain = (booking.repBonus || 15) + (state.reputation > 800 ? 10 : state.reputation > 500 ? 5 : 0) + (booking.satisfaction >= 70 ? 10 : 0);
                Game.addReputation(repGain);
                Game.addNotification(
                    '\uD83C\uDFC6 ' + booking.matchName + ' completed at ' +
                    ((typeof Lakes !== 'undefined' && Lakes.getLakeById(booking.lakeId))
                        ? Lakes.getLakeById(booking.lakeId).name : 'your lake') +
                    '! +' + repGain + ' reputation.'
                );
                UI.showToast(booking.matchName + ' completed! +' + repGain + ' rep', 'success');
            } else if (booking.satisfaction >= 70) {
                var bookingRep = 5;
                if (typeof Lakes !== 'undefined') {
                    var lake = Lakes.getLakeById(booking.lakeId);
                    if (lake && lake.dailyIncomePerAngler) {
                        bookingRep = Math.max(1, Math.round(5 * (lake.dailyIncomePerAngler / 40)));
                    }
                }
                Game.addReputation(bookingRep);
                Game.addNotification(booking.anglerName + ' left very satisfied! (+' + bookingRep + ' reputation)');
            } else if (booking.satisfaction >= 40) {
                Game.addReputation(10);
                Game.addNotification(booking.anglerName + ' had a decent visit. (+10 reputation)');
            } else {
                Game.addReputation(-10);
                Game.addNotification(booking.anglerName + ' left unhappy. (-10 reputation)');
                var state2 = Game.getState();
                state2.reputation = Math.max(0, state2.reputation - 10);
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
     * Derive a simple season number from the day counter.
     * Seasons: 1=Spring, 2=Summer, 3=Autumn, 4=Winter
     */
    function getCurrentSeasonNum(day) {
        var doy = ((day - 1) % 365) + 1;
        if (doy <= 90) return 1;
        if (doy <= 180) return 2;
        if (doy <= 270) return 3;
        return 4;
    }

    function getSeasonName(num) {
        return ['', 'Spring', 'Summer', 'Autumn', 'Winter'][num] || 'Spring';
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
     * Render the Your Angler tab with profile, stats, quests, and personal bests.
     */
    function renderYourAnglerTab(state) {
        initState();
        var angler = null;
        if (state.playerAnglerId && typeof Anglers !== 'undefined' && typeof Anglers.getAnglerById === 'function') {
            angler = Anglers.getAnglerById(state.playerAnglerId);
        }
        if (!angler) {
            return '<div class="empty-state">Select an angler from the Welcome screen first.</div>';
        }

        var stats = (state.anglerStats || {})[angler.name] || { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0 };
        if (!state.anglerQuests) state.anglerQuests = [];
        if (state.anglerQuests.length === 0 && typeof Anglers !== 'undefined') {
            Anglers.generateAnglerQuests();
        }

        // Compute overall personal bests
        var alive = (state.fish || []).filter(function(f){ return f.alive; });
        var biggest = null, rarest = null, mostExpensive = null;
        var maxWeight = 0, bestRarityIdx = 999, maxValue = 0;
        var RARITY_ORDER = ['mythic','legendary','epic','rare','uncommon','common'];
        alive.forEach(function(f){
            if (!biggest || (f.weight_oz || 0) > maxWeight) { biggest = f; maxWeight = f.weight_oz || 0; }
            var ridx = RARITY_ORDER.indexOf(f.rarity);
            if (ridx === -1) ridx = RARITY_ORDER.length;
            if (ridx < bestRarityIdx) { bestRarityIdx = ridx; rarest = f; }
            else if (ridx === bestRarityIdx && typeof Fish !== 'undefined' && Fish.getFishValue(f) > maxValue) { rarest = f; }
            if (typeof Fish !== 'undefined') {
                var v = Fish.getFishValue(f);
                if (v > maxValue) { maxValue = v; mostExpensive = f; }
            }
        });

        var html = '<div class="your-angler-root">';

        var bioText = (angler.bio || '').trim();
        var hasBio = bioText.length > 0;

        // ── Main two-column layout ───────────────────────────────────────────
        html += '<div class="your-angler-main-row">';

        // ── Left column: details, image, bars, sections ─────────────────────
        html += '<div class="your-angler-left">';

        // ── Profile section ─────────────────────────────────────────────────
        var likes = (angler.preferred || []).map(function(t){
            switch(t){ case 'still': return 'Still Water'; case 'running': return 'Running Water'; case 'gravel_pit': return 'Gravel Pit'; case 'estate_lake': return 'Estate Lake'; default: return t; }
        }).join(', ');
        var dislikes = (angler.disliked || []).map(function(t){
            switch(t){ case 'still': return 'Still Water'; case 'running': return 'Running Water'; case 'gravel_pit': return 'Gravel Pit'; case 'estate_lake': return 'Estate Lake'; default: return t; }
        }).join(', ');

        html += '<div class="your-angler-profile">';
        html += '<div class="your-angler-info">';
        html += '<div class="your-angler-name">' + angler.name + '</div>';
        html += '<div class="your-angler-category">' + (angler.category || 'Angler') + '</div>';
        html += '<div class="your-angler-skill">Skill ' + angler.skill + '/10</div>';
        html += '<div class="your-angler-weight">' + UI.formatWeight(stats.biggestFishOz || 0) + '</div>';
        html += '<div class="your-angler-prefs">';
        html += '<div><span class="pref-label">Likes:</span> ' + (likes || '—') + '</div>';
        html += '<div><span class="pref-label" style="color:#e67e22;">Dislikes:</span> ' + (dislikes || '—') + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="your-angler-photo">';
        if (angler.photo) {
            html += '<img src="' + angler.photo + '" alt="' + angler.name + '" class="angler-photo-img" />';
        } else {
            html += '<div class="angler-photo-placeholder">' + angler.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase() + '</div>';
        }
        html += '</div>';
        html += '</div>'; // close your-angler-profile
        // button moved to right column above About

        // ── Preferences + Current Booking row ─────────────────────────────
        var activeBooking = (state.anglerBookings || []).find(function(b){
            return b.anglerId === state.playerAnglerId && state.day >= b.startDay && state.day <= b.endDay;
        });
        var currentLake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(activeBooking ? activeBooking.lakeId : null) : null;
        var lakeIdForImage = currentLake ? currentLake.id.replace(/_lake$/, '') : '';
        var lakeImgSrc = activeBooking && currentLake ? ('img/lakes/' + lakeIdForImage + '.png') : '';

        html += '<div class="your-angler-section-row">';
        html += '<div class="your-angler-section">';
        html += '<h4 class="dash-section-subheading">Preferences</h4>';
        html += '<div class="your-angler-prefs">';
        html += '<div class="angler-card-prefs"><span class="pref-label">Likes:</span> ' + (likes || '—') + '</div>';
        html += '<div class="angler-card-prefs"><span class="pref-label">Dislikes:</span> ' + (dislikes || '—') + '</div>';
        html += '</div></div>';

        html += '<div class="your-angler-section">';
        html += '<h4 class="dash-section-subheading">📍 Currently Booked At</h4>';
        html += '<div class="current-booking-card">';
        if (lakeImgSrc) {
            html += '<img src="' + lakeImgSrc + '" alt="' + (currentLake ? currentLake.name : 'Unknown Lake') + '" class="current-lake-img" />';
        }
        html += '<div class="current-lake-info">';
        html += '<div class="current-lake-name">' + (currentLake ? currentLake.name : (activeBooking ? activeBooking.lakeId : '—')) + '</div>';
        if (activeBooking) {
            html += '<div class="current-lake-meta">Day ' + activeBooking.startDay + ' – ' + activeBooking.endDay + ' · £' + activeBooking.dailyRate + '/day</div>';
            html += '<div class="current-lake-meta">Satisfaction: ' + Math.round(activeBooking.satisfaction || 0) + '%</div>';
        } else {
            html += '<div class="current-lake-meta">No active booking</div>';
        }
        html += '</div></div></div>';
        html += '</div></div>';

        // ── Quests ─────────────────────────────────────────────────────────
        var quests = state.anglerQuests || [];
        if (quests.length > 0) {
            html += '<div class="your-angler-section">';
            html += '<h4 class="dash-section-subheading">🎯 Active Quests</h4>';
            html += '<div class="quest-list">';
            quests.forEach(function(q){
                var pct = Math.min(100, Math.round((q.progress / q.required) * 100));
                var statusClass = q.claimed ? 'quest-claimed' : (q.completed ? 'quest-complete' : 'quest-active');
                var statusText = q.claimed ? 'Claimed' : (q.completed ? 'Complete!' : 'In Progress');
                html += '<div class="angler-quest-card ' + statusClass + '">';
                html += '<div class="quest-header">';
                html += '<span class="quest-title">' + q.title + '</span>';
                html += '<span class="quest-status ' + statusClass + '">' + statusText + '</span>';
                html += '</div>';
                html += '<div class="quest-bar-wrap">';
                html += '<div class="quest-bar" style="width:' + pct + '%;"></div>';
                html += '</div>';
                html += '<div class="quest-meta">' + q.progress + ' / ' + q.required + ' · Reward: £' + (q.rewardMoney || 0) + '</div>';
                html += '</div>';
            });
            html += '</div></div>';
        }

        html += '</div>'; // .your-angler-left

        // ── Right column: about, career stats, personal bests, quests ──────
        html += '<div class="your-angler-right">';

        // ── Change Angler ──────────────────────────────────────────────────
        html += '<button class="btn" style="width:100%;margin-bottom:1rem;background:#e74c3c;border-color:#e74c3c;color:#fff;" onclick="Anglers.openAnglerSelector()">Change Angler</button>';

        // ── About / Bio ─────────────────────────────────────────────────────
        html += '<div class="your-angler-section">';
        html += '<h4 class="dash-section-subheading">About ' + angler.name.split(' ').pop() + '</h4>';
        if (hasBio) {
            html += '<p class="your-angler-bio">' + bioText + '</p>';
        } else {
            html += '<p class="your-angler-bio">No biography recorded for this angler yet.</p>';
        }
        html += '</div>';

        // ── Career Stats ───────────────────────────────────────────────────
        html += '<div class="your-angler-section your-angler-stats-right">';
        html += '<h4 class="dash-section-subheading">Career Stats</h4>';
        html += '<div class="your-angler-stats-grid your-angler-stats-grid--right">';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + stats.fishCaught + '</span><span class="your-angler-stat-lbl">Fish Caught</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + (stats.biggestFishOz > 0 ? UI.formatWeight(stats.biggestFishOz) : '—') + '</span><span class="your-angler-stat-lbl">Biggest Fish</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + stats.wins + '</span><span class="your-angler-stat-lbl">Wins</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + UI.formatMoney(stats.winnings) + '</span><span class="your-angler-stat-lbl">Winnings</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + stats.visits + '</span><span class="your-angler-stat-lbl">Visits</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + (typeof angler.socialMedia !== 'undefined' ? angler.socialMedia + '/10' : '—') + '</span><span class="your-angler-stat-lbl">Social Media</span></div>';
        html += '<div class="your-angler-stat"><span class="your-angler-stat-val">' + (typeof Anglers !== 'undefined' && Anglers.getCastDistanceM ? Anglers.getCastDistanceM() + 'm' : '—') + '</span><span class="your-angler-stat-lbl">Cast Distance</span></div>';
        html += '</div></div>';

        // ── Personal Bests ─────────────────────────────────────────────────
        html += '<div class="your-angler-section your-angler-bests-right">';
        html += '<h4 class="dash-section-subheading">Personal Bests</h4>';
        html += '<div class="your-angler-bests-grid">';
        if (biggest) {
            html += '<div class="your-angler-best-card">';
            html += '<div class="your-angler-best-label">🏆 Biggest Fish</div>';
            html += '<div class="your-angler-best-name">' + biggest.name + '</div>';
            html += '<div class="your-angler-best-meta">' + (typeof Fish !== 'undefined' && Fish.SPECIES[biggest.species] ? Fish.SPECIES[biggest.species].name : biggest.species) + '</div>';
            html += '<div class="your-angler-best-val" style="color:var(--colour-gold);">' + UI.formatWeight(biggest.weight_oz) + '</div>';
            html += '</div>';
        }
        if (rarest) {
            var rRDef = typeof Fish !== 'undefined' && Fish.RARITIES && Fish.RARITIES[rarest.rarity] ? Fish.RARITIES[rarest.rarity] : null;
            var rRCol = rRDef ? (rRDef.colour || '#888') : '#888';
            var rRName = rRDef ? rRDef.name : rarest.rarity;
            html += '<div class="your-angler-best-card">';
            html += '<div class="your-angler-best-label">💎 Rarest Fish</div>';
            html += '<div class="your-angler-best-name">' + rarest.name + '</div>';
            html += '<div class="your-angler-best-meta">' + (typeof Fish !== 'undefined' && Fish.SPECIES[rarest.species] ? Fish.SPECIES[rarest.species].name : rarest.species) + '</div>';
            html += '<div class="your-angler-best-val" style="color:' + rRCol + ';">' + rRName + '</div>';
            html += '</div>';
        }
        if (mostExpensive) {
            var eRDef = typeof Fish !== 'undefined' && Fish.RARITIES && Fish.RARITIES[mostExpensive.rarity] ? Fish.RARITIES[mostExpensive.rarity] : null;
            var eRCol = eRDef ? (eRDef.colour || '#888') : '#888';
            var eRName = eRDef ? eRDef.name : mostExpensive.rarity;
            html += '<div class="your-angler-best-card">';
            html += '<div class="your-angler-best-label">💰 Most Valuable</div>';
            html += '<div class="your-angler-best-name">' + mostExpensive.name + '</div>';
            html += '<div class="your-angler-best-meta">' + (typeof Fish !== 'undefined' && Fish.SPECIES[mostExpensive.species] ? Fish.SPECIES[mostExpensive.species].name : mostExpensive.species) + '</div>';
            html += '<div class="your-angler-best-val" style="color:' + eRCol + ';">' + UI.formatMoney(Fish.getFishValue(mostExpensive)) + '</div>';
            html += '</div>';
        }
        html += '</div></div>';

        html += '</div>'; // .your-angler-left
        html += '</div>'; // .your-angler-main-row

        html += '</div>'; // .your-angler-root

        return html;
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
        html += '<button class="dash-subtab' + (_anglerView === 'your_angler' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'your_angler\')">🎣 Your Angler</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'bookings' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'bookings\')">🏞️ Bookings</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'roster' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'roster\')">📋 Roster</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'sponsorships' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'sponsorships\')">🤝 Sponsorships</button>';
        html += '<button class="dash-subtab' + (_anglerView === 'leaderboard' ? ' dash-subtab-active' : '') +
                '" onclick="Anglers.showAnglerView(\'leaderboard\')">🏆 Leaderboard</button>';
        html += '</div>';

        if (_anglerView === 'your_angler') {
            html += renderYourAnglerTab(state);
            container.innerHTML = html;
            return;
        }

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

        // bookings view
        if (_anglerView === 'bookings') {
            html += renderBookingsTab(state);
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
            html += '<div class="active-bookings-list" style="max-height:400px;overflow-y:auto;">';
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

    function renderBookingsTab(state) {
        var html = '';

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
            html += '<div class="active-bookings-list" style="max-height:400px;overflow-y:auto;">';
            activeBookings.forEach(function (booking) {
                var lake     = Lakes.getLakeById(booking.lakeId);
                var angler   = getAnglerById(booking.anglerId);
                var sm       = angler ? (angler.socialMedia || 5) : 5;
                var daysLeft = booking.endDay - state.day + 1;
                var sat      = booking.satisfaction || 50;
                var borderCol = booking.isMatch ? 'var(--colour-gold)' : getLakeColour(booking.lakeId);

                var satMod    = (sat - 50) / 50;
                var mktImpact = Math.round(sm * (1 + satMod));
                var mktCol    = mktImpact >= 8 ? 'var(--colour-accent)' : mktImpact >= 5 ? '#d4a843' : 'var(--colour-danger)';
                var mktLabel  = mktImpact >= 8 ? '\u2B06 Boosting' : mktImpact >= 5 ? '\u2192 Neutral' : '\u2B07 Weak';
                var smCol     = sm >= 8 ? '#f1c40f' : sm >= 6 ? '#2ecc71' : '#aaa';

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

        return html;
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
                        var fullName = b.anglerName;
                        html += '<span class="cal-chip' + (isMatch ? ' cal-chip-match' : '') + '">' +
                                (isMatch ? '\uD83C\uDFC6 ' : '') + fullName + '</span>';
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

    function simulateDailyCatch(booking) {
        var state = Game.getState();
        var lake = typeof Lakes !== 'undefined' ? Lakes.getLakeById(booking.lakeId) : null;
        if (!lake) return 0;
        var lakeFish = state.fish.filter(function (f) { return f.alive && f.lake_id === booking.lakeId; });
        if (!lakeFish.length) return 0;

        var catchCount = Math.floor(Math.random() * 2) + 1;
        var isPlayer = state.playerAnglerId && booking.anglerId === state.playerAnglerId;
        if (!isPlayer) catchCount = Math.max(1, Math.floor(catchCount * 0.6));
        var tackleEffects = typeof Anglers !== 'undefined' && Anglers.getTackleEffects ? Anglers.getTackleEffects() : { catchRateBonus: 0, weightBonus: 0 };
        if (tackleEffects.catchRateBonus > 0) catchCount += Math.floor(catchCount * tackleEffects.catchRateBonus);
        var rigBonus = 0;
        if (typeof Rigs !== 'undefined' && Rigs.getEquippedRigEffects) {
            var rigEffects = Rigs.getEquippedRigEffects();
            rigBonus = rigEffects.catchRateBonus || 0;
            if (typeof Weather !== 'undefined' && Weather.getCurrentWeather) {
                var currentWeather = Weather.getCurrentWeather();
                if (currentWeather && currentWeather.current && Rigs.getRigWeatherBonus) rigBonus += Rigs.getRigWeatherBonus(currentWeather.current);
            }
        }
        if (rigBonus > 0) catchCount += Math.floor(catchCount * rigBonus);

        var baitEffects = typeof Anglers !== 'undefined' && Anglers.getBaitEffects ? Anglers.getBaitEffects() : {};
        if (baitEffects.lakeBonus && booking.lakeId) {
            var lakeSpeciesPrefs = [];
            try {
                lakeFish.forEach(function(f){
                    var sp = typeof Fish !== 'undefined' && Fish.getSpecies ? Fish.getSpecies(f.species) : null;
                    if (sp && sp.preferredBait) lakeSpeciesPrefs.push(sp.preferredBait);
                });
            } catch(e){}
            var ownedBait = (typeof state.anglerBait !== 'undefined' ? state.anglerBait : []);
            var matchedBait = ownedBait.some(function(b){ return lakeSpeciesPrefs.indexOf(b) !== -1; });
            if (matchedBait) catchCount = Math.max(1, Math.floor(catchCount * (1 + baitEffects.lakeBonus)));
        }

        var anglerName = booking.anglerName;
        if (!state.anglerStats) state.anglerStats = {};
        if (!state.anglerStats[anglerName]) {
            state.anglerStats[anglerName] = { fishCaught: 0, biggestFishOz: 0, wins: 0, winnings: 0, visits: 0, tripFishCaught: 0 };
        }
        var prevPB = state.anglerStats[anglerName].biggestFishOz || 0;
        state.anglerStats[anglerName].fishCaught += catchCount;
        state.anglerStats[anglerName].tripFishCaught = (state.anglerStats[anglerName].tripFishCaught || 0) + catchCount;

        var bookingKey = booking.anglerId + '::' + booking.lakeId + '::' + booking.startDay;
        if (!state.bookingTripStats) state.bookingTripStats = {};
        state.bookingTripStats[bookingKey] = (state.bookingTripStats[bookingKey] || 0) + catchCount;

        // Update personal best weight from today's catches
        if (lakeFish.length > 0) {
            var heaviestToday = lakeFish[0];
            for (var i = 1; i < lakeFish.length; i++) {
                if ((lakeFish[i].weight_oz || 0) > (heaviestToday.weight_oz || 0)) heaviestToday = lakeFish[i];
            }
            var targetWeight = heaviestToday.weight_oz || 0;
            if (targetWeight > prevPB) {
                state.anglerStats[anglerName].biggestFishOz = targetWeight;
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast('🎉 New PB: ' + UI.formatWeight(targetWeight) + ' by ' + anglerName + '!', 'success');
                }
            }
            if ((targetWeight || 0) >= 800 && typeof state.anglerStats[anglerName].wins === 'number') {
                state.anglerStats[anglerName].wins += 1;
            }
        }

        return catchCount;
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

        // Build ranked list of all anglers
        var ranked = Object.keys(stats).map(function(name){
            var s = stats[name];
            var score = (s.wins || 0) * 1000 + (s.fishCaught || 0) * 10 + (s.biggestFishOz || 0) * 0.1 + (s.winnings || 0) * 0.01;
            return { name: name, score: score, wins: s.wins || 0, fishCaught: s.fishCaught || 0, biggestFishOz: s.biggestFishOz || 0, winnings: s.winnings || 0, visits: s.visits || 0 };
        }).sort(function(a,b){ return b.score - a.score; });

        var html = '';
        html += '<h3 class="section-heading">🏆 Overall Angler Rankings</h3>';
        html += '<p style="color:var(--colour-muted);margin-bottom:1rem;">Rankings update daily based on wins, catches, and earnings.</p>';

        if (ranked.length === 0) {
            html += '<p class="empty-state">No angler stats recorded yet. Rankings will appear as anglers catch fish and win matches.</p>';
        } else {
            html += '<div class="leaderboard-list">';
            ranked.forEach(function(entry, idx){
                var rank = idx + 1;
                var total = ranked.length;
                var prevRank = entry.prevRank;
                var movement = '';
                if (prevRank !== undefined && prevRank !== null) {
                    var diff = prevRank - rank;
                    if (diff > 0) movement = '<span class="lb-move lb-up" title="Moved up">▲</span>';
                    else if (diff < 0) movement = '<span class="lb-move lb-down" title="Moved down">▼</span>';
                    else movement = '<span class="lb-move lb-same" title="No change">-</span>';
                }
                var rankClass = rank === 1 ? 'lb-rank-1' : rank === 2 ? 'lb-rank-2' : rank === 3 ? 'lb-rank-3' : '';
                html += '<div class="lb-row lb-rank-row">';
                html += '<span class="lb-rank ' + rankClass + '">' + rank + '/' + total + '</span>';
                html += '<span class="lb-name">' + entry.name + '</span>';
                html += '<span class="lb-val">' + entry.wins + ' wins</span>';
                html += '<span class="lb-val">' + entry.fishCaught + ' fish</span>';
                html += '<span class="lb-val">' + (typeof UI !== 'undefined' ? UI.formatWeight(entry.biggestFishOz) : entry.biggestFishOz + 'oz') + '</span>';
                html += '<span class="lb-val">' + UI.formatMoney(entry.winnings) + '</span>';
                html += '<span class="lb-movement">' + movement + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

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
                (angler.category !== 'Amature' ? "<button class='angler-more-btn' onclick=\"Anglers.showAnglerDetails(" + angler.id + ")\">More Info</button>" : "") +
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
            description: 'Catch ' + baseCatchTarget + ' fish in total.',
            target: 'fishCaught', required: baseCatchTarget, progress: 0,
            rewardMoney: 500, rewardRep: 25, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Win ' + baseWinTarget + ' Matches',
            description: 'Win ' + baseWinTarget + ' matches.',
            target: 'wins', required: baseWinTarget, progress: 0,
            rewardMoney: 1000, rewardRep: 50, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Prize Winner (£' + prizeTarget.toLocaleString() + ')',
            description: 'Win £' + prizeTarget.toLocaleString() + ' in tournaments.',
            target: 'winnings', required: prizeTarget, progress: 0,
            rewardMoney: prizeTarget * 0.1, rewardRep: 35, completed: false, claimed: false
        });
        if (angler.skill >= 7) {
            state.anglerQuests.push({
                id: qid++, title: '10lb Trophy',
                description: 'Land a 10lb+ fish.',
                target: 'biggestFishOz', required: 160, progress: 0,
                rewardMoney: 2000, rewardRep: 75, completed: false, claimed: false
            });
        }
        state.anglerQuests.push({
            id: qid++, title: 'Lake Baron',
            description: 'Own 3 lakes.',
            target: 'ownedLakes', required: 3, progress: 0,
            rewardMoney: 15000, rewardRep: 5, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Fish Collector',
            description: 'Keep 20 fish alive across lakes.',
            target: 'stock', required: 20, progress: 0,
            rewardMoney: 3000, rewardRep: 5, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Rising Star',
            description: 'Reach 200 rep.',
            target: 'reputation', required: 200, progress: 0,
            rewardMoney: 10000, rewardRep: 0, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Breeding Expert',
            description: 'Breed 5 offspring.',
            target: 'bred', required: 5, progress: 0,
            rewardMoney: 6000, rewardRep: 6, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Seasoned Host',
            description: 'Complete 10 bookings.',
            target: 'bookings', required: 10, progress: 0,
            rewardMoney: 7000, rewardRep: 8, completed: false, claimed: false
        });
        state.anglerQuests.push({
            id: qid++, title: 'Marketing Maestro',
            description: 'Run 3 campaigns.',
            target: 'campaigns', required: 3, progress: 0,
            rewardMoney: 4000, rewardRep: 5, completed: false, claimed: false
        });

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
            var current = stats[q.target];
            if (typeof current === 'undefined' && typeof state[q.target] !== 'undefined') current = state[q.target];
            q.progress = current || 0;
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
        quest.claimedDay = state.day;
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

    function updateDailyLeaderboard() {
        initState();
        var state = Game.getState();
        if (!state.anglerStats) state.anglerStats = {};

        var ranked = Object.keys(state.anglerStats).map(function(name){
            var s = state.anglerStats[name];
            var score = (s.wins || 0) * 1000 + (s.fishCaught || 0) * 10 + (s.biggestFishOz || 0) * 0.1 + (s.winnings || 0) * 0.01;
            return { name: name, score: score };
        }).sort(function(a,b){ return b.score - a.score; });

        // Store previous ranks for movement arrows
        if (!state.leaderboardHistory) state.leaderboardHistory = {};
        var history = state.leaderboardHistory;
        ranked.forEach(function(entry, idx){
            if (history[entry.name] !== undefined) {
                entry.prevRank = history[entry.name];
            }
            history[entry.name] = idx + 1;
        });
    }

    return {
        initState: initState,
        getAnglerById: getAnglerById,
        getAllAnglers: getAllAnglers,
        generateBookingRequests: generateBookingRequests,
        processDailyBookings: processDailyBookings,
        renderAnglers: renderAnglers,
        render: renderAnglers,
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
        claimAnglerQuest: claimAnglerQuest,
        buyTackle: buyTackle,
        getTackleEffects: getTackleEffects,
        processTackleEffects: processTackleEffects,
        processSeasonalSocialDecay: processSeasonalSocialDecay,
        updateDailyLeaderboard: updateDailyLeaderboard,
        openAnglerSelector: openAnglerSelector,
        selectAngler: selectAngler
    };

    function openAnglerSelector() {
        var state = Game.getState();
        var professionals = (ANGLER_POOL || []).filter(function(a){ return a.category === 'Professional'; });

        var carouselHtml = '<div class="angler-selector-carousel">';
        professionals.forEach(function(a) {
            var isSelected = state.playerAnglerId === a.id;
            carouselHtml += '<div class="angler-selector-card">';
            if (a.photo) {
                carouselHtml += '<img src="' + a.photo + '" alt="' + a.name + '" />';
            } else {
                carouselHtml += '<div class="angler-photo-placeholder">' + a.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase() + '</div>';
            }
            carouselHtml += '<div class="angler-selector-name">' + a.name + '</div>';
            carouselHtml += '<div class="angler-selector-meta">' + (a.category || 'Professional') + ' · Skill ' + (a.skill || 0) + '/10 · £' + (a.budget || 0) + '/day</div>';
            if (isSelected) {
                carouselHtml += '<button class="btn btn-secondary btn-sm angler-selector-btn" disabled>Current Angler</button>';
            } else {
                carouselHtml += '<button class="btn btn-primary btn-sm angler-selector-btn" onclick="Anglers.selectAngler(' + a.id + ')">Select Angler</button>';
            }
            carouselHtml += '</div>';
        });
        carouselHtml += '</div>';

        UI.showModal('<h3 style="margin-top:0;color:var(--colour-gold);">Select Angler</h3>' + carouselHtml + '<button class="btn btn-secondary" style="margin-top:1rem;width:100%;" onclick="UI.hideModal()">Close</button>');
    }

    function selectAngler(anglerId) {
        var state = Game.getState();
        state.playerAnglerId = anglerId;
        Game.saveToStorage();
        UI.hideModal();
        UI.renderAll();
        UI.showToast('Angler changed successfully!', 'success');
    }
})();
window.Anglers = Anglers;
