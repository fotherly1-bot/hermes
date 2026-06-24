(function(){
  const pool=[
    { id:1, name:'Dave Hutchinson', preferred:['still','estate_lake'], disliked:['running'], budget:35, skill:7, socialMedia:5 },
    { id:2, name:'Steve Briggs', preferred:['gravel_pit','estate_lake'], disliked:['still'], budget:50, skill:9, socialMedia:8 },
    { id:3, name:'Terry Hearn', preferred:['gravel_pit','estate_lake'], disliked:['still'], budget:60, skill:10, socialMedia:10 },
    { id:4, name:'Ian Russell', preferred:['still','running'], disliked:['gravel_pit'], budget:30, skill:6, socialMedia:4 },
    { id:5, name:'Danny Fairbrass', preferred:['gravel_pit','still'], disliked:['running'], budget:45, skill:8, socialMedia:9 },
    { id:6, name:'Ali Hamidi', preferred:['estate_lake','gravel_pit'], disliked:['still'], budget:55, skill:9, socialMedia:8, photo:'img/anglers/ali-hamidi.png' },
    { id:7, name:'Alan Blair', preferred:['running','still'], disliked:['estate_lake'], budget:40, skill:7, socialMedia:6 },
    { id:8, name:'Mark Pitchers', preferred:['still','running'], disliked:['gravel_pit'], budget:25, skill:5, socialMedia:3 },
    { id:9, name:'Kev Hewitt', preferred:['running','gravel_pit'], disliked:['estate_lake'], budget:35, skill:6, socialMedia:5 },
    { id:10, name:'Rob Hughes', preferred:['estate_lake','still'], disliked:['running'], budget:50, skill:8, socialMedia:7 },
    { id:11, name:'Simon Crow', preferred:['gravel_pit','running'], disliked:['still'], budget:40, skill:7, socialMedia:6 },
    { id:12, name:'Nigel Sharp', preferred:['estate_lake','gravel_pit'], disliked:['running'], budget:55, skill:9, socialMedia:7 },
    { id:13, name:'Darrell Peck', preferred:['gravel_pit','running'], disliked:['still'], budget:45, skill:8, socialMedia:8 },
    { id:14, name:'Tom Maker', preferred:['still','estate_lake'], disliked:['gravel_pit'], budget:30, skill:5, socialMedia:3 },
    { id:15, name:'Harry Charrington', preferred:['estate_lake','still'], disliked:['running'], budget:60, skill:9, socialMedia:6 },
    { id:16, name:'Oz Holness', preferred:['gravel_pit','running'], disliked:['estate_lake'], budget:40, skill:7, socialMedia:9 },
    { id:17, name:'Martin Bowler', preferred:['running','still'], disliked:['gravel_pit'], budget:35, skill:6, socialMedia:7 },
    { id:18, name:'Jim Shelley', preferred:['gravel_pit','estate_lake'], disliked:['still'], budget:50, skill:8, socialMedia:8 },
    { id:19, name:'Lee Jackson', preferred:['still','gravel_pit'], disliked:['running'], budget:30, skill:5, socialMedia:4 },
    { id:20, name:'Adam Penning', preferred:['running','gravel_pit'], disliked:['estate_lake'], budget:35, skill:6, socialMedia:5 },
    { id:21, name:'Gary Bayes', preferred:['estate_lake','still'], disliked:['running'], budget:45, skill:7, socialMedia:4 },
    { id:22, name:'Ian Chillcott', preferred:['gravel_pit','estate_lake'], disliked:['running'], budget:50, skill:8, socialMedia:7 },
    { id:23, name:'Keith Jenkins', preferred:['still','running'], disliked:['gravel_pit'], budget:25, skill:4, socialMedia:3 },
    { id:24, name:'Paul Forward', preferred:['running','still'], disliked:['estate_lake'], budget:30, skill:5, socialMedia:4 },
    { id:25, name:'Jeffrey Curry', preferred:['gravel_pit','estate_lake'], disliked:['running'], budget:55, skill:9, socialMedia:6 },
    { id:26, name:'Lee Warner', preferred:['still','gravel_pit'], disliked:['estate_lake'], budget:40, skill:7, socialMedia:7 },
    { id:27, name:'Ste Black', preferred:['running','gravel_pit'], disliked:['still'], budget:45, skill:8, socialMedia:8 }
  ];
  module.exports = { ANGLER_POOL: pool };
})();
