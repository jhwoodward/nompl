var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");
var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

var master = `120=T 192, ( $A / /  $B / / $C / / )*4 $D `;

players.violin1.part = `
  $A1( {pizzicato}  (1:24, ^c^12,cc^c12,cc^)*2 )
  $A2( {default}     1:24, >c_E_'G'fe_dc_b~C'E'G'fe_dc_b ^ )
  $B(                1:48, c_ba_g {p} Cba~g ^ ) 
  $D(                1:48, Fe///////^ )

  `;
players.violin2.part = `
  $A1( {pizzicato}  (0:24, ^b^b^b^)*2 )
  $B1( {default}     1:48, e_d c_D {p} E_d c_D ^ )
  $B2( {default}     1:48, e d c D_{p} E_d c D ^ )
  $B3( {default}     1:48, e_d c_D {p} E_d c_D ^ )
  $B4( {default}     1:48, e d c_D {p} E_d c~D ^ )
  $D(                0:48, b~C///////^ )
`;

players.viola.part = `
  $A1( {pizzicato}  (0:24, ^g^12,gg24,^g^g )*2  )
  $A2( {pizzicato}  (0:24, ^g^12,gg24,^g^g )*2  )
  $A3( {default}    (0:24, c_E_'G'fe_dc_b )*2 ^ )
  $D(                0:48, g~-B/a~g~e/// ^ )
`
players.cello.part = `
  $A1( {pizzicato}  (-1:24, c^c^c^c^)*2 )
  $A4( {default}     -1:24, >c_E'G'f >e_d c_b C E'G'f'e d c_b ^ )
  $C( {pizzicato}    -1:24, (cGcGcGcG)*2 ^ )
  $D( {default}      -1:48, gc/////~g/c ^ )
`;

players.violin1.master = master;
players.violin2.master = master;
players.viola.master = master;
players.cello.master = master;
module.exports = players;
