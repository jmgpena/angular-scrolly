/**
 * @ngdoc object
 * @name ajoslin.scrolly.$scrollerProvider
 * 
 * @description
 * Used for configuring scroll options.
 */

angular.module('ajoslin.scrolly.scroller', [
  'ajoslin.scrolly.dragger',
  'ajoslin.scrolly.transformer',
  'ajoslin.scrolly.desktop'
])
.provider('$scroller', [function() {

  var _decelerationRate = 0.001;
  this.decelerationRate = function(newDecelerationRate) {
    arguments.length && (_decelerationRate = newDecelerationRate);
    return _decelerationRate;
  };

  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#supportDesktop
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * Sets/gets whether the scroller should support desktop events (mousewheel, 
   * arrow keys, etc).  Default true.
   *
   * @param {boolean=} newSupport New value to set for desktop support.
   * @returns {boolean} support Current desktop support.
   */
  var _supportDesktop = true;
  this.supportDesktop = function(newSupport) {
    _supportDesktop = !!newSupport;
    return _supportDesktop;
  };

  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#pastBoundaryScrollRate
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * Sets/gets the rate scrolling should go when the user goes past the boundary.
   * In other words, if the user is at the top of the list and tries to scroll up
   * some more, he will only be able to scroll at half the rate by default.  This option changes
   * that rate.
   *
   * @param {number=} newRate The new pastBoundaryScrollRate to set.
   * @returns {number} pastBoundaryScrollRate The current scroll rate.
   */
  var _pastBoundaryScrollRate = 0.5;
  this.pastBoundaryScrollRate = function(newRate) {
    arguments.length && (_pastBoundaryScrollRate = newRate);
    return _pastBoundaryScrollRate;
  };

  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#minDistanceForAcceleration
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * Sets/gets the minimum distance the user needs to scroll for acceleration to happen when
   * he/she lifts his/her finger.
   *
   * @param {number=} newRate The new minDistanceForAcceleration to set.
   * @returns {number} minDistanceForAcceleration The current minimum scroll distance.
   */
  var _minDistanceForAcceleration = 10;
  this.minDistanceForAcceleration = function(newMinScrollDistance) {
    arguments.length && (_minDistanceForAcceleration = newMinScrollDistance);
    return _minDistanceForAcceleration;
  };

  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#bounceBuffer
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * Sets/gets the buffer allowed for the scroll to 'bounce' past the actual
   * content area.  Set this to 0 to effectively disable bouncing.
   *
   * @param {number=} newBounceBuffer The new bounce buffer to set.
   * @returns {number} bounceBuffer The current bounce buffer.
   */
  var _bounceBuffer = 40;
  this.bounceBuffer = function(newBounceBuffer) {
    arguments.length && (_bounceBuffer = newBounceBuffer);
    return _bounceBuffer;
  };


  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#bounceBackMinTime
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * See {@link ajoslin.scrolly.$scrollerProvider#bounceBackDistanceMulti bounceBackDistanceMulti}.
   *
   * @param {number=} newTime The new bounce back minimum time to set.
   * @returns {number} bounceBackMinTime The current bounce back minimum time.
   */

  /**
   * @ngdoc method
   * @name ajoslin.scrolly.$scrollerProvider#bounceBackDistanceMulti
   * @methodOf ajoslin.scrolly.$scrollerProvider
   *
   * @description
   * When the user scrolls past the content area into the bounce buffer, 
   * we need to bounce back.  To decide how long the bounce back animation will
   * take, there are two factors: a minimum time, in milliseconds, and a 
   * distance multiplier.  
   *
   * The equation for deciding how much time the animation to bounce back to
   * the main content area should take, we do the following:
   *
   * <pre>
   * function getBounceTime(distancePastContent) {
   *   return bounceBackMinTime + distancePastContent * bounceBackDistanceMulti;
   * }
   * </pre>
   *
   * This makes it so the farther away the user has scrolled from the content
   * area, the longer the animation to bring the content back into view will
   * take. The minimum time exists so even short distances still take a little 
   * bit of time.
   *
   * @param {number=} newDistanceMulti The new bounce back distance multiplier.
   * @returns {number} bounceBackDistanceMulti The current bounce back distance multiplier.
   */

  var _bounceBackMinTime = 200;
  var _bounceBackDistanceMulti = 1.5;

  this.bounceBackMinTime = function(newBounceBackMinTime) {
    arguments.length && (_bounceBackMinTime = newBounceBackMinTime);
    return _bounceBackMinTime;
  };
  this.bounceBackDistanceMulti = function(newBounceBackDistanceMult) {
    arguments.length && (_bounceBackDistanceMulti = newBounceBackDistanceMult);
    return _bounceBackDistanceMulti;
  };

  //Quicker than Math.floor
  //http://jsperf.com/math-floor-vs-math-round-vs-parseint/69
  function floor(n) { return n | 0; }

  this.$get = ['$dragger', '$transformer', '$window', '$document', '$desktopScroller', function($dragger, $transformer, $window, $document, $desktopScroller) {

    $scroller.getContentRect = function(raw) {
      var style = window.getComputedStyle(raw);
      var offTop = parseInt(style.getPropertyValue('margin-top'), 10) +
        parseInt(style.getPropertyValue('padding-top'), 10);
      var offBottom = parseInt(style.getPropertyValue('margin-bottom'), 10) +
        parseInt(style.getPropertyValue('padding-bottom'), 10);

      var top = parseInt(style.getPropertyValue('top'), 10);
      var bottom = parseInt(style.getPropertyValue('bottom'), 10);

      var height = parseInt(style.getPropertyValue('height'), 10);
      return {
        top: offTop + (isNaN(top) ? 0 : top),
        bottom: offBottom + (isNaN(bottom) ? 0 : bottom),
        height: height
      };
    };


    function bounceTime(howMuchOut) {
      return Math.abs(howMuchOut) * _bounceBackDistanceMulti + 
        _bounceBackMinTime;
    }

    /**
     * @ngdoc object
     * @name ajoslin.scrolly.$scroller
     *
     * @description
     * A factory for creating a scroll-manipulator on an element. Once called
     * on an element, it will listen to drag events and use those to change
     * the element's transform appropriately to simulate scrolling. 
     * Intended to look as close as possible to native iOS scrolling.
     *
     * @param {element} element Element to attach scroller to.
     * @returns {object} Newly created scroller object.
     *
     */

    function $scroller(elm) {
      var self = {};
      var currentScroller = elm.data('$scrolly.scroller');
      if (currentScroller) {
        return currentScroller;
      } else {
        elm.data('$scrolly.scroller', self);
      }

      var raw = elm[0];
      var transformer = self.transformer = new $transformer(elm);
      var dragger = self.dragger = new $dragger(elm, {
        touch: true,
        mouse: false
      });
      if (_supportDesktop) {
        var desktopScroller = new $desktopScroller(elm, self);
      }
      dragger.addListener($dragger.DIRECTION_VERTICAL, dragListener);
      elm.bind('$destroy', function() {
        dragger.removeListener($dragger.DIRECTION_VERTICAL, dragListener);
      });

      self.calculateHeight = function() {
        var rect = $scroller.getContentRect(raw);
        //TODO find a better way to get the height of the wrapper/screen
        var screenHeight = $window.innerHeight;
        //If our content doesn't fill the whole area, just act like it's
        //exactly one screen tall for scrolling purposes
        if (rect.height < screenHeight) {
          self.scrollHeight = 0;
        } else {
          self.scrollHeight = rect.height - screenHeight + rect.top + rect.bottom;
        }
        return self.scrollHeight;
      };
      self.calculateHeight();

      self.outOfBounds = function(pos) {
        if (pos > 0) return pos;
        if (pos < -self.scrollHeight) return pos + self.scrollHeight;
        return false;
      };

      function dragListener(eventType, data) {
        switch(eventType) {
          case 'start':
            if (transformer.changing) {
              transformer.stop();
            }
            self.calculateHeight();
            break;

          case 'move':
            var newPos = transformer.pos.y + data.delta.y;
            //If going past boundaries, scroll at half speed
            //TODO make the 0.5 a provider option
            if ( self.outOfBounds(newPos) ) {
              newPos = transformer.pos.y + floor(data.delta.y * 0.5);
            }
            transformer.setTo({y: newPos});
            break;

          case 'end':
            //If we're out of bounds, or held on to our spot for too long,
            //no momentum.  Just check that we're in bounds.
            if (self.outOfBounds(transformer.pos.y) || data.stopped) {
              self.checkBoundaries();
            } else if (Math.abs(data.distance.y) >= _minDistanceForAcceleration) {
              var momentum = self.momentum(data);
              if (momentum.position !== transformer.pos.y) {
                transformer.easeTo(
                  {y: momentum.position},
                  momentum.time,
                  self.checkBoundaries
                );
              }
            }
            break;
        }
      }
      self.checkBoundaries = function() {
        self.calculateHeight();

        var howMuchOut = self.outOfBounds(transformer.pos.y);
        if (howMuchOut) {
          var newPosition = howMuchOut > 0 ? 0 : -self.scrollHeight;
          transformer.easeTo({y: newPosition}, bounceTime(howMuchOut));
        } 
      };
      self.momentum = function(dragData) {
        self.calculateHeight();

        var speed = Math.abs(dragData.distance.y) / (dragData.updatedAt - dragData.startedAt);
        var newPos = transformer.pos.y + (speed * speed) /
          (2 * _decelerationRate) *
          (dragData.distance.y < 0 ? -1 : 1);
        var time = speed / _decelerationRate;

        var howMuchOver = self.outOfBounds(newPos);
        var distance;
        if (howMuchOver) {
          if (howMuchOver > 0) {
            newPos = Math.min(howMuchOver, _bounceBuffer);
          } else if (howMuchOver < 0) {
            newPos = Math.max(newPos, -(self.scrollHeight + _bounceBuffer));
          }
          distance = Math.abs(newPos - transformer.pos.y);
          time = distance / speed;
        }
        return {
          position: newPos,
          time: floor(time)
        };
      };

      return self;
    }

    return $scroller;
  }];

}]);
