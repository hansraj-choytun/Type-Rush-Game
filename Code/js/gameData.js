"use strict";

/*
----- Game settings and level content -----
Keep all data in this file so game.js stays small.
*/

export const CONFIG = Object.freeze({
  MAX_MISTAKES: 5,
  MISTAKE_PENALTY: 50,
  STREAK_BONUS: 5,
  LEVEL_TIME: 45,
  L1_PASS_SCORE: 300,
  L2_PASS_SCORE: 500
});

export const LEVEL1_WORDS = Object.freeze([
  { word: "anchor", image: "../assets/images/level1/anchor.png" },
  { word: "sword", image: "../assets/images/level1/sword.png" },
  { word: "compass", image: "../assets/images/level1/compass.png" },
  { word: "treasure", image: "../assets/images/level1/treasure.png" },
  { word: "pirate", image: "../assets/images/level1/pirate.png" },
  { word: "ship", image: "../assets/images/level1/ship.png" },
  { word: "island", image: "../assets/images/level1/island.jpg" },
  { word: "ocean", image: "../assets/images/level1/ocean.jpg" },
  { word: "bounty", image: "../assets/images/level1/bounty.jpg" },
  { word: "voyage", image: "../assets/images/level1/voyage.jpg" }
]);

export const LEVEL2_TEXTS = Object.freeze([
  "The sea calls to those brave enough to answer. A pirate does not fear the storm — they sail straight through it, eyes fixed on the horizon where treasure and glory await. Every wave is a test, every gust a challenge. Type fast, stay sharp, claim your bounty.",
  "Words are the weapons of the swift. On the Grand Line, speed and accuracy determine who rises to the top of the bounty board. A single mistaken letter can cost you dearly — so focus, breathe, and let your fingers fly across the keys like a blade through water.",
  "Every legend on the Grand Line began with a single keystroke. The greatest pirates did not wait for the perfect moment — they created it with speed, grit, and relentless accuracy. Your fingers are your weapons, the keyboard is your ship. Sail hard, strike true, and let no letter slip past unchallenged."
]);

export const LEVEL3_AUDIOS = Object.freeze([
  {
    src: "../assets/audio/dictation_1.m4a",
    transcript: "as he moved away a remarkable sight unfolded before everyones eyes the boys arm stretched unnaturally leaving everyone in awe his arm its stretching shanks exclaimed thats the crew stunned by the spectacle struggled to find words no way you they stammered luffy bewildered by his own abilities cried out whats happening in a mix of confusion and fear the fat man searching through a box suddenly realized something was amiss with a look of panic he exclaimed its gone the rubber rubber fruit we took from the enemy isnt here sweat trickled down the luckys forehead as he showed luffy a drawing of the purple swirling fruit he had consumed earlier his voice quivered as he asked luffy did you eat this oblivious luffy confirmed well yeah isnt that dessert it tastes pretty bad though stepping forward shanks positioned himself in front of the young boy and delivered a sobering revelation thats the rubber rubber fruit its one of the fruits of the devil and one of the rarest treasures in the sea luffy stood frozen in disbelief shanks continued whoever eats it will turn into a rubber man and will never be able to swim"
  },
  {
    src: "../assets/audio/dictation_2.m4a",
    transcript: "the man in the straw hat chuckled heartily as he laughed go for it lets see what youre gonna do he encouraged but among the onlookers there was a voice filled with skepticism luffy is going to do something funny again one man amused undeterred by the murmurs of skepticism luffy took a decisive step forward with a daring that defied reason he raised the knife and brought it down swiftly without hesitation the knife found its mark as he stabbed himself just underneath his eye a collective gasp escaped the lips of the surrounding pirates as luffys painfilled cry pierced the air the pirates alike stood frozen in disbelief unable to comprehend the audacity of luffys act the man in straw hat shouted with worry idiot what the hell are you doing yet amidst the cacophony of luffys screams there was a glimmer of something extraordinary the pirates did not expect within the heart of windmill village amidst the lively atmosphere of partys bar pirates and the spirited boy luffy had gathered a raucous proposal to raise their glasses in celebration of luffys audacity and their own demeanor echoed through the air"
  },
  {
    src: "../assets/audio/dictation_3.m4a",
    transcript: "in a realm where the allure of wealth fame and power consumes the hearts of men a legend was born once upon a time a man emerged from the depths of the vast ocean his name echoing through the annals of history like a thunderous tempest they called him the pirate king gol d roger a man who defied the boundaries of this world seizing everything within his grasp it was said that his exploits were legendary his deeds etched in the fabric of time itself but as the winds of destiny whispered their secrets gol d rogers story took an unexpected turn handcuffed and standing tall upon an elevated execution platform in the heart of a bustling town his eyes betrayed a mix of defiance and resignation two men their swords crossing in a deadly x before him embodied the imminent fate that awaited the pirate king the crowd gathered below their collective breath held captive by the weight of this historic moment the atmosphere crackled with a potent blend of anticipation fear and awe rogers face bore a wicked smile as if he reveled in the chaos and uncertainty he had"
  }
]);
