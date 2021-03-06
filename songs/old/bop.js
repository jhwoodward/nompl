var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var jingle1 = ['',
	`24,1: aBC h dEF i Gfed j `,
	`1:     F/F/F//F e/'e^//e e/d/d/E/d// >'G^///`,
	'12,1:     F/F/F//F F/ e/ e/ 8,eee 12, G/G/f/d/c/// ////',
  '24,1:E/// E^// E^E^ E/// F^// e^// +F^+F^ G///',
  '24,1:E/// E^// E^E^ E/// F^// e^// d^d^ c///',
  '12,1:F/F/F/FFF/e/e/eee/d/d/E/d////////'
	];


var jingle2 = ['',
 	'24,-1: i cGgG h cGgG cGgG h ccDE',
 	'      FAfA cEcEd +Fd+F Gfed',
 	'     FAfA cEcE ggAB CgC/',
   '24,-1: c/// c^// c^c^ ccDE'
 	];

var rules = {
  h: '0:12,aBCDEhdcbiajh',
  i: '0:8,GjAfh',
  j: '1:6,abfgksijh',
  k: '48,cDEh'
};


var part1 = loop(jingle1[1] ,4);
var part2 = loop(jingle2[1] + jingle2[2] + jingle2[1] + jingle2[3] + utils.barRest(2),4);

var song = { name:'jingle', parts: [part1,part2]};


make(jingle1[1], rules, 3).play();
