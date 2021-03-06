var eventType = require('../../interpreter/constants').eventType;
var _ = require('lodash');
module.exports = function (ngModule) {

  ngModule.directive('pianoRoll', ['$compile', '$timeout', '$window', function ($compile, $timeout, $window) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-roll.html'),
      scope: {
        sequencer: '=',
        active: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {

      var currentEvent;

      vm.containerWidth = el[0].offsetWidth - 250;

      var highestPitch, lowestPitch;

      /*
            var cssTransform = (function () {
              var prefixes = 'transform webkitTransform mozTransform oTransform msTransform'.split(' ')
                , el = document.createElement('div')
                , cssTransform
                , i = 0
              while (cssTransform === undefined) {
                cssTransform = document.createElement('div').style[prefixes[i]] != undefined ? prefixes[i] : undefined
                i++
              }
              return cssTransform
            })();
      
            var p = document.getElementById('pianoroll');
      
            function setLeft() {
              p.style['transition'] = 'transform ' + (480) + 'ms';
              p.style[cssTransform] = "translate3d(" + (width - currentEvent.tick) + "px, 0 ,0)"
      
            }
      
          
            function scroll() {
              if (currentEvent && currentEvent.tick > width && currentEvent.tick % 48 === 0) {
                setLeft();
              }
            //  window.requestAnimationFrame(scroll);
            }
      
          //  window.requestAnimationFrame(scroll);
      */

      angular.element($window).bind('resize', _.debounce(onresize, 300));

      function scaleNotes(data) {
        var height = el[0].offsetHeight - 100;
        var scaleFactor = Math.round(height / (highestPitch - lowestPitch));
        var offset = ((127 - highestPitch) * scaleFactor) - 40;
        data = data.map(note => {
          note.top = (note.pitch * scaleFactor) - offset;
          note.height = scaleFactor > 20 ? 20 : scaleFactor;
          note.width = note.duration;
          note.opacity = (note.velocity / 127) + 0.3;
          return note;
        });
      }

      function onresize() {
        vm.containerWidth = el[0].offsetWidth - 250;
        render();
        scaleNotes(vm.data);

      }
      scope.$on('$destroy', function () {

      });

      vm.onDragBeatMarker = function (tick) {
        if (!tick) return;
        vm.sequencer.tick = tick + el[0].scrollLeft;
        scope.$digest();
      }

      vm.goTo = function (beat) {
        vm.sequencer.goToBeat(beat);
      }

      var pianoRollElement = el[0].children[0];

      function render() {
        console.time('piano roll render');

        var tolerance = 350;
        $timeout(function () {
          scope.$apply(function () {
            vm.visible = vm.data.filter(function (note) {
              return note.on < vm.containerWidth + vm.scrollLeft + tolerance && note.on > vm.scrollLeft - tolerance;
            });
            vm.visibleBeats = vm.beats.filter(function (beat) {
              return beat.tick < vm.containerWidth + vm.scrollLeft + tolerance && beat.tick > vm.scrollLeft - tolerance;
            });
          });
        });
      }

      scope.$watch('vm.sequencer.beat', function (beat) {
        if (beat % 2 === 0) {
          render();
        }
      });

      // var realFunction =  _.debounce(render, 500, {leading: true});

      var debouncedRender = _.debounce(render, 5, { leading: true });

      el.bind('scroll',
        function () {
          if (!vm.sequencer.playing) {
            debouncedRender();
            //render();
          }
        });
      
      vm.scrollLeft = 0;
      function scroll() {

        if (vm.active) {
          if (currentEvent && currentEvent.tick > vm.containerWidth) {
            el[0].scrollLeft = Math.round(currentEvent.tick - vm.containerWidth);
          } /*else if (currentEvent && currentEvent.tick > el[0].scrollLeft - 10) {
            // el[0].scrollLeft = 0;
          }*/

      
           vm.scrollLeft = el[0].scrollLeft;

        }

        window.requestAnimationFrame(scroll);
      }

     window.requestAnimationFrame(scroll);

      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(handler);
        }
      });


      function off() {
        vm.data.forEach(e => e.active = false);
        if (vm.beats) vm.beats.forEach(beat => beat.active = false);
      }

      scope.$watch('vm.active', function (active) {
        if (!active) off();
      });

      function handler(event) {


        //   el[0].width = vm.sequencer.maxTick;

        pianoRollElement.style.width = vm.sequencer.maxTick + 'px';

        currentEvent = event;

        if (!vm.active) return;


        if (event.type === 'ready' || event.type === 'solo' || event.type === 'mute') {
          handleReady(event);
        }

        if (event.type === 'position') {
          if (event.tick > vm.containerWidth) {
            el[0].scrollLeft = Math.round(event.tick - vm.containerWidth);
          } else if (event.tick < el[0].scrollLeft) {
            el[0].scrollLeft = 0;
          }
          render();
        }

        if (event.type === 'start') {
          //el[0].scrollLeft = 0;
        }

        if (event.type === 'stop') {
          off();
        }

        if (event.type === 'tick') {
          //scroll();
          $timeout(function () {
            scope.$apply(function () {
              vm.visible.filter(e => e.on === event.tick).map(n => n.active = true);
              vm.visible.filter(e => e.off === event.tick).map(n => n.active = false);
              vm.visibleBeats.forEach(beat => {
                beat.active = beat.count === event.beat;
              });
            });
          });
        }

        //for reverse play fake noteoff
        if (event.type === 'noteoff') {
          $timeout(function () {
            scope.$apply(function () {
              vm.visible.filter(e => e.on === event.onTick && e.meta.on.pitch.value === event.pitch.value).map(n => n.active = false);
            });
          });
        }

        if (event.type === 'markers') {
          updateMarkers(event);
        }


      }

      function updateMarkers(event) {

        $timeout(function () {
          scope.$apply(function () {
            vm.markers = event.markers;
            if (!vm.beats) {
              var beats = [];
              var beatCount = -1;
              for (var tick = 0; tick <= event.end; tick++) {
                if (tick % 48 === 0) {
                  beatCount++;
                  beats.push({ count: beatCount, tick: tick });
                }
              }
              vm.beats = beats;
            }

          });
        });

      }


      function handleReady(event) {



        var data = [];

        highestPitch = 0;
        lowestPitch = 127;

        event.tracks.forEach((track, i) => {

          var interpreted = event.interpreted[i];
          if (!interpreted) return;

          if (vm.sequencer.solo && vm.sequencer.solo !== track.key) return;
          if (!vm.sequencer.solo && track.isMuted) return;
          if (track.isHidden) return;

          var events = interpreted.events.filter(e => e.type === eventType.noteon && !e.keyswitch).map(e => {

            if (e.pitch.value > highestPitch) {
              highestPitch = e.pitch.value;
            }
            if (e.pitch.value < lowestPitch) {
              lowestPitch = e.pitch.value;
            }

            return {
              trackIndex: e.trackIndex,
              pitch: 127 - e.pitch.value,
              on: e.tick - e.offset,
              off: e.tick + e.duration - e.offOffset,
              duration: e.duration,// off.duration || (off.tick - on.tick),
              meta: { on: e },
              ornament: e.ornament,
              velocity: e.velocity
            }
          });
          data = data.concat(events);
          //  var noteoffs = interpreted.events.filter(e => e.type === eventType.noteoff);

          //TODO: no need to calc duration anymore here
          /*
          noteons.forEach(on => {

            for (var i = 0; i < noteoffs.length; i++) {
              var off = noteoffs[i];
              if (off.pitch.value === on.pitch.value) {
                if (on.pitch.value > highestPitch) {
                  highestPitch = on.pitch.value;
                }
                if (on.pitch.value < lowestPitch) {
                  lowestPitch = on.pitch.value;
                }
                data.push({
                  track: on.trackIndex + 1,
                  pitch: 127 - on.pitch.value,
                  on: on.tick,
                  off: on.tick + on.duration,
                  duration: on.duration,// off.duration || (off.tick - on.tick),
                  meta: { on, off },
                  ornament: on.ornament
                });
                noteoffs.splice(i, 1);
                on.matched = true;
                break;
              }
            }
          });

          */
        });


        scaleNotes(data);

        /*
         var dist = (highestPitch - lowestPitch);
        var scale = Math.round(height / dist) * height;
       
        data = data.map(note => {
                  note.top = ((note.pitch/dist) * scale);
                  note.height = 10;// scaleFactor > 20 ? 20 : scaleFactor;
                  note.width = note.duration;
                  return note;
                });
        
*/

        var beats = [];
        for (var tick = 0; tick <= vm.sequencer.maxTick; tick += 48) {
          beats.push({ count: tick / 48, tick: tick });
        }

        $timeout(function () {
          scope.$apply(function () {
            vm.data = data;
            vm.beats = beats;
          });
        });

        render();


        console.timeEnd('piano roll render');


      }
    }
  }]);



  function controller($scope, $timeout) {
    var vm = this;
    vm.data = [];
    vm.beats = [];
    vm.hoverNote = function (note) {
      vm.sequencer.trigger(note.meta.on);
      note.active = true;
      $timeout(function () {
        note.active = false;
        vm.sequencer.trigger({type: 'noteoff', pitch: note.meta.on.pitch, track: note.meta.on.track});
      }, note.duration * vm.sequencer.interval / 1000);
    }
  }

}
